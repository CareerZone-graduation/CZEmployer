import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DeviceTest = ({ interviewId: propInterviewId, onComplete }) => {
  const navigate = useNavigate();
  const { interviewId: paramInterviewId } = useParams();
  const interviewId = propInterviewId || paramInterviewId;
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Device lists
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  
  // Selected devices
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  
  // Device states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Stream
  const [localStream, setLocalStream] = useState(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'checking', // 'checking', 'granted', 'denied'
    microphone: 'checking'
  });
  
  // Browser compatibility
  const [browserCompatibility, setBrowserCompatibility] = useState({
    isCompatible: true,
    issues: []
  });

  // Check browser compatibility
  useEffect(() => {
    checkBrowserCompatibility();
  }, []);

  const checkBrowserCompatibility = () => {
    const issues = [];
    
    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      issues.push('Trình duyệt không hỗ trợ truy cập camera/microphone');
    }
    
    // Check for WebRTC support
    if (!window.RTCPeerConnection) {
      issues.push('Trình duyệt không hỗ trợ WebRTC');
    }
    
    // Check for secure context (HTTPS)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Yêu cầu kết nối HTTPS để sử dụng camera/microphone');
    }
    
    // Browser recommendations
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
    const isFirefox = userAgent.includes('firefox');
    const isEdge = userAgent.includes('edge');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    if (!isChrome && !isFirefox && !isEdge && !isSafari) {
      issues.push('Khuyến nghị sử dụng Chrome, Firefox, Edge hoặc Safari để có trải nghiệm tốt nhất');
    }
    
    setBrowserCompatibility({
      isCompatible: issues.length === 0,
      issues
    });
  };

  // Request permissions first, then get available devices
  useEffect(() => {
    const requestPermissionsAndGetDevices = async () => {
      try {
        setIsLoading(true);
        
        // Load saved device settings
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : null;
        console.log('[DeviceTest] Loaded saved settings:', deviceSettings);
        
        // Request permissions first to get full device list with labels
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // Stop the temporary stream immediately
        stream.getTracks().forEach(track => track.stop());
        
        // Now enumerate devices with permissions granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);
        
        // Set devices from saved settings or use default
        if (videoInputs.length > 0) {
          if (deviceSettings?.videoDeviceId && videoInputs.some(d => d.deviceId === deviceSettings.videoDeviceId)) {
            setSelectedVideoDevice(deviceSettings.videoDeviceId);
          } else if (!selectedVideoDevice) {
            setSelectedVideoDevice(videoInputs[0].deviceId);
          }
        }
        
        if (audioInputs.length > 0) {
          if (deviceSettings?.audioDeviceId && audioInputs.some(d => d.deviceId === deviceSettings.audioDeviceId)) {
            setSelectedAudioDevice(deviceSettings.audioDeviceId);
          } else if (!selectedAudioDevice) {
            setSelectedAudioDevice(audioInputs[0].deviceId);
          }
        }
        
        // Apply saved enabled states
        if (deviceSettings) {
          if (typeof deviceSettings.isVideoEnabled === 'boolean') {
            setIsVideoEnabled(deviceSettings.isVideoEnabled);
          }
          if (typeof deviceSettings.isAudioEnabled === 'boolean') {
            setIsAudioEnabled(deviceSettings.isAudioEnabled);
          }
        }
        
        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error requesting permissions or enumerating devices:', error);
        
        // Handle specific errors
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          });
          toast.error('Vui lòng cấp quyền truy cập camera và microphone để tiếp tục');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          toast.error('Không tìm thấy camera hoặc microphone. Vui lòng kiểm tra thiết bị của bạn.');
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          });
        } else {
          toast.error('Không thể truy cập thiết bị: ' + error.message);
        }
        
        setIsLoading(false);
      }
    };

    requestPermissionsAndGetDevices();
  }, []);

  // Request permissions and start stream
  useEffect(() => {
    if (selectedVideoDevice && selectedAudioDevice) {
      startMediaStream();
    }
    
    return () => {
      stopMediaStream();
    };
  }, [selectedVideoDevice, selectedAudioDevice, isVideoEnabled, isAudioEnabled]);

  // Update video element when localStream changes
  useEffect(() => {
    if (videoRef.current && localStream && isVideoEnabled) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoEnabled]);

  const startMediaStream = async () => {
    try {
      setIsLoading(true);
      
      // Stop existing stream
      stopMediaStream();
      
      const constraints = {
        video: isVideoEnabled ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: isAudioEnabled ? {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      
      // Setup audio level monitoring
      if (isAudioEnabled) {
        setupAudioMonitoring(stream);
      }
      
      // Update permission status
      setPermissionStatus({
        camera: isVideoEnabled ? 'granted' : 'checking',
        microphone: isAudioEnabled ? 'granted' : 'checking'
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Handle specific errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus({
          camera: isVideoEnabled ? 'denied' : 'checking',
          microphone: isAudioEnabled ? 'denied' : 'checking'
        });
        toast.error('Vui lòng cấp quyền truy cập camera và microphone');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error('Không tìm thấy camera hoặc microphone');
      } else {
        toast.error('Không thể truy cập thiết bị: ' + error.message);
      }
      
      setIsLoading(false);
    }
  };

  const stopMediaStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const setupAudioMonitoring = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 255) * 100);
    
    setAudioLevel(normalizedLevel);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const handleVideoDeviceChange = (deviceId) => {
    setSelectedVideoDevice(deviceId);
  };

  const handleAudioDeviceChange = (deviceId) => {
    setSelectedAudioDevice(deviceId);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
  };

  const handleJoinInterview = () => {
    // Save device settings to localStorage
    const deviceSettings = {
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      isVideoEnabled,
      isAudioEnabled
    };
    
    console.log('[DeviceTest] Saving device settings:', deviceSettings);
    localStorage.setItem('interviewDeviceSettings', JSON.stringify(deviceSettings));
    
    if (onComplete) {
      onComplete(deviceSettings);
    } else {
      navigate(`/interviews/${interviewId}/room`);
    }
  };

  const getPermissionIcon = (status) => {
    switch (status) {
      case 'granted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
    }
  };

  const canJoinInterview = 
    permissionStatus.camera === 'granted' && 
    permissionStatus.microphone === 'granted' &&
    browserCompatibility.isCompatible;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Kiểm tra thiết bị</h1>
          <p className="text-muted-foreground">
            Đảm bảo camera và microphone hoạt động tốt trước khi tham gia phỏng vấn
          </p>
        </div>

        {/* Browser Compatibility Warning */}
        {!browserCompatibility.isCompatible && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-5 w-5" />
                Cảnh báo tương thích
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                {browserCompatibility.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái quyền truy cập</CardTitle>
            <CardDescription>
              Kiểm tra quyền truy cập camera và microphone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-muted-foreground" />
                <span>Camera</span>
              </div>
              <div className="flex items-center gap-2">
                {getPermissionIcon(permissionStatus.camera)}
                <Badge variant={permissionStatus.camera === 'granted' ? 'default' : 'destructive'}>
                  {permissionStatus.camera === 'granted' ? 'Đã cấp quyền' : 
                   permissionStatus.camera === 'denied' ? 'Bị từ chối' : 'Đang kiểm tra'}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-muted-foreground" />
                <span>Microphone</span>
              </div>
              <div className="flex items-center gap-2">
                {getPermissionIcon(permissionStatus.microphone)}
                <Badge variant={permissionStatus.microphone === 'granted' ? 'default' : 'destructive'}>
                  {permissionStatus.microphone === 'granted' ? 'Đã cấp quyền' : 
                   permissionStatus.microphone === 'denied' ? 'Bị từ chối' : 'Đang kiểm tra'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Xem trước camera</CardTitle>
            <CardDescription>
              Kiểm tra hình ảnh từ camera của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Display */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {isVideoEnabled && !isLoading ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                        <p>Đang tải camera...</p>
                      </>
                    ) : (
                      <>
                        <VideoOff className="h-12 w-12 mx-auto mb-2" />
                        <p>Camera đã tắt</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="video-device">Chọn camera</Label>
                <Select
                  value={selectedVideoDevice}
                  onValueChange={handleVideoDeviceChange}
                  disabled={videoDevices.length === 0}
                >
                  <SelectTrigger id="video-device">
                    <SelectValue placeholder="Chọn camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.filter(device => device.deviceId && device.deviceId.trim() !== '').map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={isVideoEnabled ? "default" : "outline"}
                onClick={toggleVideo}
                className="w-full"
              >
                {isVideoEnabled ? (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Tắt camera
                  </>
                ) : (
                  <>
                    <VideoOff className="h-4 w-4 mr-2" />
                    Bật camera
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audio Test */}
        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra microphone</CardTitle>
            <CardDescription>
              Nói thử để kiểm tra mức âm lượng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio Level Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mức âm lượng</span>
                <span className="font-medium">{Math.round(audioLevel)}%</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-100 rounded-full",
                    audioLevel > 70 ? "bg-green-500" :
                    audioLevel > 30 ? "bg-yellow-500" :
                    "bg-gray-400"
                  )}
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {audioLevel > 5 ? 'Microphone đang hoạt động tốt' : 'Hãy thử nói gì đó...'}
              </p>
            </div>

            {/* Audio Controls */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="audio-device">Chọn microphone</Label>
                <Select
                  value={selectedAudioDevice}
                  onValueChange={handleAudioDeviceChange}
                  disabled={audioDevices.length === 0}
                >
                  <SelectTrigger id="audio-device">
                    <SelectValue placeholder="Chọn microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.filter(device => device.deviceId && device.deviceId.trim() !== '').map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={isAudioEnabled ? "default" : "outline"}
                onClick={toggleAudio}
                className="w-full"
              >
                {isAudioEnabled ? (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Tắt microphone
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Bật microphone
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Permission Denied Help */}
        {(permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-5 w-5" />
                Quyền truy cập bị từ chối
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-red-700 dark:text-red-300">
              <p>Để tham gia phỏng vấn, bạn cần cấp quyền truy cập camera và microphone:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Nhấp vào biểu tượng khóa/camera trên thanh địa chỉ</li>
                <li>Chọn "Cho phép" cho camera và microphone</li>
                <li>Tải lại trang này</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/interviews')}
            className="flex-1"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleJoinInterview}
            disabled={!canJoinInterview || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Tham gia phỏng vấn'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceTest;
