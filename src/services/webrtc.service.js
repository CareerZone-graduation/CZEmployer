/**
 * WebRTCService using Native WebRTC API for Recruiter
 * Native WebRTC connection management
 */

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.connectionState = 'disconnected';
    this.eventHandlers = new Map();
    this.isInitiator = false;
    
    // Track processed signals to prevent duplicates
    this.processedSignals = new Map(); // Map<signalType, timestamp>
    this.signalDebounceTime = 1000; // 1 second debounce
    
    // ICE servers configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    };
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister event handler
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
   * Trigger event handlers
   * @private
   */
  _triggerHandler(event, data) {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[WebRTC] Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      console.log('[WebRTC] Requesting user media with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) {
        console.log('[WebRTC] Using video device:', videoTrack.label);
      }
      if (audioTrack) {
        console.log('[WebRTC] Using audio device:', audioTrack.label);
      }
      
      console.log('[WebRTC] Got local stream successfully');
      return stream;
    } catch (error) {
      console.error('[WebRTC] Failed to get user media with initial constraints:', error);
      
      // If the error is OverconstrainedError, try with minimal constraints
      if (error.name === 'OverconstrainedError') {
        console.warn('[WebRTC] OverconstrainedError detected, trying minimal constraints');
        try {
          const minimalConstraints = { video: true, audio: true };
          const stream = await navigator.mediaDevices.getUserMedia(minimalConstraints);
          this.localStream = stream;
          
          console.log('[WebRTC] Got local stream with minimal constraints');
          return stream;
        } catch (fallbackError) {
          console.error('[WebRTC] Failed with minimal constraints too:', fallbackError);
        }
      }
      
      this._triggerHandler('onError', {
        type: 'media-access',
        error,
        message: 'Không thể truy cập camera/microphone'
      });
      throw error;
    }
  }

  /**
   * Initialize peer connection as initiator (recruiter initiates call)
   * @param {MediaStream} stream - Local media stream
   */
  async initializePeerConnection(stream) {
    try {
      console.log('[WebRTC] Initializing peer connection as initiator (recruiter)');
      
      // Prevent multiple initializations
      if (this.peerConnection && this.peerConnection.connectionState !== 'closed') {
        console.warn('[WebRTC] Peer connection already exists, skipping initialization');
        return this.peerConnection;
      }

      if (this.peerConnection) {
        console.log('[WebRTC] Closing existing peer connection');
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.localStream = stream;
      this.connectionState = 'connecting';
      this.isInitiator = true;

      // Create RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(this.config);
      console.log('[WebRTC] RTCPeerConnection created');

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('[WebRTC] Adding track:', track.kind);
        this.peerConnection.addTrack(track, stream);
      });

      // Setup event handlers
      this._setupPeerConnectionHandlers();

      // Create and send offer
      console.log('[WebRTC] Creating offer...');
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection.setLocalDescription(offer);
      console.log('[WebRTC] Local description set (offer)');
      console.log('[WebRTC] Offer SDP:', offer.sdp);

      // Send offer via signaling (trickle ICE enabled - send immediately)
      console.log('[WebRTC] Triggering onSignal event with offer');
      console.log('[WebRTC] Event handlers registered:', Array.from(this.eventHandlers.keys()));
      this._triggerHandler('onSignal', {
        type: 'offer',
        sdp: offer.sdp
      });
      console.log('[WebRTC] onSignal event triggered');

      console.log('[WebRTC] Peer connection initialized successfully');
      this._triggerHandler('onConnectionInitialized');

      return this.peerConnection;
    } catch (error) {
      console.error('[WebRTC] Failed to initialize peer connection:', error);
      this._triggerHandler('onError', { 
        type: 'initialization', 
        error,
        message: 'Không thể khởi tạo kết nối WebRTC'
      });
      throw error;
    }
  }

  /**
   * Setup event handlers for RTCPeerConnection
   * @private
   */
  _setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    // ICE candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] ICE candidate generated');
        this._triggerHandler('onSignal', {
          type: 'candidate',
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid
        });
      } else {
        console.log('[WebRTC] ICE gathering complete');
      }
    };

    // Track event - remote stream received
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      
      if (event.streams && event.streams[0]) {
        if (!this.remoteStream) {
          console.log('[WebRTC] Setting remote stream');
          this.remoteStream = event.streams[0];
          this._triggerHandler('onRemoteStream', this.remoteStream);
        }
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('[WebRTC] Connection state:', state);
      this.connectionState = state;

      if (state === 'connected') {
        console.log('[WebRTC] Connection established!');
        this._triggerHandler('onConnectionEstablished');
      } else if (state === 'disconnected') {
        console.log('[WebRTC] Connection disconnected');
        this._triggerHandler('onConnectionClosed');
      } else if (state === 'failed') {
        console.error('[WebRTC] Connection failed');
        this._triggerHandler('onError', {
          type: 'connection-failed',
          message: 'Kết nối WebRTC thất bại'
        });
      } else if (state === 'closed') {
        console.log('[WebRTC] Connection closed');
        this._triggerHandler('onConnectionClosed');
      }
    };

    // ICE connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState;
      console.log('[WebRTC] ICE connection state:', state);
      
      if (state === 'failed' || state === 'disconnected') {
        console.warn('[WebRTC] ICE connection issue:', state);
      }
    };

    // Signaling state change
    this.peerConnection.onsignalingstatechange = () => {
      console.log('[WebRTC] Signaling state:', this.peerConnection.signalingState);
    };
  }

  /**
   * Handle signal from remote peer (offer, answer, or ice candidate)
   * @param {Object} signal - Signal data from remote peer
   */
  async handleSignal(signal) {
    try {
      if (!signal || typeof signal !== 'object') {
        console.warn('[WebRTC] Invalid signal data, ignoring:', signal);
        return;
      }

      if (!this.peerConnection) {
        console.warn('[WebRTC] Peer connection not initialized');
        return;
      }

      const signalType = signal.type;
      console.log('[WebRTC] ===== Handling Signal =====');
      console.log('[WebRTC] Signal type:', signalType);
      console.log('[WebRTC] Current signaling state:', this.peerConnection.signalingState);
      
      // Debounce offer/answer signals to prevent duplicates (but not ICE candidates)
      if (signalType === 'offer' || signalType === 'answer') {
        const now = Date.now();
        const lastProcessed = this.processedSignals.get(signalType);
        
        if (lastProcessed && (now - lastProcessed) < this.signalDebounceTime) {
          console.log(`[WebRTC] Ignoring duplicate ${signalType} signal (debounced)`);
          return;
        }
        
        this.processedSignals.set(signalType, now);
      }

      if (signalType === 'offer') {
        // Candidate receives offer from recruiter
        console.log('[WebRTC] Received offer, creating answer...');
        
        const offerDesc = new RTCSessionDescription({
          type: 'offer',
          sdp: signal.sdp
        });
        
        await this.peerConnection.setRemoteDescription(offerDesc);
        console.log('[WebRTC] Remote description set (offer)');

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        console.log('[WebRTC] Local description set (answer)');

        // Send answer back
        this._triggerHandler('onSignal', {
          type: 'answer',
          sdp: answer.sdp
        });
        
      } else if (signalType === 'answer') {
        // Recruiter receives answer from candidate
        console.log('[WebRTC] Received answer from candidate');
        console.log('[WebRTC] Current signaling state:', this.peerConnection.signalingState);
        
        // Check if we're in the correct state to receive answer
        if (this.peerConnection.signalingState === 'stable') {
          console.log('[WebRTC] Already in stable state, ignoring duplicate answer');
          return;
        }
        
        if (this.peerConnection.signalingState !== 'have-local-offer') {
          console.warn('[WebRTC] Wrong state for answer:', this.peerConnection.signalingState, '- expected have-local-offer');
          return;
        }

        const answerDesc = new RTCSessionDescription({
          type: 'answer',
          sdp: signal.sdp
        });
        
        await this.peerConnection.setRemoteDescription(answerDesc);
        console.log('[WebRTC] Remote description set (answer) - connection established');
        
      } else if (signalType === 'candidate') {
        // ICE candidate
        if (!signal.candidate) {
          console.log('[WebRTC] Ignoring empty candidate');
          return;
        }

        console.log('[WebRTC] Adding ICE candidate');
        const candidate = new RTCIceCandidate({
          candidate: signal.candidate,
          sdpMLineIndex: signal.sdpMLineIndex,
          sdpMid: signal.sdpMid
        });
        
        await this.peerConnection.addIceCandidate(candidate);
        console.log('[WebRTC] ICE candidate added successfully');
        
      } else {
        console.warn('[WebRTC] Unknown signal type:', signalType);
      }
      
    } catch (error) {
      console.error('[WebRTC] Failed to handle signal:', error);
      this._triggerHandler('onError', {
        type: 'signal-handling',
        error,
        message: 'Không thể xử lý tín hiệu kết nối'
      });
    }
  }

  /**
   * Toggle audio track
   */
  async toggleAudio(enabled) {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];

    if (enabled) {
      if (audioTrack && audioTrack.readyState === 'live') {
        audioTrack.enabled = true;
        console.log('[WebRTC] Audio enabled');
        return true;
      }
      try {
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};
        
        const audioConstraints = deviceSettings.audioDeviceId 
          ? { 
              deviceId: { exact: deviceSettings.audioDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          : { 
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            };
        
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        const newTrack = newStream.getAudioTracks()[0];
        console.log('[WebRTC] Toggling audio ON with device:', newTrack.label);
        
        // Replace track in peer connection
        if (this.peerConnection) {
          const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'audio');
          if (sender) {
            await sender.replaceTrack(newTrack);
          }
        }
        
        if (audioTrack) {
          audioTrack.stop();
          this.localStream.removeTrack(audioTrack);
        }
        this.localStream.addTrack(newTrack);
        
        console.log('[WebRTC] Audio enabled with new track');
        this._triggerHandler('onLocalStreamUpdate', this.localStream);
        return true;
      } catch (error) {
        console.error('[WebRTC] Failed to enable audio:', error);
        this._triggerHandler('onError', { 
          type: 'media-access', 
          error, 
          message: 'Không thể bật microphone' 
        });
        return false;
      }
    } else {
      if (audioTrack) {
        audioTrack.enabled = false;
      }
      console.log('[WebRTC] Audio disabled');
      return true;
    }
  }

  /**
   * Toggle video track
   */
  async toggleVideo(enabled) {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    console.log('[WebRTC] Toggle video:', enabled);
    console.log('[WebRTC] Video track exists:', !!videoTrack);
    if (videoTrack) {
      console.log('[WebRTC] Video track readyState:', videoTrack.readyState);
      console.log('[WebRTC] Video track enabled:', videoTrack.enabled);
    }

    if (enabled) {
      // Always get new track when enabling to ensure proper display
      try {
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};
        
        const videoConstraints = deviceSettings.videoDeviceId
          ? { deviceId: { exact: deviceSettings.videoDeviceId } }
          : true;
        
        console.log('[WebRTC] Getting new video track with constraints:', videoConstraints);
        const newStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        const newTrack = newStream.getVideoTracks()[0];
        console.log('[WebRTC] Got new video track:', newTrack.label);
        
        // Replace track in peer connection
        if (this.peerConnection) {
          const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newTrack);
          }
        }
        
        // Stop old track and update stream
        if (videoTrack) {
          console.log('[WebRTC] Stopping old video track');
          videoTrack.stop();
          this.localStream.removeTrack(videoTrack);
        }
        this.localStream.addTrack(newTrack);
        
        console.log('[WebRTC] Video enabled with new track, triggering UI update');
        this._triggerHandler('onLocalStreamUpdate', this.localStream);
        return true;
      } catch (error) {
        console.error('[WebRTC] Failed to enable video:', error);
        this._triggerHandler('onError', { 
          type: 'media-access', 
          error, 
          message: 'Không thể bật camera' 
        });
        return false;
      }
    } else {
      if (videoTrack) {
        console.log('[WebRTC] Disabling video track');
        videoTrack.enabled = false;
        console.log('[WebRTC] Video track enabled set to false');
        // Trigger update to refresh UI when disabling
        this._triggerHandler('onLocalStreamUpdate', this.localStream);
      }
      console.log('[WebRTC] Video disabled');
      return true;
    }
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId) {
    try {
      console.log('[WebRTC] Switching camera to:', deviceId);
      
      const videoTrack = this.localStream?.getVideoTracks()[0];
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      
      const newTrack = newStream.getVideoTracks()[0];
      console.log('[WebRTC] New camera:', newTrack.label);
      
      // Replace track in peer connection
      if (this.peerConnection && videoTrack) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newTrack);
        }
      }
      
      if (videoTrack) {
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
      }
      this.localStream.addTrack(newTrack);
      
      this._triggerHandler('onLocalStreamUpdate', this.localStream);
      console.log('[WebRTC] Camera switched successfully');
      
      return true;
    } catch (error) {
      console.error('[WebRTC] Failed to switch camera:', error);
      this._triggerHandler('onError', { 
        type: 'media-access', 
        error, 
        message: 'Không thể chuyển camera' 
      });
      return false;
    }
  }

  /**
   * Switch microphone device
   */
  async switchMicrophone(deviceId) {
    try {
      console.log('[WebRTC] Switching microphone to:', deviceId);
      
      const audioTrack = this.localStream?.getAudioTracks()[0];
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const newTrack = newStream.getAudioTracks()[0];
      console.log('[WebRTC] New microphone:', newTrack.label);
      
      // Replace track in peer connection
      if (this.peerConnection && audioTrack) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'audio');
        if (sender) {
          await sender.replaceTrack(newTrack);
        }
      }
      
      if (audioTrack) {
        audioTrack.stop();
        this.localStream.removeTrack(audioTrack);
      }
      this.localStream.addTrack(newTrack);
      
      this._triggerHandler('onLocalStreamUpdate', this.localStream);
      console.log('[WebRTC] Microphone switched successfully');
      
      return true;
    } catch (error) {
      console.error('[WebRTC] Failed to switch microphone:', error);
      this._triggerHandler('onError', { 
        type: 'media-access', 
        error, 
        message: 'Không thể chuyển microphone' 
      });
      return false;
    }
  }

  /**
   * Get available media devices
   */
  async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      console.log('[WebRTC] Available devices:', {
        video: videoDevices.length,
        audio: audioDevices.length
      });
      
      return {
        videoDevices,
        audioDevices
      };
    } catch (error) {
      console.error('[WebRTC] Failed to get devices:', error);
      return {
        videoDevices: [],
        audioDevices: []
      };
    }
  }

  /**
   * Close only peer connection (keep local stream alive)
   * Use this when remote peer disconnects but you want to keep local camera/mic active
   */
  closePeerConnection() {
    console.log('[WebRTC] Closing peer connection (keeping local stream)');

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.connectionState = 'disconnected';
    
    // Clear processed signals tracking
    this.processedSignals.clear();

    console.log('[WebRTC] Peer connection closed, local stream preserved');
    this._triggerHandler('onConnectionClosed');
  }

  /**
   * Destroy everything including local stream
   * Use this when completely leaving the interview
   */
  destroy() {
    console.log('[WebRTC] Destroying peer connection and local stream');

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.connectionState = 'disconnected';
    
    // Clear processed signals tracking
    this.processedSignals.clear();

    console.log('[WebRTC] Peer connection and local stream destroyed');
    this._triggerHandler('onConnectionClosed');
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connectionState === 'connected';
  }

  addLocalStream() {
    // No-op for native WebRTC (stream passed to init)
    console.log('[WebRTC] addLocalStream called (no-op for native WebRTC)');
  }

  stopQualityMonitoring() {
    // Quality monitoring not implemented yet
    console.log('[WebRTC] stopQualityMonitoring called (not implemented)');
  }

  startQualityMonitoring() {
    // Quality monitoring not implemented yet
    console.log('[WebRTC] startQualityMonitoring called (not implemented)');
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;
