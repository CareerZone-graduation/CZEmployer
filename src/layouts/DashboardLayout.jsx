import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';

import CompactSidebar from '@/components/CompactSidebar';
import AIChatbot from '@/components/common/AIChatbot';
import socketService from '@/services/socketService';
import { fetchRecentNotifications, incrementUnreadCount } from '@/redux/notificationSlice';
import { toast } from 'sonner';

const DashboardLayout = () => {
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const toggleSidebarPin = () => {
    setIsSidebarPinned(prev => !prev);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Kết nối socket
      socketService.connect();

      // Lắng nghe sự kiện có thông báo mới
      const handleNewNotification = (notification) => {
        console.log('New notification received via socket:', notification);

        // Hiển thị toast
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
        });

        // Cập nhật lại số lượng và danh sách thông báo
        dispatch(incrementUnreadCount());
        dispatch(fetchRecentNotifications());
      };

      socketService.onNewNotification(handleNewNotification);

      // Dọn dẹp khi component unmount
      return () => {
        socketService.off('onNewNotification', handleNewNotification);
        // Không disconnect ở đây để giữ kết nối khi chuyển trang
      };
    }
  }, [isAuthenticated, dispatch]);

  const location = useLocation();
  const isMessagingPage = location.pathname === '/messaging';

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <CompactSidebar isPinned={isSidebarPinned} onTogglePin={toggleSidebarPin} />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarPinned ? "md:ml-64" : "md:ml-16"
      )}>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* AI Chatbot */}
      {!isMessagingPage && <AIChatbot />}

      {/* Conditional overlay for company registration */}
      {/* Conditional overlay for company registration is disabled as requested */}

      {/* The main loading spinner is now handled by the AppRouter */}
    </div>
  );
};

export default DashboardLayout;
