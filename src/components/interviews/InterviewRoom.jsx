import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare,
  Circle,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ChatPanel from './ChatPanel';
import RecordingControls from './RecordingControls';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';
import webrtcService from '@/services/webrtc.service';
import recordingService from '@/services/recording.service';
import interviewSocketService from '@/services/interviewSocket.service';
import { uploadRecording } from '@/services/interviewService';

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Track if we've already initiated connection to prevent duplicates
  const connectionInitiatedRef = useRef(false);
  
  // State management
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good'); // 'excellent', 'good', 'fair', 'poor'
  const [qualityDetails, setQualityDetails] = useState(null);
  const [_isConnected, setIsConnected] = useState(false);
  const [isRemoteUserJoined, setIsRemoteUserJoined] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  // Main setup effect
  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Fetch interview data from API
        // const data = await interviewService.getInterviewById(interviewId);
        // setInterviewData(data);
        
        // Mock data for now
        setInterviewData({
          id: interviewId,
          candidateName: 'Nguyễn Văn A',
          jobTitle: 'Senior Frontend Developer',
          scheduledAt: new Date(),
          duration: 60
        });
        
      } catch {
        setError('Không thể tải thông tin phỏng vấn');
        toast.error('Không thể tải thông tin phỏng vấn');
        setIsLoading(false);
      }
    };

    const setupInterview = async () => {
      try {
        // 1. Connect to socket
        await interviewSocketService.connect();
        console.log('[InterviewRoom] Socket connected');

        // 2. Get User ID
        const userId = interviewSocketService.getCurrentUserId();
        if (userId) {
          setCurrentUserId(userId);
          console.log('[InterviewRoom] Current user ID from JWT:', userId);
        } else {
          console.warn('[InterviewRoom] Could not get user ID immediately after connect.');
        }

        // 3. Setup local media and get stream immediately
        const stream = await setupLocalMedia();

        // 4. Setup all event handlers, passing the stable userId and stream
        setupEventHandlers(userId, stream);
        console.log('[InterviewRoom] All event handlers setup');

        // 5. Join interview room
        const joinResponse = await interviewSocketService.joinInterview(interviewId, {
          role: 'recruiter'
        });
        console.log('[InterviewRoom] Joined interview room:', joinResponse);

        // 6. Check for existing users and initiate connection if needed
        if (joinResponse.existingUsers && joinResponse.existingUsers.length > 0) {
          const candidateExists = joinResponse.existingUsers.some(u => u.userRole === 'candidate');
          if (candidateExists) {
            console.log('[InterviewRoom] Found existing candidate:', joinResponse.existingUsers);
            setIsRemoteUserJoined(true);
            initiateWebRTCConnection(stream);
          } else {
            console.log('[InterviewRoom] Users in room but no candidate yet');
          }
        } else {
          console.log('[InterviewRoom] Waiting for candidate to join...');
        }

        setIsConnected(true);
      } catch (err) {
        console.error('[InterviewRoom] Main setup failed:', err);
        setError('Không thể thiết lập phòng phỏng vấn: ' + err.message);
        toast.error('Không thể thiết lập phòng phỏng vấn: ' + err.message);
        setIsLoading(false);
      }
    };

    const setupLocalMedia = async () => {
      try {
        console.log('[InterviewRoom] Setting up local media');
        
        // Load saved device settings
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};
        console.log('[InterviewRoom] Using device settings:', deviceSettings);
        
        // Build constraints with saved device IDs
        const constraints = {
          video: deviceSettings.videoDeviceId 
            ? { 
                deviceId: { exact: deviceSettings.videoDeviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            : { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
          audio: deviceSettings.audioDeviceId
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
              }
        };
        
        console.log('[InterviewRoom] Requesting media with EXACT device IDs:', {
          video: deviceSettings.videoDeviceId,
          audio: deviceSettings.audioDeviceId
        });
        const stream = await webrtcService.getUserMedia(constraints);
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Log which devices are actually being used
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('[InterviewRoom] ✓ Using video device:', videoTrack.label, 'ID:', settings.deviceId);
        }
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          console.log('[InterviewRoom] ✓ Using audio device:', audioTrack.label, 'ID:', settings.deviceId);
        }
        
        console.log('[InterviewRoom] Local media setup complete');
        return stream; // Return stream for immediate use
      } catch (error) {
        console.error('[InterviewRoom] Failed to setup local media:', error);
        
        // If exact device fails, try without device constraints
        if (error.name === 'OverconstrainedError' || error.name === 'NotFoundError') {
          console.warn('[InterviewRoom] Saved device not found, trying default devices');
          try {
            const fallbackConstraints = {
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            };
            const stream = await webrtcService.getUserMedia(fallbackConstraints);
            setLocalStream(stream);
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            
            toast.warning('Thiết bị đã lưu không khả dụng, sử dụng thiết bị mặc định');
            return stream;
          } catch (fallbackError) {
            console.error('[InterviewRoom] Fallback also failed:', fallbackError);
            toast.error('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.');
            throw fallbackError;
          }
        }
        
        toast.error('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.');
        throw error; // Propagate error to stop setup
      }
    };

    const setupEventHandlers = (userId, stream) => {
      // Clear any existing WebRTC handlers to avoid duplicates
      webrtcService.eventHandlers.clear();
      
      // Socket Handlers
      interviewSocketService.on('onUserJoined', (data) => {
        console.log('[InterviewRoom] User joined:', data);
        if (data.userRole === 'candidate') {
          setIsRemoteUserJoined(true);
          toast.success(`${data.userName || 'Ứng viên'} đã tham gia.`);
          
          // Only initiate if we haven't already AND peer connection doesn't exist
          const peerExists = webrtcService.peerConnection && 
                            webrtcService.peerConnection.connectionState !== 'closed' &&
                            webrtcService.peerConnection.connectionState !== 'failed';
          
          if (!connectionInitiatedRef.current && !peerExists) {
            console.log('[InterviewRoom] Candidate joined, recruiter initiating WebRTC connection...');
            initiateWebRTCConnection(stream);
          } else {
            console.log('[InterviewRoom] Connection already initiated or peer exists, skipping');
            console.log('[InterviewRoom] connectionInitiatedRef:', connectionInitiatedRef.current);
            console.log('[InterviewRoom] peerExists:', peerExists);
            console.log('[InterviewRoom] peer state:', webrtcService.peerConnection?.connectionState);
          }
        }
      });

      interviewSocketService.on('onUserLeft', (data) => {
        console.log('[InterviewRoom] User left:', data);
        setIsRemoteUserJoined(false);
        toast.warning(`${data.userName || 'Ứng viên'} đã rời khỏi phỏng vấn.`);
        connectionInitiatedRef.current = false; // Reset flag
        
        // Clean up peer connection but keep local stream
        if (webrtcService.peerConnection && webrtcService.peerConnection.connectionState !== 'closed') {
          console.log('[InterviewRoom] Cleaning up peer connection due to user leaving');
          webrtcService.closePeerConnection(); // Only close peer, keep local stream
        }
        
        // Clear remote video
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        
        // IMPORTANT: Keep local stream active - don't destroy it
        console.log('[InterviewRoom] Local stream preserved after peer disconnect');
      });

      // Handle peer disconnected event (for abrupt disconnections)
      interviewSocketService.on('onPeerDisconnected', (data) => {
        console.log('[InterviewRoom] Peer disconnected abruptly:', data);
        setIsRemoteUserJoined(false);
        connectionInitiatedRef.current = false;
        
        // Clean up peer connection
        if (webrtcService.peerConnection) {
          console.log('[InterviewRoom] Cleaning up peer connection after abrupt disconnect');
          webrtcService.closePeerConnection();
        }
        
        // Clear remote video
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        
        // Keep local stream active
        console.log('[InterviewRoom] Local stream preserved after abrupt disconnect');
      });

      interviewSocketService.on('onSignal', (data) => {
        const signalFrom = data.from || data.fromUserId;
        console.log('[InterviewRoom] ===== Signal received =====');
        console.log('[InterviewRoom] Signal from:', signalFrom);
        console.log('[InterviewRoom] Current user:', userId);
        console.log('[InterviewRoom] Signal type:', data.signal?.type);
        
        if (signalFrom && signalFrom === userId) {
          console.log('[InterviewRoom] Ignoring own signal');
          return; // Ignore own signals
        }
        
        // Check peer state before handling signal
        const peerState = webrtcService.peerConnection?.signalingState;
        console.log('[InterviewRoom] Current peer signaling state:', peerState);
        
        webrtcService.handleSignal(data.signal);
      });
      
      interviewSocketService.on('onChatMessage', (data) => {
        console.log('[InterviewRoom] Chat message received:', data);
        const newMessage = {
          id: data.messageId || Date.now(),
          senderId: data.senderId,
          senderName: data.senderName || 'Ứng viên',
          message: data.message,
          timestamp: new Date(data.timestamp)
        };
        setChatMessages(prev => [...prev, newMessage]);
      });

      // WebRTC Handlers
      webrtcService.on('onSignal', (signal) => {
        console.log('[InterviewRoom] Sending signal:', signal.type);
        interviewSocketService.sendSignal(interviewId, signal);
      });

      webrtcService.on('onRemoteStream', (remoteStream) => {
        console.log('[InterviewRoom] ===== Remote stream received =====');
        if (remoteVideoRef.current) {
          console.log('[InterviewRoom] Attaching remote stream to video element.');
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(e => console.error("Remote video play failed", e));
        } else {
          console.error('[InterviewRoom] CRITICAL: remoteVideoRef is null when stream was received!');
        }
      });

      webrtcService.on('onConnectionEstablished', () => {
        console.log('[InterviewRoom] WebRTC connection established');
        toast.success('Đã kết nối với ứng viên');
      });

      webrtcService.on('onError', (error) => {
        console.error('[InterviewRoom] WebRTC error:', error);
        toast.error(`Lỗi kết nối: ${error.message}`);
      });

      webrtcService.on('onLocalStreamUpdate', (stream) => {
        console.log('[InterviewRoom] Local stream updated from WebRTC service');
        // Update state to trigger effect
        setLocalStream(stream);
      });
    };

    const initiateWebRTCConnection = (stream) => {
      try {
        // Prevent duplicate initialization
        if (connectionInitiatedRef.current) {
          console.log('[InterviewRoom] Connection already initiated, skipping');
          return;
        }
        
        // Check if peer already exists and is active
        if (webrtcService.peerConnection && webrtcService.peerConnection.connectionState !== 'closed') {
          console.log('[InterviewRoom] Peer connection already exists and is active, not creating new one');
          connectionInitiatedRef.current = true;
          return;
        }
        
        const streamToUse = stream || localStream;
        if (!streamToUse) {
          throw new Error("Local stream is not available to initiate connection.");
        }
        
        console.log('[InterviewRoom] Initializing peer as initiator (recruiter)');
        connectionInitiatedRef.current = true;
        webrtcService.initializePeerConnection(streamToUse);
      } catch (error) {
        console.error('[InterviewRoom] Failed to initiate connection:', error);
        connectionInitiatedRef.current = false; // Reset on error
        toast.error('Không thể khởi tạo kết nối: ' + error.message);
      }
    };

    if (interviewId) {
      loadInterviewData().then(() => {
        // Mock loading finished
        setIsLoading(false);
        setupInterview();
      });
    }

    // Cleanup
    return () => {
      console.log('[InterviewRoom] Cleaning up component.');
      
      // Clear WebRTC event handlers
      webrtcService.eventHandlers.clear();
      webrtcService.destroy();
      
      // Clear socket event handlers
      interviewSocketService.off('onUserJoined');
      interviewSocketService.off('onUserLeft');
      interviewSocketService.off('onPeerDisconnected');
      interviewSocketService.off('onSignal');
      interviewSocketService.off('onChatMessage');
      
      interviewSocketService.disconnect();
      
      // Stop and cleanup recording if active
      if (recordingService.getState() !== 'inactive') {
        recordingService.stopRecording().catch(err => console.error('Error stopping recording on unmount:', err));
      }
      recordingService.reset();
      
      // Reset connection flag
      connectionInitiatedRef.current = false;
    };
  }, [interviewId]);


  // Effect to update local video when stream or video state changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('[InterviewRoom] Effect: Updating local video element');
      console.log('[InterviewRoom] Video enabled:', isVideoEnabled);
      console.log('[InterviewRoom] Stream active:', localStream.active);
      
      localVideoRef.current.srcObject = localStream;
      
      if (isVideoEnabled) {
        localVideoRef.current.play().catch(e => {
          console.log('[InterviewRoom] Effect: Play failed:', e);
        });
      }
    }
  }, [isVideoEnabled, localStream]);

  // Toggle audio
  const toggleAudio = async () => {
    const newEnabled = !isAudioEnabled;
    const success = await webrtcService.toggleAudio(newEnabled);
    if (success) {
      setIsAudioEnabled(newEnabled);
      toast.info(newEnabled ? 'Đã bật micro' : 'Đã tắt micro');
    } else {
      toast.error('Không thể thay đổi trạng thái micro');
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    const newEnabled = !isVideoEnabled;
    console.log('[InterviewRoom] Toggling video to:', newEnabled);
    
    const success = await webrtcService.toggleVideo(newEnabled);
    if (success) {
      console.log('[InterviewRoom] Video toggle successful');
      setIsVideoEnabled(newEnabled);
      
      // Update local stream state to trigger effect
      const updatedStream = webrtcService.getLocalStream();
      if (updatedStream) {
        setLocalStream(updatedStream);
      }
      
      toast.info(newEnabled ? 'Đã bật camera' : 'Đã tắt camera');
    } else {
      console.error('[InterviewRoom] Video toggle failed');
      toast.error('Không thể thay đổi trạng thái camera');
    }
  };

  // End call
  const handleEndCall = () => {
    if (window.confirm('Bạn có chắc chắn muốn kết thúc cuộc phỏng vấn?')) {
      interviewSocketService.notifyInterviewEnd(interviewId);
      webrtcService.destroy();
      interviewSocketService.disconnect();
      toast.info('Đã kết thúc cuộc phỏng vấn');
      navigate(`/interviews/${interviewId}/feedback`);
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  // Handle recording toggle
  const handleRecordingToggle = async (recording) => {
    setIsRecording(recording);
    
    if (recording) {
      interviewSocketService.notifyRecordingStarted(interviewId);
      console.log('[InterviewRoom] Recording started, notified participants');
    } else {
      await handleRecordingUpload();
    }
  };

  // Handle recording pause
  const handleRecordingPause = () => {
    try {
      recordingService.pauseRecording();
      setIsRecordingPaused(true);
      toast.info('Đã tạm dừng ghi hình');
    } catch (error) {
      console.error('Failed to pause recording:', error);
      toast.error('Không thể tạm dừng ghi hình');
    }
  };

  // Handle recording resume
  const handleRecordingResume = () => {
    try {
      recordingService.resumeRecording();
      setIsRecordingPaused(false);
      toast.info('Đã tiếp tục ghi hình');
    } catch (error) {
      console.error('Failed to resume recording:', error);
      toast.error('Không thể tiếp tục ghi hình');
    }
  };

  // Handle recording upload
  const handleRecordingUpload = async () => {
    try {
      const recordedBlob = recordingService.getRecordedBlob();
      
      if (!recordedBlob) {
        console.warn('[InterviewRoom] No recorded blob available');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const duration = recordingService.getDuration();
      const metadata = {
        duration,
        size: recordedBlob.size
      };

      console.log('[InterviewRoom] Uploading recording:', metadata);
      toast.info('Đang tải video lên server...');

      await uploadRecording(
        interviewId,
        recordedBlob,
        metadata,
        (progress) => {
          setUploadProgress(progress);
          console.log(`[InterviewRoom] Upload progress: ${progress}%`);
        }
      );

      setIsUploading(false);
      setUploadProgress(0);
      toast.success('Video đã được tải lên thành công');
      
      interviewSocketService.notifyRecordingStopped(interviewId, duration);
      console.log('[InterviewRoom] Recording uploaded, notified participants');
    } catch (error) {
      console.error('[InterviewRoom] Failed to upload recording:', error);
      setIsUploading(false);
      toast.error('Không thể tải video lên: ' + error.message);
    }
  };

  // Handle send message
  const handleSendMessage = async (message) => {
    try {
      const response = await interviewSocketService.sendChatMessage(interviewId, message);
      
      const newMessage = {
        id: response.messageId || Date.now(),
        senderId: currentUserId,
        senderName: 'Bạn',
        message,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('[InterviewRoom] Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Đang tải phòng phỏng vấn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Lỗi</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/interviews')}>
              Quay lại danh sách phỏng vấn
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-white">
                Phỏng vấn: {interviewData?.candidateName}
              </h1>
              <p className="text-sm text-gray-400">
                {interviewData?.jobTitle}
              </p>
            </div>
            {isRecording && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Circle className="h-2 w-2 fill-current animate-pulse" />
                Đang ghi hình
              </Badge>
            )}
            {isUploading && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                Đang tải lên {uploadProgress}%
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <ConnectionQualityIndicator 
              quality={connectionQuality} 
              details={qualityDetails}
            />
            {!isRemoteUserJoined && (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                Đang chờ ứng viên tham gia...
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative p-4">
          {/* Remote Video (Main) */}
          <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden relative">
            {isRemoteUserJoined ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md">
                  <p className="text-white text-sm font-medium">
                    {interviewData?.candidateName}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-12 w-12 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Đang chờ ứng viên tham gia...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-8 right-8 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
            {isVideoEnabled ? (
              <>
                <video
                  key="local-video-enabled"
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md">
                  <p className="text-white text-xs font-medium">Bạn</p>
                </div>
              </>
            ) : (
              <div key="local-video-disabled" className="flex items-center justify-center h-full bg-gray-700">
                <VideoOff className="h-8 w-8 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 border-l border-gray-700 bg-gray-800">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClose={toggleChat}
            />
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            size="lg"
            variant={isAudioEnabled ? "default" : "destructive"}
            onClick={toggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          {/* Video Toggle */}
          <Button
            size="lg"
            variant={isVideoEnabled ? "default" : "destructive"}
            onClick={toggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>

          {/* Recording Controls */}
          <RecordingControls
            isRecording={isRecording}
            onToggle={handleRecordingToggle}
            disabled={!isRemoteUserJoined || isUploading}
            isPaused={isRecordingPaused}
            onPause={handleRecordingPause}
            onResume={handleRecordingResume}
            localStream={webrtcService.getLocalStream()}
            remoteStream={webrtcService.getRemoteStream()}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
          />

          {/* Chat Toggle */}
          <Button
            size="lg"
            variant={isChatOpen ? "secondary" : "outline"}
            onClick={toggleChat}
            className="rounded-full w-14 h-14 relative"
          >
            <MessageSquare className="h-6 w-6" />
            {chatMessages.length > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chatMessages.length}
              </span>
            )}
          </Button>

          <Separator orientation="vertical" className="h-12 bg-gray-700" />

          {/* End Call */}
          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
