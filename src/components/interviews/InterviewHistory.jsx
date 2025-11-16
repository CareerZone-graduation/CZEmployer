import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  MessageSquare,
  Star,
  Calendar,
  Clock,
  User,
  Briefcase,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import * as interviewService from '@/services/interviewService';

const InterviewHistory = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // State
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackChanged, setFeedbackChanged] = useState(false);

  // Load interview data
  useEffect(() => {
    const loadInterview = async () => {
      try {
        setIsLoading(true);
        const data = await interviewService.getInterviewById(interviewId);
        setInterview(data);
        
        // Set initial feedback values
        if (data.feedback) {
          setRating(data.feedback.rating || 0);
          setNotes(data.feedback.notes || '');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading interview:', err);
        setError('Không thể tải thông tin phỏng vấn');
        toast.error('Không thể tải thông tin phỏng vấn');
        setIsLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    }
  }, [interviewId]);

  // Video player event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Video controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (interview?.recording?.url) {
      window.open(interview.recording.url, '_blank');
      toast.success('Đang tải xuống video...');
    } else {
      toast.error('Không có video để tải xuống');
    }
  };

  // Feedback handlers
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setFeedbackChanged(true);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setFeedbackChanged(true);
  };

  const handleSaveFeedback = async () => {
    try {
      setIsSavingFeedback(true);
      
      await interviewService.completeInterview(interviewId, {
        notes,
        rating
      });
      
      toast.success('Đã lưu đánh giá thành công');
      setFeedbackChanged(false);
      
      // Reload interview data
      const data = await interviewService.getInterviewById(interviewId);
      setInterview(data);
      
      setIsSavingFeedback(false);
    } catch (err) {
      console.error('Error saving feedback:', err);
      toast.error('Không thể lưu đánh giá');
      setIsSavingFeedback(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} giờ ${mins} phút`;
    }
    return `${mins} phút`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin phỏng vấn...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Lỗi</h2>
              <p className="text-muted-foreground mb-4">{error || 'Không tìm thấy phỏng vấn'}</p>
              <Button onClick={() => navigate('/interviews')}>
                Quay lại danh sách
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/interviews')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chi tiết phỏng vấn</h1>
            <p className="text-muted-foreground">
              Xem lại video, tin nhắn và đánh giá phỏng vấn
            </p>
          </div>
          <Badge
            variant={
              interview.status === 'completed' ? 'default' :
              interview.status === 'cancelled' ? 'destructive' :
              'secondary'
            }
          >
            {interview.status === 'completed' ? 'Đã hoàn thành' :
             interview.status === 'cancelled' ? 'Đã hủy' :
             interview.status === 'no-show' ? 'Không tham gia' :
             interview.status}
          </Badge>
        </div>
      </div>

      {/* Interview Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin phỏng vấn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ứng viên</p>
                <p className="font-medium">{interview.candidateName || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vị trí</p>
                <p className="font-medium">{interview.jobTitle || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ngày phỏng vấn</p>
                <p className="font-medium">
                  {interview.scheduledAt 
                    ? format(new Date(interview.scheduledAt), 'dd/MM/yyyy', { locale: vi })
                    : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Thời lượng</p>
                <p className="font-medium">{formatDuration(interview.duration)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="recording" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recording">Video ghi hình</TabsTrigger>
          <TabsTrigger value="chat">Tin nhắn</TabsTrigger>
          <TabsTrigger value="feedback">Đánh giá</TabsTrigger>
        </TabsList>

        {/* Recording Tab */}
        <TabsContent value="recording" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video phỏng vấn</CardTitle>
              <CardDescription>
                Xem lại video phỏng vấn đã ghi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interview.recording?.url ? (
                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      src={interview.recording.url}
                      className="w-full h-full"
                      onClick={togglePlay}
                    />
                    
                    {/* Play/Pause Overlay */}
                    {!isPlaying && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                        onClick={togglePlay}
                      >
                        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="h-10 w-10 text-black ml-1" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="space-y-2">
                    {/* Progress Bar */}
                    <div
                      className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={togglePlay}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleMute}
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <span className="text-sm text-muted-foreground">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleDownload}
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleFullscreen}
                        >
                          <Maximize className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Recording Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Kích thước: {interview.recording.size 
                        ? `${(interview.recording.size / (1024 * 1024)).toFixed(2)} MB`
                        : 'N/A'}
                    </span>
                    <span>
                      Thời lượng: {interview.recording.duration
                        ? formatTime(interview.recording.duration)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Không có video ghi hình cho phỏng vấn này
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử tin nhắn</CardTitle>
              <CardDescription>
                Xem lại các tin nhắn trong phỏng vấn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interview.chatTranscript && interview.chatTranscript.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {interview.chatTranscript.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex flex-col",
                          message.senderId === interview.recruiterId
                            ? "items-end"
                            : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            message.senderId === interview.recruiterId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm font-medium mb-1">
                            {message.senderId === interview.recruiterId
                              ? "Bạn"
                              : interview.candidateName}
                          </p>
                          <p className="text-sm break-words">{message.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {format(new Date(message.timestamp), 'HH:mm', { locale: vi })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Không có tin nhắn nào trong phỏng vấn này
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá phỏng vấn</CardTitle>
              <CardDescription>
                Thêm hoặc chỉnh sửa đánh giá của bạn về ứng viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label>Đánh giá tổng thể</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating > 0 ? `${rating}/5 sao` : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú đánh giá</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Nhập đánh giá chi tiết về ứng viên..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {notes.length}/2000 ký tự
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRating(interview.feedback?.rating || 0);
                    setNotes(interview.feedback?.notes || '');
                    setFeedbackChanged(false);
                  }}
                  disabled={!feedbackChanged || isSavingFeedback}
                >
                  Hủy thay đổi
                </Button>
                <Button
                  onClick={handleSaveFeedback}
                  disabled={!feedbackChanged || isSavingFeedback}
                >
                  {isSavingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu đánh giá'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewHistory;
