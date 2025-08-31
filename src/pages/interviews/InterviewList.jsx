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
                      {/* Các hành động khác có thể được thêm lại ở đây nếu cần */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InterviewList;