import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentNotifications, fetchUnreadCount, markNotificationAsRead } from '@/redux/notificationSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellRing } from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

const getNotificationLink = (notification) => {
  const { type, entity, metadata } = notification;

  switch (type) {
    case 'job_applicants_rollup':
      // Link to: /jobs/:jobId/applications
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
      return '/notifications';
  }
};

const NotificationDropdownItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }
    onClose();
    navigate(link);
  };

  const timeAgo = notification.createdAt && isValid(new Date(notification.createdAt))
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })
    : 'Vừa xong';

  return (
    <DropdownMenuItem onClick={handleClick} className="cursor-pointer">
      <div className="flex items-start gap-3 p-2 w-full">
        <div className="shrink-0 mt-1">
          <BellRing size={16} className="text-primary" />
        </div>
        <div className="grow min-w-0">
          <p className={`text-sm leading-tight truncate ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {timeAgo}
          </p>
        </div>
        {!notification.isRead && (
          <div className="shrink-0 self-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </DropdownMenuItem>
  );
};

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const { recentNotifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  // Load notifications lần đầu khi component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRecentNotifications());
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  const hasUnread = !loading && recentNotifications && recentNotifications.length > 0;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-2.5 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="grow space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!hasUnread) {
      return (
        <p className="p-4 text-center text-sm text-muted-foreground">
          Bạn không có thông báo mới.
        </p>
      );
    }

    return recentNotifications.map((n) => (
      <NotificationDropdownItem
        key={n._id}
        notification={n}
        onClose={() => setOpen(false)}
      />
    ));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Thông báo</span>
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center" variant="destructive">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border shadow-lg" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Thông báo mới</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({unreadCount} chưa đọc)
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">{renderContent()}</div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/notifications"
            className="flex items-center justify-center py-2 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Xem tất cả thông báo
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
