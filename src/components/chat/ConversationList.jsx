import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { getConversations } from '@/services/chatService';
import socketService from '@/services/socketService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * ConversationList Component
 * Displays all conversations sorted by lastMessageAt with real-time updates
 * 
 * @param {Object} props
 * @param {string} props.selectedConversationId - Currently selected conversation ID
 * @param {Function} props.onConversationSelect - Callback when conversation is clicked
 */
const ConversationList = ({ selectedConversationId, onConversationSelect }) => {
  const [conversations, setConversations] = useState([]);
  
  // Get current user from Redux
  const currentUser = useSelector((state) => state.auth.user?.user);

  // Fetch conversations using React Query
  const { 
    data: conversationsData, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (conversationsData) {
      // Sort by lastMessageAt (most recent first)
      const sorted = [...conversationsData].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt);
        const dateB = new Date(b.lastMessageAt || b.createdAt);
        return dateB - dateA;
      });
      setConversations(sorted);
    }
  }, [conversationsData]);

  // Handle new message event from Socket.io
  const handleNewMessage = useCallback((message) => {
    console.log('[ConversationList] New message received:', message);
    
    setConversations(prevConversations => {
      // Find the conversation that received the message
      const conversationIndex = prevConversations.findIndex(
        conv => conv._id === message.conversationId
      );

      if (conversationIndex === -1) {
        // New conversation, refetch to get full data
        refetch();
        return prevConversations;
      }

      // Update the conversation with new message
      const updatedConversations = [...prevConversations];
      const conversation = { ...updatedConversations[conversationIndex] };
      
      // Update last message info
      conversation.lastMessage = {
        _id: message._id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.sentAt || message.createdAt
      };
      conversation.lastMessageAt = message.sentAt || message.createdAt;
      
      // Increment unread count if message is from other user
      if (message.senderId !== currentUser?._id) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }

      // Remove from current position
      updatedConversations.splice(conversationIndex, 1);
      
      // Add to top
      updatedConversations.unshift(conversation);

      return updatedConversations;
    });
  }, [refetch, currentUser]);

  // Handle message read event
  const handleMessageRead = useCallback((data) => {
    console.log('[ConversationList] Messages marked as read:', data);
    
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv._id === data.conversationId) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      });
    });
  }, []);

  // Subscribe to Socket.io events
  useEffect(() => {
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageRead(handleMessageRead);

    // Cleanup
    return () => {
      socketService.off('onNewMessage', handleNewMessage);
      socketService.off('onMessageRead', handleMessageRead);
    };
  }, [handleNewMessage, handleMessageRead]);

  /**
   * Get initials from name for avatar fallback
   */
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Format timestamp to relative time
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  /**
   * Truncate message preview
   */
  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'Chưa có tin nhắn';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  /**
   * Get other participant info from conversation
   */
  const getOtherParticipant = (conversation) => {
    // Assuming conversation has participant1 and participant2
    // and one of them is the current user
    return conversation.otherParticipant;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-2">
          Không thể tải danh sách cuộc trò chuyện
        </p>
        <p className="text-xs text-muted-foreground">
          {error?.message || 'Đã xảy ra lỗi'}
        </p>
      </div>
    );
  }

  // Empty state
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm font-medium mb-1">Chưa có cuộc trò chuyện</p>
        <p className="text-xs text-muted-foreground">
          Bắt đầu nhắn tin với ứng viên từ trang hồ sơ
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          const isSelected = conversation._id === selectedConversationId;
          const hasUnread = conversation.unreadCount > 0;

          return (
            <button
              key={conversation._id}
              onClick={() => onConversationSelect(conversation)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg transition-colors",
                "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                isSelected && "bg-accent",
                hasUnread && "bg-muted/50"
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={otherParticipant?.avatar} 
                    alt={otherParticipant?.name || 'User'} 
                  />



                  <AvatarFallback>
                    {getInitials(otherParticipant?.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator - can be added later */}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                {/* Name and timestamp */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={cn(
                    "text-sm font-medium truncate",
                    hasUnread && "font-semibold"
                  )}>
                    {otherParticipant?.name || 'Người dùng'}
                  </h4>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimestamp(conversation.lastMessageAt || conversation.createdAt)}
                  </span>
                </div>

                {/* Last message preview */}
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    "text-sm text-muted-foreground truncate",
                    hasUnread && "font-medium text-foreground"
                  )}>
                    {truncateMessage(conversation.lastMessage?.content)}
                  </p>
                  
                  {/* Unread badge */}
                  {hasUnread && (
                    <Badge 
                      variant="default" 
                      className="h-5 min-w-[20px] px-1.5 text-xs flex-shrink-0"
                    >
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
