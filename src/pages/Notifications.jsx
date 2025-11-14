import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllAsRead, markNotificationAsRead } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BellRing, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-accent/50 transition-colors",
        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={handleClick}
    >
      <div className="shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          !notification.read ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <BellRing size={20} />
        </div>
      </div>
      <div className="grow">
        <p className="font-semibold text-sm">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
        </p>
      </div>
      {!notification.read && (
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
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => getNotifications({ page, limit }),
    keepPreviousData: true,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
    onError: () => {
      toast.error("Đã có lỗi xảy ra.");
    }
  });

  const markSingleMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
    onError: () => {
      toast.error("Không thể đánh dấu đã đọc.");
    }
  });

  const handleMarkAllRead = () => {
    markAllMutation.mutate();
  };

  const handleMarkAsRead = (notificationId) => {
    markSingleMutation.mutate(notificationId);
  };

  const renderPagination = () => {
    if (!data?.meta || data.meta.pages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
              disabled={page === 1}
            />
          </PaginationItem>
          {[...Array(data.meta.pages).keys()].map(p => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p + 1); }}
                isActive={page === p + 1}
              >
                {p + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(p => Math.min(data.meta.pages, p + 1)); }}
              disabled={page === data.meta.pages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderContent = () => {
    if (isLoading) {
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

    if (isError) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra';
      return <ErrorState onRetry={refetch} message={errorMessage} />;
    }

    if (!data || !data.data || data.data.length === 0) {
      return <EmptyState message="Bạn không có thông báo nào." />;
    }

    return (
      <div>
        {data.data.map(notification => (
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Thông báo của bạn</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Làm mới
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllMutation.isLoading || !data?.data?.some(n => !n.read)}
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
