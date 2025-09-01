import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as interviewService from '@/services/interviewService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import JobListSkeleton from '@/components/common/JobListSkeleton';

const InterviewList = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await interviewService.getMyInterviews({ page: 1, limit: 20 });
      setInterviews(response.data);
    } catch {
      setError('Không thể tải danh sách phỏng vấn. Vui lòng thử lại.');
      toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

 const getStatusInfo = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          variant: 'default',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
        };
      case 'STARTED':
        return {
          variant: 'default',
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200',
        };
      case 'COMPLETED':
        return {
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
        };
      case 'CANCELLED':
        // Giữ nguyên variant destructive cho màu đỏ
        return { variant: 'destructive' };
      case 'RESCHEDULED':
        return {
          variant: 'default',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
        };
      default:
        // Trạng thái mặc định
        return { variant: 'outline' };
    }
  };

  const handleViewDetails = (interviewId) => {
    navigate(`/interviews/${interviewId}`);
  };

  const openCancelDialog = (interview) => {
    setSelectedInterview(interview);
    setIsCancelDialogOpen(true);
    setCancelReason('');
  };

  const handleCancelInterview = async () => {
    if (!selectedInterview) return;

    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy phỏng vấn.');
      return;
    }

    try {
      await interviewService.cancelInterview(selectedInterview.id, { reason: cancelReason });
      toast.success('Hủy lịch phỏng vấn thành công.');
      fetchInterviews(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi hủy phỏng vấn.';
      toast.error(errorMessage);
    } finally {
      setIsCancelDialogOpen(false);
      setSelectedInterview(null);
    }
  };

  if (loading) {
    return <JobListSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchInterviews} />;
  }

  if (interviews.length === 0) {
    return <EmptyState title="Chưa có lịch phỏng vấn" message="Hiện tại bạn chưa có cuộc phỏng vấn nào được lên lịch." />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý Phỏng vấn</h1>
      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ứng viên</TableHead>
              <TableHead>Công việc</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell>
                  <div className="font-medium">{interview.candidate.fullName}</div>
                  <div className="text-sm text-muted-foreground">{interview.candidate.email}</div>
                </TableCell>
                <TableCell>{interview.job.title}</TableCell>
                <TableCell>{formatDate(interview.scheduledTime)}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusInfo(interview.status).variant}
                    className={cn(getStatusInfo(interview.status).className)}
                  >
                    {interview.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(interview.id)}>Xem chi tiết</DropdownMenuItem>
                      {interview.status === 'SCHEDULED' && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openCancelDialog(interview)}
                        >
                          Hủy phỏng vấn
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Bỏ qua
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInterview}
              disabled={!cancelReason.trim()}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewList;