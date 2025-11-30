import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ChatPanel from './ChatPanel';
import RecordingControls from './RecordingControls';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';
import webrtcService from '@/services/webrtc.service';
import recordingService from '@/services/recording.service';
import interviewSocketService from '@/services/interviewSocket.service';
import { uploadRecording } from '@/services/interviewService';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import VideoFrame from './VideoFrame';
import ControlBar from './ControlBar';
import ParticipantList from './ParticipantList';
import { cn } from '@/lib/utils';

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
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionQuality] = useState('good');
  const [qualityDetails] = useState(null);
  const [_isConnected, setIsConnected] = useState(false);
  const [isRemoteUserJoined, setIsRemoteUserJoined] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [remotePeerState, setRemotePeerState] = useState({
    isMuted: false,
    isCameraOff: false,
    name: 'Ứng viên'
  });
  const [confirmEndCallOpen, setConfirmEndCallOpen] = useState(false);

  // Helper to add floating emoji
  const addFloatingEmoji = (emoji, isLocal) => {
    const id = Date.now() + Math.random();

    // Position based on sender
    // Local (Right side): 60-90%
    // Remote (Left side): 10-40%
    let min, max;
    if (isLocal) {
      min = 60;
      max = 90;
    } else {
      min = 10;
      max = 40;
    }

    const left = min + Math.random() * (max - min);

    setFloatingEmojis(prev => [...prev, { id, emoji, left, isLocal }]);

    // Remove after animation (2s)
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const handleSendEmoji = (emoji) => {
    interviewSocketService.sendEmoji(interviewId, emoji);
    addFloatingEmoji(emoji, true); // Local
  };

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const isChatOpenRef = useRef(isChatOpen);
  const processedMessageIdsRef = useRef(new Set());

  const loadInterviewData = async () => {
    try {
      setIsLoading(true);
      // Mock data for now (or fetch from API if available)
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
      await interviewSocketService.connect();
      const userId = interviewSocketService.getCurrentUserId();
      if (userId) setCurrentUserId(userId);

      const stream = await setupLocalMedia();
      setupEventHandlers(userId, stream);

      const joinResponse = await interviewSocketService.joinInterview(interviewId, {
        role: 'recruiter'
      });

      if (joinResponse.existingUsers && joinResponse.existingUsers.length > 0) {
        const candidateExists = joinResponse.existingUsers.some(u => u.userRole === 'candidate');
        if (candidateExists) {
          setIsRemoteUserJoined(true);
          initiateWebRTCConnection(stream);
        }
      }

      setIsConnected(true);
    } catch (err) {
      console.error('[InterviewRoom] Main setup failed:', err);
      setError('Không thể thiết lập phòng phỏng vấn: ' + err.message);
      setIsLoading(false);
    }
  };

  const setupLocalMedia = async () => {
    try {
      const savedSettings = localStorage.getItem('interviewDeviceSettings');
      const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};

      const constraints = {
        video: deviceSettings.videoDeviceId
          ? { deviceId: { exact: deviceSettings.videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: deviceSettings.audioDeviceId
          ? { deviceId: { exact: deviceSettings.audioDeviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      };

      let stream;
      try {
        stream = await webrtcService.getUserMedia(constraints);
      } catch {
        console.warn('Exact device failed, trying fallback');
        stream = await webrtcService.getUserMedia({ video: true, audio: true });
      }

      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('[InterviewRoom] Failed to setup local media:', error);
      toast.error('Không thể truy cập camera/microphone.');
      throw error;
    }
  };

  const setupEventHandlers = (userId, stream) => {
    webrtcService.eventHandlers.clear();
    interviewSocketService.removeAllListeners();

    interviewSocketService.on('onUserJoined', (data) => {
      if (data.userRole === 'candidate') {
        setIsRemoteUserJoined(true);
        setRemotePeerState(prev => ({ ...prev, name: data.userName || 'Ứng viên' }));
        toast.success(`${data.userName || 'Ứng viên'} đã tham gia.`);

        const peerExists = webrtcService.peerConnection &&
          webrtcService.peerConnection.connectionState !== 'closed' &&
          webrtcService.peerConnection.connectionState !== 'failed';

        if (!connectionInitiatedRef.current && !peerExists) {
          initiateWebRTCConnection(stream);
        }
      }
    });

    interviewSocketService.on('onUserLeft', (data) => {
      setIsRemoteUserJoined(false);
      setRemoteStream(null);
      toast.warning(`${data.userName || 'Ứng viên'} đã rời khỏi phỏng vấn.`);
      connectionInitiatedRef.current = false;
      if (webrtcService.peerConnection) webrtcService.closePeerConnection();
    });

    interviewSocketService.on('onPeerDisconnected', () => {
      setIsRemoteUserJoined(false);
      setRemoteStream(null);
      connectionInitiatedRef.current = false;
      if (webrtcService.peerConnection) webrtcService.closePeerConnection();
    });

    interviewSocketService.on('onSignal', (data) => {
      const signalFrom = data.from || data.fromUserId;
      if (signalFrom && signalFrom === userId) return;
      webrtcService.handleSignal(data.signal);
    });

    interviewSocketService.on('onChatMessage', (data) => {
      if (String(data.senderId) === String(userId)) return;

      const messageId = data._id || data.messageId;
      if (messageId && processedMessageIdsRef.current.has(messageId)) {
        return;
      }
      if (messageId) processedMessageIdsRef.current.add(messageId);

      const newMessage = {
        id: messageId || Date.now(),
        senderId: data.senderId,
        senderName: 'Ứng viên',
        message: data.message,
        timestamp: new Date(data.timestamp)
      };

      setChatMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      if (!isChatOpenRef.current) toast('Tin nhắn mới', { description: `Ứng viên: ${data.message}` });
    });

    // Media State Updates
    interviewSocketService.on('onMediaStateChanged', (data) => {
      if (data.userId !== userId) {
        setRemotePeerState(prev => ({
          ...prev,
          isMuted: data.isAudioEnabled !== undefined ? !data.isAudioEnabled : prev.isMuted,
          isCameraOff: data.isVideoEnabled !== undefined ? !data.isVideoEnabled : prev.isCameraOff
        }));
      }
    });

    interviewSocketService.on('onEmoji', (data) => {
      addFloatingEmoji(data.emoji);
    });

    webrtcService.on('onSignal', (signal) => {
      interviewSocketService.sendSignal(interviewId, signal);
    });

    webrtcService.on('onRemoteStream', (stream) => {
      setRemoteStream(stream);
    });

    webrtcService.on('onConnectionEstablished', () => {
      toast.success('Đã kết nối với ứng viên');
    });

    webrtcService.on('onLocalStreamUpdate', (stream) => {
      setLocalStream(stream);
    });
  };

  const initiateWebRTCConnection = (stream) => {
    try {
      if (connectionInitiatedRef.current) return;
      if (webrtcService.peerConnection && webrtcService.peerConnection.connectionState !== 'closed') {
        connectionInitiatedRef.current = true;
        return;
      }
      if (!stream) throw new Error("No local stream");

      connectionInitiatedRef.current = true;
      webrtcService.initializePeerConnection(stream);
    } catch (error) {
      console.error('Failed to initiate connection:', error);
      connectionInitiatedRef.current = false;
      toast.error('Không thể khởi tạo kết nối: ' + error.message);
    }
  };



  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        setIsLoading(true);
        // Mock data for now (or fetch from API if available)
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
        await interviewSocketService.connect();
        const userId = interviewSocketService.getCurrentUserId();
        if (userId) setCurrentUserId(userId);

        const stream = await setupLocalMedia();
        setupEventHandlers(userId, stream);

        const joinResponse = await interviewSocketService.joinInterview(interviewId, {
          role: 'recruiter'
        });

        if (joinResponse.existingUsers && joinResponse.existingUsers.length > 0) {
          const candidateExists = joinResponse.existingUsers.some(u => u.userRole === 'candidate');
          if (candidateExists) {
            setIsRemoteUserJoined(true);
            initiateWebRTCConnection(stream);
          }
        }

        setIsConnected(true);
      } catch (err) {
        console.error('[InterviewRoom] Main setup failed:', err);
        setError('Không thể thiết lập phòng phỏng vấn: ' + err.message);
        setIsLoading(false);
      }
    };

    const setupLocalMedia = async () => {
      try {
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};

        const constraints = {
          video: deviceSettings.videoDeviceId
            ? { deviceId: { exact: deviceSettings.videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: deviceSettings.audioDeviceId
            ? { deviceId: { exact: deviceSettings.audioDeviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            : { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        };

        let stream;
        try {
          stream = await webrtcService.getUserMedia(constraints);
        } catch {
          console.warn('Exact device failed, trying fallback');
          stream = await webrtcService.getUserMedia({ video: true, audio: true });
        }

        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.error('[InterviewRoom] Failed to setup local media:', error);
        toast.error('Không thể truy cập camera/microphone.');
        throw error;
      }
    };

    const setupEventHandlers = (userId, stream) => {
      webrtcService.eventHandlers.clear();
      interviewSocketService.removeAllListeners();

      interviewSocketService.on('onUserJoined', (data) => {
        if (data.userRole === 'candidate') {
          setIsRemoteUserJoined(true);
          setRemotePeerState(prev => ({ ...prev, name: data.userName || 'Ứng viên' }));
          toast.success(`${data.userName || 'Ứng viên'} đã tham gia.`);

          const peerExists = webrtcService.peerConnection &&
            webrtcService.peerConnection.connectionState !== 'closed' &&
            webrtcService.peerConnection.connectionState !== 'failed';

          if (!connectionInitiatedRef.current && !peerExists) {
            initiateWebRTCConnection(stream);
          }
        }
      });

      interviewSocketService.on('onUserLeft', (data) => {
        setIsRemoteUserJoined(false);
        setRemoteStream(null);
        toast.warning(`${data.userName || 'Ứng viên'} đã rời khỏi phỏng vấn.`);
        connectionInitiatedRef.current = false;
        if (webrtcService.peerConnection) webrtcService.closePeerConnection();
      });

      interviewSocketService.on('onPeerDisconnected', () => {
        setIsRemoteUserJoined(false);
        setRemoteStream(null);
        connectionInitiatedRef.current = false;
        if (webrtcService.peerConnection) webrtcService.closePeerConnection();
      });

      interviewSocketService.on('onSignal', (data) => {
        const signalFrom = data.from || data.fromUserId;
        if (signalFrom && signalFrom === userId) return;
        webrtcService.handleSignal(data.signal);
      });

      interviewSocketService.on('onChatMessage', (data) => {
        if (String(data.senderId) === String(userId)) return;

        const messageId = data._id || data.messageId;
        if (messageId && processedMessageIdsRef.current.has(messageId)) {
          return;
        }
        if (messageId) processedMessageIdsRef.current.add(messageId);

        const newMessage = {
          id: messageId || Date.now(),
          senderId: data.senderId,
          senderName: 'Ứng viên',
          message: data.message,
          timestamp: new Date(data.timestamp)
        };

        setChatMessages(prev => {
          if (prev.some(msg => msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        if (!isChatOpenRef.current) toast('Tin nhắn mới', { description: `Ứng viên: ${data.message}` });
      });

      // Media State Updates
      interviewSocketService.on('onMediaStateChanged', (data) => {
        if (data.userId !== userId) {
          setRemotePeerState(prev => ({
            ...prev,
            isMuted: data.isAudioEnabled !== undefined ? !data.isAudioEnabled : prev.isMuted,
            isCameraOff: data.isVideoEnabled !== undefined ? !data.isVideoEnabled : prev.isCameraOff
          }));
        }
      });

      interviewSocketService.on('onEmoji', (data) => {
        addFloatingEmoji(data.emoji, false); // Remote
      });

      webrtcService.on('onSignal', (signal) => {
        interviewSocketService.sendSignal(interviewId, signal);
      });

      webrtcService.on('onRemoteStream', (stream) => {
        setRemoteStream(stream);
      });

      webrtcService.on('onConnectionEstablished', () => {
        toast.success('Đã kết nối với ứng viên');
      });

      webrtcService.on('onLocalStreamUpdate', (stream) => {
        setLocalStream(stream);
      });
    };

    const initiateWebRTCConnection = (stream) => {
      try {
        if (connectionInitiatedRef.current) return;
        if (webrtcService.peerConnection && webrtcService.peerConnection.connectionState !== 'closed') {
          connectionInitiatedRef.current = true;
          return;
        }
        if (!stream) throw new Error("No local stream");

        connectionInitiatedRef.current = true;
        webrtcService.initializePeerConnection(stream);
      } catch (error) {
        console.error('Failed to initiate connection:', error);
        connectionInitiatedRef.current = false;
        toast.error('Không thể khởi tạo kết nối: ' + error.message);
      }
    };

    if (interviewId) {
      loadInterviewData().then(() => {
        setIsLoading(false);
        setupInterview();
      });
    }

    return () => {
      webrtcService.eventHandlers.clear();
      webrtcService.destroy();
      interviewSocketService.reset();
      if (recordingService.getState() !== 'inactive') {
        recordingService.stopRecording().catch(console.error);
      }
      recordingService.reset();
      connectionInitiatedRef.current = false;
    };
  }, [interviewId]);

  const toggleAudio = async () => {
    const newEnabled = !isAudioEnabled;
    const success = await webrtcService.toggleAudio(newEnabled);
    if (success) {
      setIsAudioEnabled(newEnabled);
      interviewSocketService.notifyMediaStateChanged(interviewId, newEnabled, isVideoEnabled);
    }
  };

  const toggleVideo = async () => {
    const newEnabled = !isVideoEnabled;
    const success = await webrtcService.toggleVideo(newEnabled);
    if (success) {
      setIsVideoEnabled(newEnabled);
      const updatedStream = webrtcService.getLocalStream();
      if (updatedStream) setLocalStream(updatedStream);
      interviewSocketService.notifyMediaStateChanged(interviewId, isAudioEnabled, newEnabled);
    }
  };

  const handleEndCall = () => {
    setConfirmEndCallOpen(true);
  };

  const executeEndCall = () => {
    interviewSocketService.notifyInterviewEnd(interviewId);
    webrtcService.destroy();
    interviewSocketService.disconnect();
    toast.info('Đã kết thúc cuộc phỏng vấn');
    navigate(`/interviews/${interviewId}`);
  };

  const handleRecordingToggle = async (recording) => {
    setIsRecording(recording);
    if (recording) {
      interviewSocketService.notifyRecordingStarted(interviewId);
    } else {
      await handleRecordingUpload();
    }
  };

  const handleRecordingPause = () => {
    recordingService.pauseRecording();
    setIsRecordingPaused(true);
  };

  const handleRecordingResume = () => {
    recordingService.resumeRecording();
    setIsRecordingPaused(false);
  };

  const handleRecordingUpload = async () => {
    try {
      const recordedBlob = recordingService.getRecordedBlob();
      if (!recordedBlob) return;

      setIsUploading(true);
      setUploadProgress(0);
      const duration = recordingService.getDuration();

      toast.info('Đang tải video lên server...');
      await uploadRecording(
        interviewId,
        recordedBlob,
        { duration, size: recordedBlob.size },
        (progress) => setUploadProgress(progress)
      );

      setIsUploading(false);
      setUploadProgress(0);
      toast.success('Video đã được tải lên thành công');
      interviewSocketService.notifyRecordingStopped(interviewId, duration);
    } catch (error) {
      setIsUploading(false);
      toast.error('Không thể tải video lên: ' + error.message);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await interviewSocketService.sendChatMessage(interviewId, message);
      const newMessage = {
        id: response.message?._id || Date.now(),
        senderId: currentUserId,
        senderName: 'Bạn',
        message,
        timestamp: response.message?.timestamp || new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
    } catch {
      toast.error('Không thể gửi tin nhắn');
    }
  };

  // Participants list
  const participants = [
    {
      id: 'local',
      name: 'Bạn (Nhà tuyển dụng)',
      isLocal: true,
      isMuted: !isAudioEnabled,
      isCameraOff: !isVideoEnabled,
      isActiveSpeaker: false
    },
    ...(isRemoteUserJoined ? [{
      id: 'remote',
      name: remotePeerState.name,
      isLocal: false,
      isMuted: remotePeerState.isMuted,
      isCameraOff: remotePeerState.isCameraOff,
      isActiveSpeaker: false
    }] : [])
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Đang chuẩn bị phòng họp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 p-4">
        <Card className="max-w-md p-6 bg-slate-900 border-slate-800">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="w-full mt-4" onClick={() => navigate('/interviews')}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#202124] flex flex-col overflow-hidden text-slate-100 font-sans relative">
      {/* Floating Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map(item => (
          <div
            key={item.id}
            className="absolute bottom-20 text-4xl animate-float-up"
            style={{ left: `${item.left}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Floating Header (Overlay) */}
      <div className="absolute top-0 left-0 right-0 p-6 z-40 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-[#202124]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-lg flex flex-col">
          <h1 className="text-sm font-medium text-white tracking-tight">
            {interviewData?.candidateName || 'Phỏng vấn ứng viên'}
          </h1>
          <p className="text-xs text-zinc-400">
            {interviewData?.jobTitle || 'Vị trí'}
          </p>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {isRecording && (
            <div className="bg-red-500/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse font-medium shadow-lg border border-red-500/20">
              <span className="w-2 h-2 bg-white rounded-full shadow-sm" />
              REC
            </div>
          )}
          {isUploading && (
            <div className="bg-blue-500/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-medium shadow-lg border border-blue-500/20">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading {uploadProgress}%
            </div>
          )}
          <div className="bg-[#202124]/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg flex items-center gap-2">
            <ConnectionQualityIndicator quality={connectionQuality} details={qualityDetails} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Video Grid */}
        <div className={cn(
          "flex-1 transition-all duration-300 ease-in-out flex items-center justify-center",
          (isChatOpen || isParticipantsOpen) ? "p-2" : "p-4"
        )}>

          <div className={cn(
            "w-full h-full transition-all duration-500",
            isRemoteUserJoined
              ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-center content-center"
              : "flex justify-center items-center",
            (isRemoteUserJoined && !isChatOpen && !isParticipantsOpen) && "max-w-6xl mx-auto"
          )}>

            {/* Remote Video */}
            {isRemoteUserJoined && (
              <VideoFrame
                stream={remoteStream}
                isMuted={remotePeerState.isMuted}
                isCameraOff={remotePeerState.isCameraOff}
                userName={remotePeerState.name}
                isLocal={false}
                connectionQuality={connectionQuality}
                className="w-full h-full max-h-[calc(100vh-100px)] object-cover rounded-xl border border-white/10"
              />
            )}

            {/* Local Video */}
            <VideoFrame
              stream={localStream}
              isMuted={!isAudioEnabled}
              isCameraOff={!isVideoEnabled}
              userName="Bạn (Nhà tuyển dụng)"
              isLocal={true}
              className={cn(
                "transition-all duration-500 rounded-xl overflow-hidden bg-[#3c4043] border border-white/10",
                !isRemoteUserJoined
                  ? cn(
                    "aspect-video shadow-2xl",
                    (isChatOpen || isParticipantsOpen)
                      ? "w-full max-h-[calc(100vh-100px)]"
                      : "w-full max-w-4xl max-h-[calc(100vh-100px)]"
                  )
                  : "w-full h-full max-h-[calc(100vh-100px)] object-cover"
              )}
            />

            {/* Waiting State Overlay */}
            {!isRemoteUserJoined && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 bg-[#202124]/90 backdrop-blur px-6 py-3 rounded-full border border-gray-700 flex items-center gap-3 shadow-lg z-10">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                <span className="text-gray-200">Đang chờ ứng viên tham gia...</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebars */}
        {isParticipantsOpen && (
          <ParticipantList
            participants={participants}
            onClose={() => setIsParticipantsOpen(false)}
          />
        )}

        {isChatOpen && (
          <div className="w-80 border-l border-gray-800 bg-[#202124] flex flex-col h-full z-20 shadow-xl">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClose={() => setIsChatOpen(false)}
              currentUserId={currentUserId}
              className="flex-1"
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Fixed at bottom */}
      <div className="w-full z-50 bg-[#202124] border-t border-gray-800">
        <ControlBar
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={false}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={() => toast.info('Tính năng chia sẻ màn hình đang phát triển')}
          onToggleChat={() => {
            setIsChatOpen(!isChatOpen);
            if (isParticipantsOpen) setIsParticipantsOpen(false);
          }}
          onToggleParticipants={() => {
            setIsParticipantsOpen(!isParticipantsOpen);
            if (isChatOpen) setIsChatOpen(false);
          }}
          onEndCall={handleEndCall}
          interviewId={interviewId}
          interviewTitle={interviewData?.jobTitle}
          onSendEmoji={handleSendEmoji}
        >
          {/* Recording Controls injected here */}
          <RecordingControls
            isRecording={isRecording}
            onToggle={handleRecordingToggle}
            disabled={!isRemoteUserJoined || isUploading}
            isPaused={isRecordingPaused}
            onPause={handleRecordingPause}
            onResume={handleRecordingResume}
            localStream={localStream}
            remoteStream={remoteStream}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
          />
        </ControlBar>
      </div>

      <ConfirmationDialog
        open={confirmEndCallOpen}
        onOpenChange={setConfirmEndCallOpen}
        title="Kết thúc phỏng vấn?"
        description="Bạn có chắc chắn muốn kết thúc cuộc phỏng vấn này?"
        onConfirm={executeEndCall}
        confirmText="Kết thúc"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
};

export default InterviewRoom;
