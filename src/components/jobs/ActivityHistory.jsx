import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  GitCommit,
  UserCheck,
  CalendarIcon,
  Eye,
  CheckCircle,
  XCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';

const ACTION_MAP = {
  APPLICATION_SUBMITTED: {
    icon: UserCheck,
    color: 'text-blue-500',
    label: 'Nộp đơn ứng tuyển',
  },
  APPLICATION_VIEWED: {
    icon: Eye,
    color: 'text-gray-500',
    label: 'Đã xem hồ sơ',
  },
  SUITABLE: {
    icon: ThumbsUp,
    color: 'text-green-500',
    label: 'Đánh giá phù hợp',
  },
  SCHEDULED_INTERVIEW: {
    icon: CalendarIcon,
    color: 'text-cyan-500',
    label: 'Lên lịch phỏng vấn',
  },
  INTERVIEW_RESCHEDULED: {
    icon: Clock,
    color: 'text-orange-500',
    label: 'Dời lịch phỏng vấn',
  },
  INTERVIEW_CANCELLED: {
    icon: XCircle,
    color: 'text-red-500',
    label: 'Hủy lịch phỏng vấn',
  },
  INTERVIEW_COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    label: 'Hoàn thành phỏng vấn',
  },
  OFFER_SENT: {
    icon: Send,
    color: 'text-purple-500',
    label: 'Gửi lời mời làm việc',
  },
  OFFER_ACCEPTED: {
    icon: CheckCircle,
    color: 'text-green-700',
    label: 'Chấp nhận lời mời',
  },
  OFFER_DECLINED: {
    icon: XCircle,
    color: 'text-red-700',
    label: 'Từ chối lời mời',
  },
  REJECTED: {
    icon: ThumbsDown,
    color: 'text-red-500',
    label: 'Từ chối ứng viên',
  },
  DEFAULT: {
    icon: GitCommit,
    color: 'text-gray-500',
    label: 'Hoạt động khác',
  }
};

const ActivityHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
        </CardContent>
      </Card>
    );
  }

  const renderDetail = (item) => {
    if (item.detail) {
      return <p className="text-xs text-muted-foreground pl-7">{item.detail}</p>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử hoạt động</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-4">
          <div className="relative pl-4">
            {/* Vertical line */}
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border" />

            <div className="space-y-6">
              {history.map((item, index) => {
                const actionConfig = ACTION_MAP[item.action] || ACTION_MAP.DEFAULT;
                const Icon = actionConfig.icon;
                return (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="absolute left-0 top-0.5 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-background">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-background ring-4 ring-background">
                          <Icon className={`h-5 w-5 ${actionConfig.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 pl-7 pt-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{actionConfig.label}</p>
                          <time className="text-xs text-muted-foreground">
                            {format(new Date(item.timestamp), "d MMM, yyyy 'lúc' HH:mm", { locale: vi })}
                          </time>
                        </div>
                        {renderDetail(item)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;