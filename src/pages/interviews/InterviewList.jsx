import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Calendar as CalendarIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import RescheduleInterviewModal from '@/components/interviews/RescheduleInterviewModal';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const InterviewList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch interviews with TanStack Query
  const { data: interviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ['interviews', statusFilter, debouncedSearch, dateRange],
    queryFn: async () => {
      const params = { page: 1, limit: 100 };
      // Only send status to API if it's a valid backend enum value
      // 'upcoming' and 'past' are client-side filters
      if (statusFilter !== 'all' && statusFilter !== 'upcoming' && statusFilter !== 'past') {
        params.status = statusFilter;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (dateRange?.from) {
        params.startDate = dateRange.from.toISOString();
      }
      if (dateRange?.to) {
        params.endDate = dateRange.to.toISOString();
      }
      const response = await interviewService.getMyInterviews(params);
      return response.data || [];
    },
  });

  const handleSearch = () => {
    setDebouncedSearch(search);
  };

  // Cancel interview mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => interviewService.cancelInterview(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews']);
      toast.success('Hủy lịch phỏng vấn thành công.');
      setIsCancelDialogOpen(false);
      setSelectedInterview(null);
      setCancelReason('');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi hủy phỏng vấn.';
      toast.error(errorMessage);
    },
  });

  // Reschedule interview mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, data }) => interviewService.rescheduleInterview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews']);
      toast.success('Dời lịch phỏng vấn thành công.');
      setIsRescheduleModalOpen(false);
      setSelectedInterview(null);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi dời lịch phỏng vấn.';
      toast.error(errorMessage);
    },
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          variant: 'default',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          label: 'Đã lên lịch',
        };
      case 'STARTED':
        return {
          variant: 'default',
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200',
          label: 'Đang diễn ra',
        };
      case 'COMPLETED':
        return {
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          label: 'Hoàn thành',
        };
      case 'CANCELLED':
        return {
          variant: 'destructive',
          label: 'Đã hủy',
        };
      case 'RESCHEDULED':
        return {
          variant: 'default',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
          label: 'Đã dời lịch',
        };
      default:
        return { variant: 'outline', label: status };
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

  const openRescheduleModal = (interview) => {
    setSelectedInterview(interview);
    setIsRescheduleModalOpen(true);
  };

  const handleCancelInterview = () => {
    if (!selectedInterview) return;

    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy phỏng vấn.');
      return;
    }

    cancelMutation.mutate({
      id: selectedInterview.id,
      reason: cancelReason,
    });
  };

  const handleRescheduleSubmit = (data) => {
    if (!selectedInterview) return;

    rescheduleMutation.mutate({
      id: selectedInterview.id,
      data,
    });
  };

  // Filter interviews by status
  const filteredInterviews = interviews.filter((interview) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'upcoming') {
      return interview.status === 'SCHEDULED' && new Date(interview.scheduledTime) > new Date();
    }
    if (statusFilter === 'past') {
      return interview.status === 'COMPLETED' || interview.status === 'CANCELLED';
    }
    return interview.status === statusFilter;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý Phỏng vấn</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi các buổi phỏng vấn của bạn
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="SCHEDULED">Đã lên lịch</TabsTrigger>
            <TabsTrigger value="RESCHEDULED">Đã dời lịch</TabsTrigger>
            <TabsTrigger value="COMPLETED">Hoàn thành</TabsTrigger>
            <TabsTrigger value="CANCELLED">Đã hủy</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto items-center gap-2">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm phỏng vấn..."
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">Tìm kiếm</Button>
        </div>
      </div>

      {isLoading ? (
        <InterviewTableSkeleton />
      ) : error ? (
        <ErrorState message="Không thể tải danh sách phỏng vấn. Vui lòng thử lại." onRetry={refetch} />
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          title="Chưa có lịch phỏng vấn"
          message={
            statusFilter === 'all' && !debouncedSearch && !dateRange?.from
              ? "Hiện tại bạn chưa có cuộc phỏng vấn nào được lên lịch."
              : "Không tìm thấy phỏng vấn nào phù hợp với bộ lọc."
          }
        />
      ) : (
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
              {filteredInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>
                    <div className="font-medium">{interview.candidate?.fullName || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{interview.candidate?.email || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{interview.roomName || 'N/A'}</TableCell>
                  <TableCell>{formatDateTime(interview.scheduledTime)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusInfo(interview.status).variant}
                      className={cn(getStatusInfo(interview.status).className)}
                    >
                      {getStatusInfo(interview.status).label}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(interview.id)}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        {interview.status === 'SCHEDULED' && (
                          <>
                            <DropdownMenuItem onClick={() => openRescheduleModal(interview)}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Dời lịch
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openCancelDialog(interview)}
                            >
                              Hủy phỏng vấn
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cancel Dialog */}
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
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Bỏ qua
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInterview}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <RescheduleInterviewModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSubmit={handleRescheduleSubmit}
        loading={rescheduleMutation.isPending}
      />
    </div>
  );
};

const InterviewTableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-5 w-32" /></TableHead>
          <TableHead><Skeleton className="h-5 w-40" /></TableHead>
          <TableHead><Skeleton className="h-5 w-32" /></TableHead>
          <TableHead><Skeleton className="h-5 w-24" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default InterviewList;