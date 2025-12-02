import { io } from 'socket.io-client';
import { getAccessToken } from '@/utils/token';

/**
 * SocketService - Singleton service for managing Socket.io connections
 * Handles real-time messaging with auto-reconnect and exponential backoff
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelays = [1000, 2000, 4000, 8000, 30000]; // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    this.eventHandlers = new Map();
    this.connectionPromise = null;

    // Typing indicator debounce timers (300ms debounce)
    this.typingTimers = new Map();
    this.TYPING_DEBOUNCE_MS = 300;

    // Get Socket.io URL from environment
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    // Extract base URL (remove /api suffix if present)
    this.socketUrl = apiUrl.replace(/\/api$/, '');
  }

  /**
   * Establish Socket.io connection with JWT authentication
   * @param {string} token - JWT access token (optional, will use stored token if not provided)
   * @returns {Promise<void>}
   */
  connect(token = null) {
    // If already connected, resolve immediately
    if (this.socket && this.isConnected) {
      console.log('[SocketService] Already connected');
      return Promise.resolve();
    }

    // If already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      console.log('[SocketService] Connection already in progress');
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      // Get token from parameter or storage
      const authToken = token || getAccessToken();

      if (!authToken) {
        console.error('[SocketService] No authentication token available');
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(new Error('No authentication token'));
        return;
      }

      console.log('[SocketService] Connecting to:', this.socketUrl);

      // Set a timeout for initial connection
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('[SocketService] Connection timeout after 10 seconds');
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      // Create socket connection with authentication
      this.socket = io(this.socketUrl, {
        auth: {
          token: authToken
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        timeout: 20000,
        path: '/socket.io',
      });

      // Connection successful
      this.socket.on('connect', () => {
        console.log('[SocketService] Connected with socket ID:', this.socket.id);
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Trigger connection success callback
        this._triggerHandler('onConnect');
        resolve();
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('[SocketService] Connection error:', error.message, error);
        this.isConnected = false;

        // Calculate reconnect delay with exponential backoff
        const delayIndex = Math.min(this.reconnectAttempts, this.reconnectDelays.length - 1);
        const delay = this.reconnectDelays[delayIndex];

        console.log(`[SocketService] Will reconnect (attempt ${this.reconnectAttempts + 1}), waiting ${delay}ms`);

        // Trigger connection error callback with delay info
        this._triggerHandler('onConnectionError', {
          error,
          attempt: this.reconnectAttempts + 1,
          nextDelay: delay
        });

        // Only reject on first connection attempt, otherwise let auto-reconnect handle it
        if (this.reconnectAttempts === 0) {
          this.reconnectAttempts++;
          this.isConnecting = false;
          this.connectionPromise = null;
          clearTimeout(connectionTimeout);
          console.error('[SocketService] First connection attempt failed, rejecting promise');
          reject(error);
        } else {
          this.reconnectAttempts++;
          console.log('[SocketService] Subsequent connection attempt failed, letting auto-reconnect handle it');
        }
      });

      // Reconnection attempt
      this.socket.io.on('reconnect_attempt', (attemptNumber) => {
        console.log(`[SocketService] Reconnection attempt ${attemptNumber}`);
        this._triggerHandler('onReconnecting', attemptNumber);
      });

      // Reconnection successful
      this.socket.io.on('reconnect', (attemptNumber) => {
        console.log(`[SocketService] Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._triggerHandler('onReconnect', attemptNumber);
      });

      // Reconnection failed
      this.socket.io.on('reconnect_failed', () => {
        console.error('[SocketService] Reconnection failed after max attempts');
        this.isConnected = false;
        this._triggerHandler('onReconnectFailed');
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('[SocketService] Disconnected:', reason);
        this.isConnected = false;
        this._triggerHandler('onDisconnect', reason);
      });

      // Setup message event listeners
      this._setupMessageListeners();
    });

    return this.connectionPromise;
  }

  /**
   * Setup listeners for message-related events
   * @private
   */
  _setupMessageListeners() {
    if (!this.socket) return;

    // New message received
    this.socket.on('message:new', (message) => {
      console.log('[SocketService] New message received:', message);
      this._triggerHandler('onNewMessage', message);
    });

    // Message read receipt
    this.socket.on('chat:messageRead', (data) => {
      console.log('[SocketService] Message read:', data);
      this._triggerHandler('onMessageRead', data);
    });

    // Typing indicators
    this.socket.on('chat:typing:start', (data) => {
      console.log('[SocketService] User typing:', data.userId);
      this._triggerHandler('onTypingStart', data);
    });

    this.socket.on('chat:typing:stop', (data) => {
      console.log('[SocketService] User stopped typing:', data.userId);
      this._triggerHandler('onTypingStop', data);
    });

    // User presence
    this.socket.on('user:presence', (data) => {
      console.log('[SocketService] User presence update:', data);
      this._triggerHandler('onUserPresence', data);
    });

    // Conversation created
    this.socket.on('conversation:created', (data) => {
      console.log('[SocketService] Conversation created:', data);
      this._triggerHandler('onConversationCreated', data);
    });

    // Online users list
    this.socket.on('online:users', (users) => {
      console.log('[SocketService] Online users list:', users);
      this._triggerHandler('onOnlineUsers', users);
    });

    // Error events
    this.socket.on('chat:error', (error) => {
      console.error('[SocketService] Chat error:', error);
      this._triggerHandler('onChatError', error);
    });

    // General notification event
    this.socket.on('notification:new', (notification) => {
      console.log('[SocketService] New notification received:', notification);
      this._triggerHandler('onNewNotification', notification);
    });
  }

  /**
   * Disconnect from Socket.io server gracefully
   */
  disconnect() {
    if (this.socket) {
      console.log('[SocketService] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }

    // Always reset state
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    // Do not clear event handlers here as they may be needed by other components
    // this.eventHandlers.clear();
  }

  /**
   * Join a conversation room
   * @param {string} conversationId - Conversation ID to join
   */
  joinConversation(conversationId) {
    if (!this.socket || !this.isConnected) {
      console.warn('[SocketService] Cannot join conversation: not connected');
      return;
    }

    console.log('[SocketService] Joining conversation:', conversationId);
    this.socket.emit('conversation:join', { conversationId });
  }

  /**
   * Leave a conversation room
   * @param {string} conversationId - Conversation ID to leave
   */
  leaveConversation(conversationId) {
    if (!this.socket || !this.isConnected) {
      console.warn('[SocketService] Cannot leave conversation: not connected');
      return;
    }

    console.log('[SocketService] Leaving conversation:', conversationId);
    this.socket.emit('conversation:leave', { conversationId });
  }

  /**
   * Send a message through Socket.io
   * @param {string} conversationId - Conversation ID
   * @param {string} content - Message content
   * @param {string} tempMessageId - Temporary message ID for optimistic updates
   * @param {string} type - Message type (default: 'text')
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Server response with saved message
   */
  sendMessage(conversationId, content, tempMessageId, type = 'text', metadata = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('[SocketService] Sending message:', { conversationId, content, tempMessageId });

      // Set timeout for response
      const timeout = setTimeout(() => {
        console.error('[SocketService] Message send timeout - no response from server');
        reject(new Error('Timeout: Server did not respond'));
      }, 10000); // 10 second timeout

      // Emit message with callback
      this.socket.emit('message:send',
        {
          conversationId,
          content,
          type,
          metadata,
          tempMessageId
        },
        (response) => {
          clearTimeout(timeout);
          console.log('[SocketService] Message sent, server response:', response);
          if (response.success) {
            console.log('[SocketService] Message sent successfully:', response.message);
            resolve(response);
          } else {
            console.error('[SocketService] Message send failed:', response.message);
            reject(new Error(response.message || 'Failed to send message'));
          }
        }
      );
    });
  }

  /**
   * Mark messages as read
   * @param {string[]} messageIds - Array of message IDs to mark as read
   * @param {string} senderId - ID of the original message sender
   */
  markMessagesAsRead(messageIds, senderId) {
    if (!this.socket || !this.isConnected) {
      console.warn('[SocketService] Cannot mark messages as read: not connected');
      return;
    }

    console.log('[SocketService] Marking messages as read:', messageIds);
    this.socket.emit('chat:markRead', { messageIds, senderId });
  }

  /**
   * Start typing indicator
   * @param {string} conversationId - Conversation ID
   */
  startTyping(conversationId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('chat:typing:start', { conversationId });
  }

  /**
   * Stop typing indicator
   * @param {string} conversationId - Conversation ID
   */
  stopTyping(conversationId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('chat:typing:stop', { conversationId });
  }

  /**
   * Request list of online users
   */
  getOnlineUsers() {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit('get:online:users');
  }

  /**
   * Register event handler
   * @param {string} eventName - Event name (e.g., 'onNewMessage')
   * @param {function} callback - Callback function
   */
  on(eventName, callback) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(callback);
  }

  /**
   * Unregister event handler
   * @param {string} eventName - Event name
   * @param {function} callback - Callback function to remove
   */
  off(eventName, callback) {
    if (!this.eventHandlers.has(eventName)) {
      return;
    }

    const handlers = this.eventHandlers.get(eventName);
    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Trigger registered event handlers
   * @private
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  _triggerHandler(eventName, data) {
    if (!this.eventHandlers.has(eventName)) {
      return;
    }

    const handlers = this.eventHandlers.get(eventName);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[SocketService] Error in ${eventName} handler:`, error);
      }
    });
  }

  /**
   * Convenience methods for registering event handlers
   */
  onNewMessage(callback) {
    this.on('onNewMessage', callback);
  }

  onNewNotification(callback) {
    this.on('onNewNotification', callback);
  }

  onMessageRead(callback) {
    this.on('onMessageRead', callback);
  }

  onTypingStart(callback) {
    this.on('onTypingStart', callback);
  }

  onTypingStop(callback) {
    this.on('onTypingStop', callback);
  }

  onUserPresence(callback) {
    this.on('onUserPresence', callback);
  }

  onConversationCreated(callback) {
    this.on('onConversationCreated', callback);
  }

  onOnlineUsers(callback) {
    this.on('onOnlineUsers', callback);
  }

  onConnect(callback) {
    this.on('onConnect', callback);
  }

  onDisconnect(callback) {
    this.on('onDisconnect', callback);
  }

  onConnectionError(callback) {
    this.on('onConnectionError', callback);
  }

  onReconnecting(callback) {
    this.on('onReconnecting', callback);
  }

  onReconnect(callback) {
    this.on('onReconnect', callback);
  }

  onReconnectFailed(callback) {
    this.on('onReconnectFailed', callback);
  }

  onChatError(callback) {
    this.on('onChatError', callback);
  }

  /**
   * Get connection status
   * @returns {boolean} True if connected
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get socket instance (use with caution)
   * @returns {Socket|null} Socket.io client instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Sync missed messages after reconnection
   * @param {string} conversationId - Conversation ID to sync
   * @param {string} lastMessageTimestamp - Timestamp of last received message
   * @returns {Promise<Array>} Array of missed messages
   */
  async syncMissedMessages(conversationId, lastMessageTimestamp) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('[SocketService] Syncing missed messages for conversation:', conversationId);

      this.socket.emit('messages:sync',
        {
          conversationId,
          since: lastMessageTimestamp
        },
        (response) => {
          if (response.success) {
            console.log('[SocketService] Synced missed messages:', response.messages?.length || 0);
            resolve(response.messages || []);
          } else {
            console.error('[SocketService] Failed to sync messages:', response.message);
            reject(new Error(response.message || 'Failed to sync messages'));
          }
        }
      );
    });
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
