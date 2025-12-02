/**
 * InterviewSocketService - Manages Socket.io connections for interview features
 * Handles WebRTC signaling, chat messages, recording notifications, and room management
 */
import { io } from 'socket.io-client';
import { getAccessToken } from '@/utils/token';

class InterviewSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.currentInterviewId = null;
    this.currentRoomId = null;
    this.eventHandlers = new Map();
    this.connectionPromise = null;
    this.currentUser = null;
    this.currentUserId = null;

    // Get Socket.io URL from environment
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    this.socketUrl = apiUrl.replace(/\/api$/, '');
  }

  /**
   * Register event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} event - Event name (optional)
   */
  removeAllListeners(event = null) {
    if (event) {
      this.eventHandlers.delete(event);
    } else {
      this.eventHandlers.clear();
    }
  }

  /**
   * Trigger event handlers
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  _triggerHandler(event, data) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[InterviewSocket] Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Connect to Socket.io server with JWT authentication
   * @param {string} token - JWT access token (optional)
   * @returns {Promise<void>}
   */
  async connect(token = null) {
    // If already connected, resolve immediately
    if (this.socket && this.isConnected) {
      console.log('[InterviewSocket] Already connected');
      return Promise.resolve();
    }

    // If already connecting, return existing promise
    if (this.isConnecting && this.connectionPromise) {
      console.log('[InterviewSocket] Connection in progress');
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      const authToken = token || getAccessToken();

      if (!authToken) {
        console.error('[InterviewSocket] No authentication token available');
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(new Error('No authentication token'));
        return;
      }

      console.log('[InterviewSocket] Connecting to:', this.socketUrl);

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('[InterviewSocket] Connection timeout');
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      // Create socket connection
      this.socket = io(this.socketUrl, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        path: '/socket.io',
      });

      // Connection successful
      this.socket.on('connect', () => {
        console.log('[InterviewSocket] Connected, socket ID:', this.socket.id);
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this._triggerHandler('onConnect', { socketId: this.socket.id });
        resolve();
      });

      // Listen for authentication success
      this.socket.on('auth:success', (data) => {
        console.log('[InterviewSocket] Auth success:', data);
        this.currentUserId = data.userId;
        this.currentUser = data.user;
        this._triggerHandler('onAuthSuccess', data);
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('[InterviewSocket] Connection error:', error.message);
        this.isConnected = false;
        this.reconnectAttempts++;

        this._triggerHandler('onConnectionError', {
          error,
          attempt: this.reconnectAttempts
        });

        if (this.reconnectAttempts === 1) {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(error);
        }
      });

      // Reconnection
      this.socket.io.on('reconnect_attempt', (attemptNumber) => {
        console.log(`[InterviewSocket] Reconnecting (${attemptNumber})...`);
        this._triggerHandler('onReconnecting', attemptNumber);
      });

      this.socket.io.on('reconnect', (attemptNumber) => {
        console.log(`[InterviewSocket] Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Rejoin interview room if we were in one
        if (this.currentInterviewId) {
          console.log('[InterviewSocket] Rejoining interview after reconnect');
          this.joinInterview(this.currentInterviewId);
        }

        this._triggerHandler('onReconnect', attemptNumber);
      });

      this.socket.io.on('reconnect_failed', () => {
        console.error('[InterviewSocket] Reconnection failed');
        this.isConnected = false;
        this._triggerHandler('onReconnectFailed');
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('[InterviewSocket] Disconnected:', reason);
        this.isConnected = false;
        this._triggerHandler('onDisconnect', reason);
      });

      // Setup interview event listeners
      this._setupInterviewListeners();
    });

    return this.connectionPromise;
  }

  /**
   * Setup listeners for interview-related events
   * @private
   */
  _setupInterviewListeners() {
    if (!this.socket) return;

    // Clear any existing listeners to prevent duplicates
    this._clearInterviewListeners();

    // ==================== Room Management ====================

    // User joined interview
    this.socket.on('interview:user-joined', (data) => {
      console.log('[InterviewSocket] User joined:', data);
      this._triggerHandler('onUserJoined', data);
    });

    // User left interview
    this.socket.on('interview:user-left', (data) => {
      console.log('[InterviewSocket] User left:', data);
      this._triggerHandler('onUserLeft', data);
    });

    // Peer disconnected abruptly
    this.socket.on('interview:peer-disconnected', (data) => {
      console.log('[InterviewSocket] Peer disconnected abruptly:', data);
      this._triggerHandler('onPeerDisconnected', data);
    });

    // ==================== WebRTC Signaling ====================

    // Received WebRTC offer
    this.socket.on('interview:offer', (data) => {
      console.log('[InterviewSocket] Received offer from:', data.from);
      this._triggerHandler('onOffer', data);
    });

    // Received WebRTC answer
    this.socket.on('interview:answer', (data) => {
      console.log('[InterviewSocket] Received answer from:', data.from);
      this._triggerHandler('onAnswer', data);
    });

    // Received ICE candidate
    this.socket.on('interview:ice-candidate', (data) => {
      console.log('[InterviewSocket] Received ICE candidate from:', data.from);
      this._triggerHandler('onIceCandidate', data);
    });

    // Received generic WebRTC signal
    this.socket.on('interview:signal', (data) => {
      console.log('[InterviewSocket] Received signal from:', data.from, data.signal?.type || 'candidate');
      this._triggerHandler('onSignal', data);
    });

    // Connection state update
    this.socket.on('interview:connection-state', (data) => {
      console.log('[InterviewSocket] Connection state update:', data);
      this._triggerHandler('onConnectionState', data);
    });

    // ==================== Chat Messages ====================

    // New chat message
    this.socket.on('interview:chat-message', (data) => {
      console.log('[InterviewSocket] Chat message received:', data);
      this._triggerHandler('onChatMessage', data);
    });

    // Received emoji
    this.socket.on('interview:emoji', (data) => {
      console.log('[InterviewSocket] Emoji received:', data);
      this._triggerHandler('onEmoji', data);
    });

    // Media state changed
    this.socket.on('interview:media-state', (data) => {
      console.log('[InterviewSocket] Media state changed:', data);
      this._triggerHandler('onMediaStateChanged', data);
    });

    // ==================== Recording Events ====================

    // Recording started
    this.socket.on('interview:recording-started', (data) => {
      console.log('[InterviewSocket] Recording started:', data);
      this._triggerHandler('onRecordingStarted', data);
    });

    // Recording stopped
    this.socket.on('interview:recording-stopped', (data) => {
      console.log('[InterviewSocket] Recording stopped:', data);
      this._triggerHandler('onRecordingStopped', data);
    });

    // ==================== Interview Control ====================

    // Interview started
    this.socket.on('interview:started', (data) => {
      console.log('[InterviewSocket] Interview started:', data);
      this._triggerHandler('onInterviewStarted', data);
    });

    // Interview ended
    this.socket.on('interview:ended', (data) => {
      console.log('[InterviewSocket] Interview ended:', data);
      this._triggerHandler('onInterviewEnded', data);
    });

    // ==================== Connection Quality ====================

    // Connection quality update
    this.socket.on('interview:connection-quality', (data) => {
      console.log('[InterviewSocket] Connection quality:', data);
      this._triggerHandler('onConnectionQuality', data);
    });

    // ==================== Error Handling ====================

    // Interview error
    this.socket.on('interview:error', (error) => {
      console.error('[InterviewSocket] Interview error:', error);
      this._triggerHandler('onInterviewError', error);
    });
  }

  /**
   * Join an interview room
   * @param {string} interviewId - Interview ID to join
   * @param {object} userData - User data (name, role, etc.)
   * @returns {Promise<object>} Server response
   */
  joinInterview(interviewId, userData = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('[InterviewSocket] Joining interview:', interviewId);
      this.currentInterviewId = interviewId;

      const timeout = setTimeout(() => {
        reject(new Error('Join interview timeout'));
      }, 10000);

      this.socket.emit('interview:join',
        {
          roomId: interviewId, // Backend expects both roomId and interviewId
          interviewId,
          ...userData
        },
        (response) => {
          clearTimeout(timeout);
          if (response.success) {
            this.currentRoomId = response.roomId;
            console.log('[InterviewSocket] Joined interview room:', response.roomId);
            resolve(response);
          } else {
            console.error('[InterviewSocket] Failed to join:', response);
            reject(new Error(response.error || 'Failed to join interview'));
          }
        }
      );
    });
  }

  /**
   * Leave current interview room
   * @param {string} interviewId - Interview ID to leave (optional, uses current if not provided)
   */
  leaveInterview(interviewId = null) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot leave: not connected');
      return;
    }

    const id = interviewId || this.currentInterviewId;
    if (!id) {
      console.warn('[InterviewSocket] No interview to leave');
      return;
    }

    console.log('[InterviewSocket] Leaving interview:', id);
    this.socket.emit('interview:leave', { interviewId: id });

    this.currentInterviewId = null;
    this.currentRoomId = null;
  }

  /**
   * Send WebRTC offer (Native WebRTC)
   * @param {string} interviewId - Interview ID
   * @param {RTCSessionDescriptionInit} offer - WebRTC offer
   * @param {string} to - Target user ID (optional)
   */
  sendOffer(interviewId, offer, to = null) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send offer: not connected');
      return;
    }

    console.log('[InterviewSocket] Sending offer to interview:', interviewId);
    this.socket.emit('interview:offer', {
      interviewId,
      roomId: this.currentRoomId || interviewId,
      offer,
      to
    });
  }

  /**
   * Send WebRTC answer (Native WebRTC)
   * @param {string} interviewId - Interview ID
   * @param {RTCSessionDescriptionInit} answer - WebRTC answer
   * @param {string} to - Target user ID
   */
  sendAnswer(interviewId, answer, to) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send answer: not connected');
      return;
    }

    console.log('[InterviewSocket] Sending answer to interview:', interviewId);
    this.socket.emit('interview:answer', {
      interviewId,
      roomId: this.currentRoomId || interviewId,
      answer,
      to
    });
  }

  /**
   * Send ICE candidate (Native WebRTC)
   * @param {string} interviewId - Interview ID
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   * @param {string} to - Target user ID (optional)
   */
  sendIceCandidate(interviewId, candidate, to = null) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send ICE candidate: not connected');
      return;
    }

    console.log('[InterviewSocket] Sending ICE candidate');
    this.socket.emit('interview:ice-candidate', {
      interviewId,
      roomId: this.currentRoomId || interviewId,
      candidate,
      to
    });
  }

  /**
   * Send WebRTC signal
   * Signal can be offer, answer, or ICE candidate
   * @param {string} interviewId - Interview ID
   * @param {object} signal - WebRTC signal data
   * @param {string} to - Target user ID (optional)
   */
  sendSignal(interviewId, signal, to = null) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send signal: not connected');
      console.warn('[InterviewSocket] Socket exists:', !!this.socket);
      console.warn('[InterviewSocket] Is connected:', this.isConnected);
      return;
    }

    console.log('[InterviewSocket] Sending signal:', signal.type || 'candidate', to ? `to ${to}` : 'to room');
    console.log('[InterviewSocket] Signal data:', {
      interviewId,
      roomId: this.currentRoomId,
      signalType: signal.type,
      to
    });

    // Use unified interview:signal event for all signal types
    this.socket.emit('interview:signal', {
      interviewId,
      roomId: this.currentRoomId,
      signal,
      to
    });

    console.log('[InterviewSocket] Signal emitted successfully');
  }

  /**
   * Send connection state update
   * @param {string} interviewId - Interview ID
   * @param {string} state - Connection state
   */
  sendConnectionState(interviewId, state) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send state: not connected');
      return;
    }

    this.socket.emit('interview:connection-state', {
      interviewId,
      roomId: this.currentRoomId,
      state
    });
  }

  /**
   * Send chat message
   * @param {string} interviewId - Interview ID
   * @param {string} message - Message content
   * @returns {Promise<object>} Server response
   */
  sendChatMessage(interviewId, message) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('[InterviewSocket] Sending chat message');

      const timeout = setTimeout(() => {
        reject(new Error('Send message timeout'));
      }, 10000);

      this.socket.emit('interview:chat-message',
        {
          roomId: interviewId, // Use interviewId as roomId
          interviewId,
          message
        },
        (response) => {
          clearTimeout(timeout);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Failed to send message'));
          }
        }
      );
    });
  }

  /**
   * Send emoji reaction
   * @param {string} interviewId - Interview ID
   * @param {string} emoji - Emoji character
   */
  sendEmoji(interviewId, emoji) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send emoji: not connected');
      return;
    }

    this.socket.emit('interview:emoji', {
      roomId: this.currentRoomId || interviewId,
      interviewId,
      emoji
    });
  }

  /**
   * Notify media state changed (audio/video toggle)
   * @param {string} interviewId - Interview ID
   * @param {boolean} isAudioEnabled - Is audio enabled
   * @param {boolean} isVideoEnabled - Is video enabled
   */
  notifyMediaStateChanged(interviewId, isAudioEnabled, isVideoEnabled) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot notify media state - socket not connected');
      return;
    }

    console.log('[InterviewSocket] Notifying media state changed:', { isAudioEnabled, isVideoEnabled });

    this.socket.emit('interview:media-state', {
      roomId: this.currentRoomId || interviewId,
      interviewId,
      isAudioEnabled,
      isVideoEnabled
    });
  }

  /**
   * Notify that recording started
   * @param {string} interviewId - Interview ID
   */
  notifyRecordingStarted(interviewId) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot notify: not connected');
      return;
    }

    console.log('[InterviewSocket] Notifying recording started');
    this.socket.emit('interview:start-recording', {
      interviewId,
      roomId: this.currentRoomId
    });
  }

  /**
   * Notify that recording stopped
   * @param {string} interviewId - Interview ID
   * @param {number} duration - Recording duration in seconds
   */
  notifyRecordingStopped(interviewId, duration = 0) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot notify: not connected');
      return;
    }

    console.log('[InterviewSocket] Notifying recording stopped');
    this.socket.emit('interview:stop-recording', {
      interviewId,
      roomId: this.currentRoomId,
      duration
    });
  }

  /**
   * Send connection quality metrics
   * @param {string} interviewId - Interview ID
   * @param {object} metrics - Quality metrics
   */
  sendConnectionQuality(interviewId, metrics) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('interview:connection-quality', {
      interviewId,
      roomId: this.currentRoomId,
      metrics
    });
  }

  /**
   * Notify interview end
   * @param {string} interviewId - Interview ID
   */
  notifyInterviewEnd(interviewId) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot notify: not connected');
      return;
    }

    console.log('[InterviewSocket] Notifying interview end');
    this.socket.emit('interview:end', {
      interviewId,
      roomId: this.currentRoomId
    });
  }

  /**
   * Clear all interview event listeners
   * @private
   */
  _clearInterviewListeners() {
    if (!this.socket) return;

    const events = [
      'interview:user-joined',
      'interview:user-left',
      'interview:peer-disconnected',
      'interview:offer',
      'interview:answer',
      'interview:ice-candidate',
      'interview:signal',
      'interview:connection-state',
      'interview:chat-message',
      'interview:recording-started',
      'interview:recording-stopped',
      'interview:started',
      'interview:ended',
      'interview:connection-quality',
      'interview:error',
      'interview:emoji'
    ];

    events.forEach(event => {
      this.socket.off(event);
    });

    console.log('[InterviewSocket] Cleared all interview listeners');
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isSocketConnected() {
    return this.isConnected && this.socket !== null;
  }

  /**
   * Get socket instance
   * @returns {Socket|null} Socket.io instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Get current interview ID
   * @returns {string|null} Current interview ID
   */
  getCurrentInterviewId() {
    return this.currentInterviewId;
  }

  /**
   * Get current room ID
   * @returns {string|null} Current room ID
   */
  getCurrentRoomId() {
    return this.currentRoomId;
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.currentInterviewId) {
      this.leaveInterview();
    }

    if (this.socket) {
      console.log('[InterviewSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.currentInterviewId = null;
      this.currentRoomId = null;
    }
  }

  /**
   * Get current user ID (from JWT decode)
   * @returns {string} Current user ID
   */
  getCurrentUserId() {
    return this.currentUserId;
  }

  /**
   * Get current user info
   * @returns {object} Current user info
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Reset the service
   */
  reset() {
    this.disconnect();
    this.eventHandlers.clear();
    this.connectionPromise = null;
    this.isConnecting = false;
  }
}

// Export singleton instance
const interviewSocketService = new InterviewSocketService();
export default interviewSocketService;
