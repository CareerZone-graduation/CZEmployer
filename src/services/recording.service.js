/**
 * RecordingService - Manages interview recording using RecordRTC
 * Handles recording of combined local and remote audio/video streams
 */
import RecordRTC from 'recordrtc';

class RecordingService {
  constructor() {
    this.recorder = null;
    this.recordedBlob = null;
    this.recordingState = 'inactive'; // 'inactive', 'recording', 'paused'
    this.startTime = null;
    this.pausedTime = 0;
    this.eventHandlers = new Map();
    
    // Recording configuration
    this.recordingOptions = {
      type: 'video',
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000,  // 128 kbps
      frameRate: 30,
      disableLogs: false
    };
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
        console.error(`[Recording] Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Combine local and remote audio streams
   * @private
   * @param {MediaStream} localStream - Local media stream
   * @param {MediaStream} remoteStream - Remote media stream
   * @returns {MediaStream} Combined audio stream
   */
  _combineAudioStreams(localStream, remoteStream) {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    // Add local audio
    if (localStream && localStream.getAudioTracks().length > 0) {
      const localAudioSource = audioContext.createMediaStreamSource(localStream);
      localAudioSource.connect(destination);
    }

    // Add remote audio
    if (remoteStream && remoteStream.getAudioTracks().length > 0) {
      const remoteAudioSource = audioContext.createMediaStreamSource(remoteStream);
      remoteAudioSource.connect(destination);
    }

    return destination.stream;
  }

  /**
   * Create a canvas to combine video streams
   * @private
   * @param {MediaStream} localStream - Local video stream
   * @param {MediaStream} remoteStream - Remote video stream
   * @param {HTMLVideoElement} localVideo - Local video element
   * @param {HTMLVideoElement} remoteVideo - Remote video element
   * @returns {MediaStream} Combined video stream from canvas
   */
  _combineVideoStreams(localStream, remoteStream, localVideo, remoteVideo) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on remote video (main video)
    canvas.width = 1280;
    canvas.height = 720;

    // Draw function to combine videos
    const draw = () => {
      if (this.recordingState === 'inactive') return;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw remote video (full size)
      if (remoteVideo && remoteVideo.readyState >= 2) {
        ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);
      }

      // Draw local video (picture-in-picture, bottom right)
      if (localVideo && localVideo.readyState >= 2) {
        const pipWidth = 320;
        const pipHeight = 180;
        const pipX = canvas.width - pipWidth - 20;
        const pipY = canvas.height - pipHeight - 20;
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipX - 2, pipY - 2, pipWidth + 4, pipHeight + 4);
        
        // Draw local video
        ctx.drawImage(localVideo, pipX, pipY, pipWidth, pipHeight);
      }

      // Continue drawing
      if (this.recordingState === 'recording') {
        requestAnimationFrame(draw);
      }
    };

    // Start drawing
    draw();

    // Get stream from canvas
    return canvas.captureStream(30); // 30 fps
  }

  /**
   * Start recording interview
   * @param {Object} options - Recording options
   * @param {MediaStream} options.localStream - Local media stream
   * @param {MediaStream} options.remoteStream - Remote media stream
   * @param {HTMLVideoElement} options.localVideo - Local video element
   * @param {HTMLVideoElement} options.remoteVideo - Remote video element
   * @returns {Promise<void>}
   */
  async startRecording({ localStream, remoteStream, localVideo, remoteVideo }) {
    try {
      console.log('[Recording] Starting recording...');

      if (this.recordingState === 'recording') {
        throw new Error('Recording already in progress');
      }

      if (!localStream && !remoteStream) {
        throw new Error('At least one media stream is required');
      }

      // Reset state
      this.recordedBlob = null;
      this.startTime = Date.now();
      this.pausedTime = 0;

      // Combine video streams using canvas
      let videoStream = null;
      if (localVideo && remoteVideo) {
        videoStream = this._combineVideoStreams(localStream, remoteStream, localVideo, remoteVideo);
      } else if (remoteStream) {
        videoStream = remoteStream;
      } else {
        videoStream = localStream;
      }

      // Combine audio streams
      const audioStream = this._combineAudioStreams(localStream, remoteStream);

      // Create combined stream with video and audio
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      // Create recorder
      this.recorder = new RecordRTC(combinedStream, {
        ...this.recordingOptions,
        ondataavailable: (blob) => {
          console.log('[Recording] Data available:', blob.size, 'bytes');
        },
        onStateChange: (state) => {
          console.log('[Recording] State changed:', state);
        }
      });

      // Start recording
      this.recorder.startRecording();
      this.recordingState = 'recording';

      console.log('[Recording] Recording started successfully');
      this._triggerHandler('onRecordingStarted', {
        startTime: this.startTime
      });

      return true;
    } catch (error) {
      console.error('[Recording] Failed to start recording:', error);
      this.recordingState = 'inactive';
      this._triggerHandler('onRecordingError', {
        type: 'start',
        error,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Stop recording and get the recorded blob
   * @returns {Promise<Blob>} The recorded video blob
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      try {
        console.log('[Recording] Stopping recording...');

        if (this.recordingState === 'inactive') {
          throw new Error('No active recording to stop');
        }

        if (!this.recorder) {
          throw new Error('Recorder not initialized');
        }

        this.recorder.stopRecording(() => {
          try {
            // Get the recorded blob
            this.recordedBlob = this.recorder.getBlob();
            
            // Calculate duration
            const duration = Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000);

            console.log('[Recording] Recording stopped successfully');
            console.log('[Recording] Duration:', duration, 'seconds');
            console.log('[Recording] Size:', this.recordedBlob.size, 'bytes');

            this.recordingState = 'inactive';

            this._triggerHandler('onRecordingStopped', {
              blob: this.recordedBlob,
              duration,
              size: this.recordedBlob.size,
              mimeType: this.recordedBlob.type
            });

            resolve(this.recordedBlob);
          } catch (error) {
            console.error('[Recording] Error in stop callback:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('[Recording] Failed to stop recording:', error);
        this.recordingState = 'inactive';
        this._triggerHandler('onRecordingError', {
          type: 'stop',
          error,
          message: error.message
        });
        reject(error);
      }
    });
  }

  /**
   * Pause recording
   */
  pauseRecording() {
    try {
      console.log('[Recording] Pausing recording...');

      if (this.recordingState !== 'recording') {
        throw new Error('No active recording to pause');
      }

      if (!this.recorder) {
        throw new Error('Recorder not initialized');
      }

      this.recorder.pauseRecording();
      this.recordingState = 'paused';
      this.pauseStartTime = Date.now();

      console.log('[Recording] Recording paused');
      this._triggerHandler('onRecordingPaused', {
        pausedAt: this.pauseStartTime
      });

      return true;
    } catch (error) {
      console.error('[Recording] Failed to pause recording:', error);
      this._triggerHandler('onRecordingError', {
        type: 'pause',
        error,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Resume recording
   */
  resumeRecording() {
    try {
      console.log('[Recording] Resuming recording...');

      if (this.recordingState !== 'paused') {
        throw new Error('Recording is not paused');
      }

      if (!this.recorder) {
        throw new Error('Recorder not initialized');
      }

      this.recorder.resumeRecording();
      this.recordingState = 'recording';
      
      // Track total paused time
      if (this.pauseStartTime) {
        this.pausedTime += Date.now() - this.pauseStartTime;
        this.pauseStartTime = null;
      }

      console.log('[Recording] Recording resumed');
      this._triggerHandler('onRecordingResumed', {
        resumedAt: Date.now()
      });

      return true;
    } catch (error) {
      console.error('[Recording] Failed to resume recording:', error);
      this._triggerHandler('onRecordingError', {
        type: 'resume',
        error,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Get current recording state
   * @returns {string} Current state ('inactive', 'recording', 'paused')
   */
  getState() {
    return this.recordingState;
  }

  /**
   * Get recording duration in seconds
   * @returns {number} Duration in seconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    
    const now = this.recordingState === 'paused' ? this.pauseStartTime : Date.now();
    return Math.floor((now - this.startTime - this.pausedTime) / 1000);
  }

  /**
   * Get the last recorded blob
   * @returns {Blob|null} The recorded blob or null
   */
  getRecordedBlob() {
    return this.recordedBlob;
  }

  /**
   * Check if recording is supported
   * @returns {boolean} True if recording is supported
   */
  isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  /**
   * Download the recorded video
   * @param {string} filename - Filename for the download
   */
  downloadRecording(filename = `interview-recording-${Date.now()}.webm`) {
    if (!this.recordedBlob) {
      throw new Error('No recording available to download');
    }

    const url = URL.createObjectURL(this.recordedBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Reset recording service
   */
  reset() {
    console.log('[Recording] Resetting recording service...');
    
    if (this.recorder) {
      if (this.recordingState === 'recording' || this.recordingState === 'paused') {
        try {
          this.recorder.stopRecording(() => {
            this.recorder.destroy();
            this.recorder = null;
          });
        } catch (error) {
          console.error('[Recording] Error stopping recorder during reset:', error);
          this.recorder = null;
        }
      } else {
        this.recorder.destroy();
        this.recorder = null;
      }
    }

    this.recordedBlob = null;
    this.recordingState = 'inactive';
    this.startTime = null;
    this.pausedTime = 0;
    this.pauseStartTime = null;

    console.log('[Recording] Recording service reset');
  }

  /**
   * Destroy recording service and cleanup
   */
  destroy() {
    console.log('[Recording] Destroying recording service...');
    this.reset();
    this.eventHandlers.clear();
    console.log('[Recording] Recording service destroyed');
  }
}

// Export singleton instance
const recordingService = new RecordingService();
export default recordingService;
