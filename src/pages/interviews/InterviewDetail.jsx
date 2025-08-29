import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as interviewService from '@/services/interviewService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatDate';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { Calendar, Edit, Trash2, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import RescheduleInterviewModal from '@/components/interviews/RescheduleInterviewModal';

const DetailItem = ({ label, children, className }) => (
  <div className={className}>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <div className="mt-1 text-gray-900 dark:text-gray-100">{children || '-'}</div>
  </div>
);

const HistoryItem = ({ item }) => {
  if (!item || item.action !== 'RESCHEDULED') return null;

  return (
    <div className="relative pl-8 py-4 border-l border-gray-200 dark:border-gray-700 last:border-l-transparent">
      <div className="absolute left-[-9px] top-5 h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-600"></div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.timestamp)}</p>
      <div className="flex flex-wrap items-center text-sm mt-1">
        <Clock className="h-4 w-4 mr-2 text-gray-500" />
        <span className="line-through text-gray-500">{formatDate(item.fromTime)}</span>
        <ArrowRight className="h-4 w-4 mx-2 text-primary" />
        <span className="font-semibold text-primary">{formatDate(item.toTime)}</span>
      </div>
      {item.reason && <p className="text-sm mt-1"><strong>Lý do:</strong> {item.reason}</p>}
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
    setActionLoading(true);
    try {
      await interviewService.cancelInterview(interviewId);
      toast.success('Hủy phỏng vấn thành công!');
      setCancelAlertOpen(false);
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
              <p className="text-md text-gray-600 dark:text-gray-300 mt-1">
                Ứng viên: {interview.candidate?.fullName}
              </p>
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

          <DetailItem label="Lịch sử thay đổi" className="mb-6">
            <div>
              {(interview.changeHistory && interview.changeHistory.filter(item => item.action === 'RESCHEDULED').length > 0) ? (
                interview.changeHistory
                  .slice() // Tạo một bản sao để tránh thay đổi mảng gốc
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sắp xếp từ mới nhất đến cũ nhất
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
              disabled={interview.status === 'CANCELLED'}
            >
              <Edit className="mr-2 h-4 w-4" />
              Dời lịch
            </Button>
            <Button
              variant="destructive"
              onClick={() => setCancelAlertOpen(true)}
              disabled={interview.status === 'CANCELLED'}
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

      <AlertDialog open={cancelAlertOpen} onOpenChange={setCancelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Cuộc phỏng vấn sẽ bị hủy vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={actionLoading}>
              {actionLoading ? 'Đang hủy...' : 'Có, hủy phỏng vấn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InterviewDetail;