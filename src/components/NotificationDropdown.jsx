import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecentNotifications, getUnreadCount } from '@/services/notificationService';
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
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationDropdownItem = ({ notification }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <DropdownMenuItem onClick={handleClick} className="cursor-pointer">
      <div className="flex items-start gap-3 p-2 w-full">
        <div className="shrink-0 mt-1">
          <BellRing size={16} className="text-primary" />
        </div>
        <div className="grow min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
          </p>
        </div>
      </div>
    </DropdownMenuItem>
  );
};

const NotificationDropdown = () => {
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: getRecentNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const hasUnread = !isLoading && !isError && notifications && notifications.length > 0;

  const renderContent = () => {
    if (isLoading) {
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

    if (isError) {
      return (
        <p className="p-4 text-center text-sm text-destructive">
          Không thể tải thông báo.
        </p>
      );
    }

    if (!hasUnread) {
      return (
        <p className="p-4 text-center text-sm text-muted-foreground">
          Bạn không có thông báo mới.
        </p>
      );
    }

    return notifications.map((n) => (
      <NotificationDropdownItem key={n._id} notification={n} />
    ));
  };

  return (
    <DropdownMenu>
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
          >
            Xem tất cả thông báo
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
