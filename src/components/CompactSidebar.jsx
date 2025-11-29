
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Users,
  CalendarCheck,
  Star,
  Bell,
  ChevronRight,
  Pin,
  PinOff,
  MessageCircle,
  LogOut,
  LifeBuoy,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getConversations } from '@/services/chatService';
import socketService from '@/services/socketService';
import { logoutSuccess } from '@/redux/authSlice';
import { clearNotifications } from '@/redux/notificationSlice';
import { logoutServer } from '@/services/authService';
import { useDispatch } from 'react-redux';

const sidebarItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, description: 'Tổng quan hệ thống' },
  { href: '/company-profile', label: 'Công ty', icon: Building2, description: 'Hồ sơ và thông tin công ty' },
  { href: '/jobs', label: 'Việc làm', icon: Briefcase, description: 'Quản lý tin tuyển dụng' },
  { href: '/candidates', label: 'Ứng viên', icon: Users, description: 'Quản lý ứng viên' },
  { href: '/interviews', label: 'Phỏng vấn', icon: CalendarCheck, description: 'Lịch phỏng vấn' },
  { href: '/messaging', label: 'Tin nhắn', icon: MessageCircle, description: 'Trò chuyện với ứng viên' },
  { href: '/notifications', label: 'Thông báo', icon: Bell, description: 'Thông báo hệ thống' },
  { href: '/billing', label: 'Thanh toán', icon: CreditCard, description: 'Thanh toán và hóa đơn' },
];

const bottomItems = [
  { href: '/settings', label: 'Cài đặt', icon: Settings, description: 'Cài đặt tài khoản' },
  { href: '/support', label: 'Hỗ trợ', icon: LifeBuoy, description: 'Yêu cầu hỗ trợ' },
];

const CompactSidebar = ({ isPinned, onTogglePin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount: notificationUnreadCount } = useSelector((state) => state.notifications);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Fetch conversations to get unread count
  // Fetch conversations to get unread count
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations({ limit: 100 }), // Fetch more to get accurate count, or implement a specific unread count API
    enabled: !!user,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const conversations = conversationsData?.data || [];
  const unreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // Listen for socket events to update cache
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message) => {
      queryClient.setQueryData(['conversations'], (oldData) => {
        if (!oldData || !oldData.data) return oldData;

        const conversationIndex = oldData.data.findIndex(c => c._id === message.conversationId);

        // If conversation not found, invalidate to refetch
        if (conversationIndex === -1) {
          queryClient.invalidateQueries(['conversations']);
          return oldData;
        }

        const updatedConversations = [...oldData.data];
        const conversation = { ...updatedConversations[conversationIndex] };

        // Update latest message
        conversation.latestMessage = message;
        conversation.lastMessageAt = message.sentAt || message.createdAt;

        // Increment unread count if message is from other user
        if (message.senderId !== user.user._id) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        updatedConversations[conversationIndex] = conversation;

        // Sort by lastMessageAt
        updatedConversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

        return {
          ...oldData,
          data: updatedConversations
        };
      });

      // Invalidate detailed conversation lists (used in Messaging page) to ensure they are fresh when visited
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'conversations' &&
          query.queryKey.length > 1 // Target ['conversations', search]
      });
    };

    const handleMessageRead = (data) => {
      queryClient.setQueryData(['conversations'], (oldData) => {
        if (!oldData || !oldData.data) return oldData;

        const updatedConversations = oldData.data.map(conv => {
          if (conv._id === data.conversationId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        });

        return {
          ...oldData,
          data: updatedConversations
        };
      });

      // Invalidate detailed conversation lists
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'conversations' &&
          query.queryKey.length > 1
      });
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageRead(handleMessageRead);

    return () => {
      socketService.off('onNewMessage', handleNewMessage);
      socketService.off('onMessageRead', handleMessageRead);
    };
  }, [user, queryClient]);

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutServer();
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      socketService.disconnect();
      dispatch(clearNotifications());
      dispatch(logoutSuccess());
    }
  };

  const shouldShowExpanded = isExpanded || isPinned;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 hidden md:flex flex-col",
          shouldShowExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(
          "flex items-center h-16 px-4",
          shouldShowExpanded ? "justify-start" : "justify-center"
        )}>
          <Link to="/" className="flex items-center gap-2">
            {shouldShowExpanded && (
              <span className="font-bold text-emerald-700 text-lg">CareerZone</span>
            )}
          </Link>
        </div>

        {/* Pin Button */}
        {shouldShowExpanded && (
          <div className="absolute top-4 right-2 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onTogglePin}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-colors",
                    isPinned
                      ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isPinned ? "Bỏ ghim" : "Ghim"}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-2 mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));

            const isMessageItem = item.href === '/messaging';

            if (shouldShowExpanded) {
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-600"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-emerald-100" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isMessageItem && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                  {item.href === '/notifications' && notificationUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                      {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                    </Badge>
                  )}
                  {!isMessageItem && isActive && (
                    <ChevronRight className="h-4 w-4 text-white ml-auto" />
                  )}
                </Link>
              );
            }

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg transition-colors relative",
                      isActive
                        ? "bg-emerald-700 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {isMessageItem && unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                    {item.href === '/notifications' && notificationUnreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                      >
                        {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                      </Badge>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Items: Settings, Support, Logout */}
        <div className="p-2 mt-auto border-t border-gray-200 space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));

            if (shouldShowExpanded) {
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-600"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-emerald-100" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-white ml-auto" />
                  )}
                </Link>
              );
            }

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg transition-colors relative",
                      isActive
                        ? "bg-emerald-700 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Logout Button */}
          {shouldShowExpanded ? (
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="truncate">Đăng xuất</div>

              </div>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <div>
                  <div className="font-medium">Đăng xuất</div>
                  <div className="text-xs text-gray-500 mt-1">Thoát khỏi hệ thống</div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CompactSidebar;