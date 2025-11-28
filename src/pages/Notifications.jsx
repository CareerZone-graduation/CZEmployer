import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/redux/notificationSlice';
import useFirebaseMessaging from '@/hooks/useFirebaseMessaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { formatDistanceToNow, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BellRing, CheckCheck, RefreshCw, AlertCircle, BellPlus, X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from 'react-router-dom';

const getNotificationLink = (notification) => {
  const { type, entity, metadata } = notification;

  switch (type) {
    case 'job_applicants_rollup':
      // Link to: /jobs/recruiter/:jobId?tab=candidates
      return metadata?.jobId ? `/jobs/recruiter/${metadata.jobId}?tab=candidates` : '/jobs';
    case 'interview':
      // Link to: /interviews/:interviewId
      return entity?.id ? `/interviews/${entity.id}` : '/interviews';
    case 'application':
      // Link to: /jobs/:jobId/applications/:applicationId
      // If jobId is missing, fallback to /applications/:applicationId
      if (metadata?.jobId && entity?.id) {
        return `/jobs/${metadata.jobId}/applications/${entity.id}`;
      } else if (entity?.id) {
        return `/applications/${entity.id}`;
      }
      return '/jobs'; // Fallback
    default:
      return null;
  }
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    if (link) {
      navigate(link);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-accent/50 transition-colors",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={handleClick}
    >
      <div className="shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          !notification.isRead ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <BellRing size={20} />
        </div>
      </div>
      <div className="grow">
        <p className="font-semibold text-sm">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {isValid(new Date(notification.createdAt))
            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })
            : 'Thời gian không hợp lệ'}
        </p>
      </div>
      {!notification.isRead && (
        <div className="shrink-0 self-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
        </div>
      )}
    </div>
  );
};

const ErrorState = ({ onRetry, message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
    <p className="text-lg font-semibold mb-2">Có lỗi xảy ra</p>
    <p className="text-sm text-muted-foreground mb-4">{message}</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      <RefreshCw className="mr-2 h-4 w-4" />
      Thử lại
    </Button>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <BellRing className="w-12 h-12 text-muted-foreground mb-4" />
    <p className="text-lg font-semibold mb-2">Chưa có thông báo</p>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, pagination, loading, error } = useSelector((state) => state.notifications);
  const { requestPermission } = useFirebaseMessaging();

  const [showNotificationBanner, setShowNotificationBanner] = useState(
    typeof Notification !== 'undefined' && Notification.permission !== 'granted'
  );

  // Load notifications lần đầu
  useEffect(() => {
    dispatch(fetchNotifications({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.page, pagination.limit]);

  const handleEnableNotifications = async () => {
    await requestPermission();
    setShowNotificationBanner(false);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => toast.success("Đã đánh dấu tất cả là đã đọc."))
      .catch(() => toast.error("Đã có lỗi xảy ra."));
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleRefetch = () => {
    dispatch(fetchNotifications({ page: pagination.page, limit: pagination.limit }));
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchNotifications({ page: newPage, limit: pagination.limit }));
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page > 1) handlePageChange(pagination.page - 1);
              }}
              className={cn(pagination.page === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          {[...Array(pagination.pages).keys()].map(p => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => { e.preventDefault(); handlePageChange(p + 1); }}
                isActive={pagination.page === p + 1}
              >
                {p + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page < pagination.pages) handlePageChange(pagination.page + 1);
              }}
              className={cn(pagination.page === pagination.pages && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <ErrorState onRetry={handleRefetch} message={error} />;
    }

    if (!notifications || notifications.length === 0) {
      return <EmptyState message="Bạn không có thông báo nào." />;
    }

    return (
      <div>
        {notifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Banner bật thông báo */}
      {showNotificationBanner && (
        <Alert className="mb-6 max-w-4xl mx-auto bg-blue-50 border-blue-200">
          <BellPlus className="h-5 w-5 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-blue-900">
              Bật thông báo đẩy để nhận cập nhật mới nhất về ứng viên và phỏng vấn ngay lập tức!
            </span>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                onClick={handleEnableNotifications}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Bật ngay
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNotificationBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Thông báo của bạn</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefetch}
              disabled={loading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Làm mới
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={loading || !notifications?.some(n => !n.isRead)}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
      {renderPagination()}
    </div>
  );
};

export default Notifications;