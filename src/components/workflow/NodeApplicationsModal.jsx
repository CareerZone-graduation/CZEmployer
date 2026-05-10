import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, User, Clock, Loader2, Calendar, ChevronRight } from 'lucide-react';
import * as applicationService from '@/services/applicationService';
import * as workflowService from '@/services/workflowService';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Xác định trạng thái chi tiết của ứng viên trong bước phỏng vấn (SCHEDULED_INTERVIEW).
 * Trả về { label, className }
 */
const getInterviewSubStatus = (app) => {
  if (app.status !== 'SCHEDULED_INTERVIEW') return null;

  const interview = app.interview;

  if (app.interview_result === 'PASSED') {
    return { label: 'PV Đạt', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  
  if (app.interview_result === 'FAILED') {
    return { label: 'PV Không Đạt', className: 'bg-rose-100 text-rose-800 border-rose-200' };
  }

  if (!interview) {
    return { label: 'Chờ lên lịch', className: 'bg-amber-100 text-amber-800 border-amber-200' };
  }

  switch (interview.status) {
    case 'SCHEDULED': {
      // Đã lên lịch — kiểm tra giờ đã qua chưa
      const isPastTime = interview.scheduledTime && isPast(new Date(interview.scheduledTime));
      if (isPastTime) {
        return { label: 'Chờ phỏng vấn', className: 'bg-orange-100 text-orange-800 border-orange-200' };
      }
      return { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    case 'IN_PROGRESS':
      return { label: 'Đang phỏng vấn', className: 'bg-green-100 text-green-800 border-green-200' };
    case 'COMPLETED':
    case 'ENDED':
      return { label: 'Chờ đánh giá', className: 'bg-purple-100 text-purple-800 border-purple-200' };
    default:
      return { label: 'Chờ phỏng vấn', className: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
};

const NodeApplicationsModal = ({ isOpen, onClose, node, jobId, onViewApplication }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  useEffect(() => {
    if (isOpen && node && jobId) {
      fetchApplications();
    }
  }, [isOpen, node, jobId]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationService.getJobApplications(jobId, {
        currentNodeId: node.id,
        limit: 50,
      });
      setApplications(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải danh sách ứng viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (app) => {
    const executionId = app.latestExecution?._id;
    if (!executionId) return;

    setRetryingId(app._id);
    try {
      await workflowService.retryExecution(executionId);
      toast.success('Đã gửi yêu cầu chạy lại workflow thành công');
      await fetchApplications();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi khi thử lại workflow');
    } finally {
      setRetryingId(null);
    }
  };

  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Danh sách ứng viên tại bước:{' '}
            <Badge variant="outline" className="ml-1 bg-slate-100">
              {node.data?.label || node.type}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Nhấn vào ứng viên để xem chi tiết và xử lý thủ công
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không có ứng viên nào đang ở bước này
            </div>
          ) : (
            applications.map((app) => {
              const hasError = app.latestExecution?.status === 'FAILED';
              const errorMessage = app.latestExecution?.result?.errorMessage;
              const interviewSub = getInterviewSubStatus(app);

              return (
                <div
                  key={app._id}
                  className={`border rounded-lg p-4 flex items-start justify-between gap-4 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    hasError
                      ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                      : 'border-slate-200 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}
                  onClick={() => onViewApplication && onViewApplication(app._id)}
                >
                  {/* Left: Avatar + Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border shrink-0">
                      <AvatarImage src={app.candidateAvatar} />
                      <AvatarFallback>
                        <User className="h-5 w-5 text-slate-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm text-slate-900">{app.candidateName}</h4>
                      <div className="text-xs text-slate-500 mt-1 space-y-1">
                        <p className="truncate">{app.candidateEmail}</p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          Ứng tuyển: {format(new Date(app.appliedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </p>
                        {/* Hiển thị thời gian phỏng vấn nếu đã lên lịch */}
                        {app.interview?.scheduledTime && (
                          <p className="flex items-center gap-1 text-blue-600">
                            <Calendar className="h-3 w-3 shrink-0" />
                            Phỏng vấn: {format(new Date(app.interview.scheduledTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        )}
                      </div>

                      {hasError && (
                        <div className="mt-2 text-xs text-red-600 flex items-start gap-1.5 bg-red-50 p-2 rounded border border-red-100">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Lỗi thực thi workflow</p>
                            <p className="opacity-90 line-clamp-2" title={errorMessage}>
                              {errorMessage || 'Lỗi không xác định'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Badge trạng thái phỏng vấn chi tiết */}
                    {interviewSub ? (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase border ${interviewSub.className}`}
                      >
                        {interviewSub.label}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {app.status}
                      </Badge>
                    )}

                    {hasError && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry(app);
                        }}
                        disabled={retryingId === app._id}
                      >
                        {retryingId === app._id ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Thử lại
                      </Button>
                    )}

                    {/* Indicator click để xem */}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeApplicationsModal;
