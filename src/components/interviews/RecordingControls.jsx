import { useState, useEffect } from 'react';
import { Circle, Square, Pause, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import recordingService from '@/services/recording.service';
import { ControlButton } from './ControlBar';

const RecordingControls = ({
  isRecording,
  onToggle,
  disabled = false,
  isPaused = false,
  onPause,
  onResume,
  localStream,
  remoteStream,
  localVideoRef,
  remoteVideoRef
}) => {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Update duration every second while recording
  useEffect(() => {
    let interval;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        const duration = recordingService.getDuration();
        setRecordingDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const handleStartRecording = () => {
    // setShowStartDialog(true);
    toast.info('Tính năng ghi hình đang phát triển');
  };

  const handleStopRecording = () => {
    setShowStopDialog(true);
    toast.info('Tính năng ghi hình đang phát triển');
  };

  const handlePauseResume = () => {
    if (isPaused) {
      onResume?.();
    } else {
      onPause?.();
    }
  };

  const confirmStartRecording = async () => {
    setShowStartDialog(false);

    try {
      if (!localStream && !remoteStream) {
        toast.error('Không có stream nào để ghi hình');
        return;
      }

      await recordingService.startRecording({
        localStream,
        remoteStream,
        localVideo: localVideoRef?.current,
        remoteVideo: remoteVideoRef?.current
      });

      onToggle(true);
      toast.success('Đã bắt đầu ghi hình');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Không thể bắt đầu ghi hình: ' + error.message);
    }
  };

  const confirmStopRecording = async () => {
    setShowStopDialog(false);

    try {
      const blob = await recordingService.stopRecording();
      onToggle(false);
      toast.success('Đã dừng ghi hình. Đang xử lý video...');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast.error('Không thể dừng ghi hình: ' + error.message);
    }
  };

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const buttonContent = (
    <div className="flex items-center gap-2">
      {/* <Button
        size="lg"
        variant={isRecording ? "destructive" : "outline"}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={disabled}
        className="rounded-full w-14 h-14"
      >
        {isRecording ? (
          <Square className="h-6 w-6" />
        ) : (
          <Circle className="h-6 w-6" />
        )}
      </Button> */}
      <ControlButton
        icon={Circle}
        label="Ghi hình cuộc họp"
        isActive={false}
        variant="secondary"
        onClick={() => toast.info('Tính năng ghi hình đang phát triển')}
      />


      {isRecording && (
        <>
          <Button
            size="lg"
            variant="outline"
            onClick={handlePauseResume}
            className="rounded-full w-14 h-14"
          >
            {isPaused ? (
              <Play className="h-6 w-6" />
            ) : (
              <Pause className="h-6 w-6" />
            )}
          </Button>

          <div className="text-white text-sm font-mono bg-gray-800 px-3 py-2 rounded-md">
            {formatDuration(recordingDuration)}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {disabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>Chờ ứng viên tham gia để bắt đầu ghi hình</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        buttonContent
      )}

      {/* Start Recording Confirmation Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bắt đầu ghi hình?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn sắp bắt đầu ghi hình cuộc phỏng vấn này. Ứng viên sẽ được thông báo rằng cuộc phỏng vấn đang được ghi hình.
              </p>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Video sẽ được lưu trữ an toàn trên hệ thống</li>
                    <li>Chỉ bạn và team tuyển dụng có quyền xem</li>
                    <li>Ứng viên có quyền yêu cầu xóa video sau phỏng vấn</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartRecording}>
              Bắt đầu ghi hình
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stop Recording Confirmation Dialog */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dừng ghi hình?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn dừng ghi hình? Video sẽ được xử lý và lưu trữ tự động.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục ghi</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStopRecording}>
              Dừng ghi hình
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecordingControls;
