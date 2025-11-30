import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as interviewService from '@/services/interviewService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatDate';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { Calendar, Edit, Trash2, ArrowLeft, Clock, ArrowRight, FilePlus, XCircle, Video } from 'lucide-react';
import RescheduleInterviewModal from '@/components/interviews/RescheduleInterviewModal';
import Modal from '@/components/common/Modal';
import ApplicationDetail from '@/pages/jobs/ApplicationDetail';

const DetailItem = ({ label, children, className }) => (
  <div className={className}>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <div className="mt-1 text-gray-900 dark:text-gray-100">{children || '-'}</div>
  </div>
);

const HistoryItem = ({ item }) => {
  if (!item) return null;

  const renderActionDetails = () => {
    switch (item.action) {
      case 'CREATED':
        return (
          <div className="flex items-center text-sm mt-1">
            <FilePlus className="h-4 w-4 mr-2 text-green-500" />
            <span>Cuộc phỏng vấn đã được tạo.</span>
          </div>
        );
      case 'RESCHEDULED':
        return (
          <>
            <div className="flex flex-wrap items-center text-sm mt-1">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="line-through text-gray-500">{formatDate(item.fromTime)}</span>
              <ArrowRight className="h-4 w-4 mx-2 text-primary" />
              <span className="font-semibold text-primary">{formatDate(item.toTime)}</span>
            </div>
            {item.reason && <p className="text-sm mt-1 pl-6"><strong>Lý do:</strong> {item.reason}</p>}
          </>
        );
      case 'CANCELLED':
        return (
          <>
            <div className="flex items-center text-sm mt-1">
              <XCircle className="h-4 w-4 mr-2 text-destructive" />
              <span className="text-destructive">Cuộc phỏng vấn đã bị hủy.</span>
            </div>
            {item.reason && <p className="text-sm mt-1 pl-6"><strong>Lý do:</strong> {item.reason}</p>}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative pl-8 py-4 border-l border-gray-200 dark:border-gray-700 last:border-l-transparent">
      <div className="absolute left-[-9px] top-5 h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-600"></div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.timestamp)}</p>
      {renderActionDetails()}
    </div>
  );
};

