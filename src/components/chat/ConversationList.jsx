import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Loader2 } from 'lucide-react';
import { getConversations } from '@/services/chatService';
import socketService from '@/services/socketService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useInView } from 'react-intersection-observer';

/**
 * ConversationList Component
 * Displays all conversations sorted by lastMessageAt with real-time updates, search, and infinite scroll
 *
 * @param {Object} props
 * @param {string} props.selectedConversationId - Currently selected conversation ID
 * @param {Function} props.onConversationSelect - Callback when conversation is clicked
 */
const ConversationList = ({ selectedConversation, selectedConversationId, onConversationSelect, onlineUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { ref, inView } = useInView();

  // Get current user from Redux
  const currentUser = useSelector((state) => state.auth.user);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch conversations using React Query Infinite
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['conversations', debouncedSearch],
    queryFn: ({ pageParam = 1 }) => getConversations({
      search: debouncedSearch,
      page: pageParam,
      limit: 10
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta && lastPage.meta.currentPage < lastPage.meta.totalPages) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 30000, // 30 seconds
  });

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten data pages into a single array
  const fetchedConversations = data?.pages.flatMap(page => page.data) || [];

  // Ensure selectedConversation is in the list if provided
  const conversations = [...fetchedConversations];
  if (selectedConversation && !conversations.find(c => c._id === selectedConversation._id)) {
    conversations.unshift(selectedConversation);
  }

  const queryClient = useQueryClient();

  // Handle new message event from Socket.io
  const handleNewMessage = useCallback((message) => {
    console.log('[ConversationList] New message received:', message);

    // Optimistic update:
    queryClient.setQueryData(['conversations', debouncedSearch], (oldData) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map(page => ({ ...page, data: [...page.data] }));
      let foundConversation = null;

      // Find and remove conversation from its current position
      for (const page of newPages) {
        const index = page.data.findIndex(c => c._id === message.conversationId);
        if (index !== -1) {
          foundConversation = { ...page.data[index] };
          page.data.splice(index, 1);
          break;
        }
      }

      // If not found in loaded pages, invalidate to refetch
      if (!foundConversation) {
        queryClient.invalidateQueries(['conversations']);
        return oldData;
      }

      // Update conversation details
      foundConversation.latestMessage = {
        _id: message._id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.sentAt || message.createdAt
      };
      foundConversation.lastMessageAt = message.sentAt || message.createdAt;

      if (message.senderId !== currentUser?._id) {
        foundConversation.unreadCount = (foundConversation.unreadCount || 0) + 1;
      }

      // Add to the top of the first page
      if (newPages.length > 0) {
        newPages[0].data.unshift(foundConversation);
      }

      return { ...oldData, pages: newPages };
    });

  }, [queryClient, debouncedSearch, currentUser]);

  // Handle message read event
  const handleMessageRead = useCallback((data) => {
    console.log('[ConversationList] Messages marked as read:', data);

    queryClient.setQueryData(['conversations', debouncedSearch], (oldData) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map(page => ({
        ...page,
        data: page.data.map(conv => {
          if (conv._id === data.conversationId) {
            return {
              ...conv,
              unreadCount: 0
            };
          }
          return conv;
        })
      }));

      return { ...oldData, pages: newPages };
    });
  }, [queryClient, debouncedSearch]);

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

  // Optimistically mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId && conversations.length > 0) {
      // Update list with search param
      queryClient.setQueryData(['conversations', debouncedSearch], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(conv => {
              if (conv._id === selectedConversationId && conv.unreadCount > 0) {
                return { ...conv, unreadCount: 0 };
              }
              return conv;
            })
          }))
        };
      });

      // Update sidebar list (no search param)
      queryClient.setQueryData(['conversations'], (oldData) => {
        if (!oldData || !oldData.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map(conv => {
            if (conv._id === selectedConversationId && conv.unreadCount > 0) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          })
        };
      });
    }
  }, [selectedConversationId, queryClient, debouncedSearch, conversations.length]);


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
   * Get other participant info from conversation
   */
  const getOtherParticipant = (conversation) => {
    // Use pre-calculated otherParticipant if available (from getConversations)
    if (conversation.otherParticipant) {
      return conversation.otherParticipant;
    }

    // Fallback for detailed conversation view where participants are populated
    if (conversation.participant1?._id === currentUser?._id) {
      return conversation.participant2;
    }
    return conversation.participant1;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm ứng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {isLoading && (
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
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Không thể tải danh sách
              </p>
              <p className="text-xs text-muted-foreground">
                {error?.message || 'Đã xảy ra lỗi'}
              </p>
            </div>
          )}

          {!isLoading && !isError && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Không tìm thấy cuộc trò chuyện</p>
            </div>
          )}

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
                  {/* Online indicator */}
                  {otherParticipant?._id && onlineUsers.has(otherParticipant._id) && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  {/* Name and timestamp */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      hasUnread && "font-semibold"
                    )}>
                      {otherParticipant?.name || 'Ứng viên'}
                    </h4>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimestamp(conversation.lastMessageAt || conversation.createdAt)}
                    </span>
                  </div>

                  {/* Last message preview */}
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-sm text-muted-foreground line-clamp-1 break-all",
                      hasUnread && "font-medium text-foreground"
                    )}>
                      {conversation.latestMessage?.content || conversation.lastMessage?.content || 'Chưa có tin nhắn'}
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

          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={ref} className="flex justify-center p-4">
              {isFetchingNextPage ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-xs text-muted-foreground">Tải thêm...</span>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