const InterviewDetail = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [viewingApplicationId, setViewingApplicationId] = useState(null);

  const fetchInterviewDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await interviewService.getInterviewById(interviewId);
      setInterview(response.data);
    } catch {
      setError('Không thể tải chi tiết phỏng vấn.');
      toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchInterviewDetail();
  }, [fetchInterviewDetail]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'STARTED': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'destructive';
      case 'RESCHEDULED': return 'warning';
      default: return 'outline';
    }
  };

  const checkJoinStatus = () => {
    if (!interview || (interview.status !== 'SCHEDULED' && interview.status !== 'STARTED' && interview.status !== 'RESCHEDULED')) return { canJoin: false, reason: 'Phỏng vấn chưa được lên lịch hoặc đã kết thúc.' };

    const scheduledTime = new Date(interview.scheduledTime);
    const now = new Date();
    const diffMinutes = Math.floor((scheduledTime - now) / 1000 / 60);

    if (diffMinutes > 15) {
      return { canJoin: false, reason: 'Chưa đến giờ phỏng vấn. Vui lòng quay lại trước 15 phút.' };
    }

    if (diffMinutes < -30) {
      return { canJoin: false, reason: 'Đã quá thời gian tham gia phỏng vấn (30 phút sau khi bắt đầu).' };
    }

    return { canJoin: true, reason: 'Bạn có thể tham gia phỏng vấn ngay bây giờ' };
  };

  const confirmReschedule = async (data) => {
    setActionLoading(true);
    try {
      await interviewService.rescheduleInterview(interviewId, data);
      toast.success('Dời lịch phỏng vấn thành công!');
      setRescheduleModalOpen(false);
      fetchInterviewDetail(); // Refresh details
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể dời lịch phỏng vấn.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy.');
      return;
    }

    setActionLoading(true);
    try {
      await interviewService.cancelInterview(interviewId, { reason: cancelReason });
      toast.success('Hủy phỏng vấn thành công!');
      setCancelAlertOpen(false);
      setCancelReason('');
      fetchInterviewDetail(); // Refresh details
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy phỏng vấn.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchInterviewDetail} />;
  }

  if (!interview) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{interview.job?.title}</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-md text-gray-600 dark:text-gray-300">
                  Ứng viên: <span className="font-semibold text-gray-900 dark:text-white">{interview.candidate?.fullName}</span>
                </p>
                {interview.application?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    onClick={() => setViewingApplicationId(interview.application.id)}
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Xem hồ sơ ứng tuyển
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
              <Badge variant={getStatusVariant(interview.status)} className="text-sm px-3 py-1">
                {interview.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <DetailItem label="Thời gian">
              <p className="text-lg font-semibold">{formatDate(interview.scheduledTime)}</p>
            </DetailItem>
            <DetailItem label="Tên phòng">
              <p>{interview.roomName}</p>
            </DetailItem>
            <DetailItem label="Công ty">
              <p>{interview.job?.company?.name}</p>
            </DetailItem>
          </div>

          {/* Join Interview Status Card */}
          {(interview.status === 'SCHEDULED' || interview.status === 'STARTED' || interview.status === 'RESCHEDULED') && (
            (() => {
              const { canJoin, reason } = checkJoinStatus();
              return (
                <div className={`mb-6 p-4 rounded-lg border-2 ${canJoin ? 'bg-green-50 border-green-500 dark:bg-green-900/20' : 'bg-gray-50 border-gray-300 dark:bg-gray-800'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${canJoin ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <Video className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {canJoin ? 'Sẵn sàng tham gia phỏng vấn' : 'Trạng thái phỏng vấn'}
                        </h3>
                        <p className={`text-sm ${canJoin ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          {reason}
                        </p>
                      </div>
                    </div>
                    {canJoin && (
                      <Button
                        onClick={() => navigate(`/interviews/${interview.id}/device-test`)}
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Video className="mr-2 h-5 w-5" />
                        Tham gia phỏng vấn
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()
          )}

          <DetailItem label="Lịch sử thay đổi" className="mb-6">
            <div>
              {(interview.changeHistory && interview.changeHistory.length > 0) ? (
                interview.changeHistory
                  .slice()
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((item) => (
                    <HistoryItem key={item._id} item={item} />
                  ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có lịch sử thay đổi.</p>
              )}
            </div>
          </DetailItem>

          <div className="flex items-center justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 pt-6">
            <Button
              variant="outline"
              onClick={() => setRescheduleModalOpen(true)}
              disabled={interview.status === 'CANCELLED' || interview.status === 'COMPLETED'}
            >
              <Edit className="mr-2 h-4 w-4" />
              Dời lịch
            </Button>
            <Button
              variant="destructive"
              onClick={() => setCancelAlertOpen(true)}
              disabled={interview.status === 'CANCELLED' || interview.status === 'COMPLETED'}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hủy lịch
            </Button>
          </div>
        </div>
      </div>

      <RescheduleInterviewModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onSubmit={confirmReschedule}
        loading={actionLoading}
      />

      <Dialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hủy buổi phỏng vấn</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do hủy. Hành động này sẽ thông báo cho ứng viên.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="cancel-reason">Lý do hủy</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Thay đổi lịch trình nội bộ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelAlertOpen(false)}>
              Bỏ qua
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={actionLoading || !cancelReason.trim()}
            >
              {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Modal
        isOpen={!!viewingApplicationId}
        onClose={() => setViewingApplicationId(null)}
        title="Chi tiết đơn ứng tuyển"
        size="full"
      >
        {viewingApplicationId && (
          <ApplicationDetail
            applicationId={viewingApplicationId}
            jobId={interview.job?.id || interview.job?._id}
            isModal={true}
            onViewPreviousApplication={(prevAppId) => setViewingApplicationId(prevAppId)}
          />
        )}
      </Modal>
    </div>
  );
};

export default InterviewDetail;