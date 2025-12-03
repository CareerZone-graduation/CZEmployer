import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Check, CheckCheck, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { getConversationMessages, markConversationAsRead } from '@/services/chatService';
import socketService from '@/services/socketService';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * MessageThread Component
 * Displays messages in a conversation with real-time updates and infinite scroll
 * 
 * @param {Object} props
 * @param {string} props.conversationId - Conversation ID
 * @param {string} props.recipientId - Recipient user ID
 * @param {string} props.recipientName - Recipient name
 * @param {string} props.recipientAvatar - Recipient avatar URL
 * @param {boolean} props.isOnline - Whether the recipient is online
 */
const MessageThread = ({
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  isOnline
}) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [failedMessages, setFailedMessages] = useState(new Map());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const shouldScrollRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  const previousScrollHeightRef = useRef(0);

  const queryClient = useQueryClient();

  // Get current user from Redux
  const currentUser = useSelector((state) => state.auth.user?.user);

  // Fetch initial messages
  const {
    data: messagesData,
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => getConversationMessages(conversationId, page, 10),
    enabled: !!conversationId,
    staleTime: 30000,
  });

  // Reset state when conversation changes
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
    shouldScrollRef.current = true;
    isInitialLoadRef.current = true;
  }, [conversationId]);

  // Update messages when data changes
  useEffect(() => {
    if (messagesData?.data) {
      setMessages(prevMessages => {
        if (page === 1) {
          // First page, replace all messages (reverse to show oldest first)
          return [...messagesData.data].reverse();
        } else {
          // Append older messages to the beginning (reverse to show oldest first)
          const newMessages = [...messagesData.data].reverse().filter(
            newMsg => !prevMessages.some(msg => msg._id === newMsg._id)
          );
          return [...newMessages, ...prevMessages];
        }
      });

      // Check if there are more messages (limit is 10)
      setHasMore(messagesData.data.length === 10);
      setIsLoadingMore(false);
    }
  }, [messagesData, page]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldScrollRef.current && messagesEndRef.current) {
      const behavior = isInitialLoadRef.current ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior });
      isInitialLoadRef.current = false;
    }
  }, [messages]);

  // Join conversation room on mount - wait for socket connection
  useEffect(() => {
    if (!conversationId) return;

    let hasJoined = false;
    let joinTimeout = null;

    // Function to join conversation
    const joinConversation = () => {
      if (hasJoined) return;

      console.log('[MessageThread] Joining conversation:', conversationId);
      socketService.joinConversation(conversationId);
      hasJoined = true;

      // Mark messages as read
      markConversationAsRead(conversationId)
        .then(() => {
          queryClient.invalidateQueries(['conversations']);
        })
        .catch(err => {
          console.error('Failed to mark conversation as read:', err);
        });
    };

    // If already connected, join immediately
    if (socketService.getConnectionStatus()) {
      joinConversation();
    } else {
      // Otherwise, wait for connection
      console.log('[MessageThread] Socket not connected yet, waiting for connection...');

      const handleConnect = () => {
        console.log('[MessageThread] Socket connected, now joining conversation');
        // Add small delay to ensure connection is fully established
        joinTimeout = setTimeout(() => {
          joinConversation();
        }, 100);
      };

      socketService.onConnect(handleConnect);

      // Also try to join after a timeout as fallback
      joinTimeout = setTimeout(() => {
        if (!hasJoined && socketService.getConnectionStatus()) {
          console.log('[MessageThread] Timeout reached, attempting to join conversation');
          joinConversation();
        }
      }, 2000);

      // Cleanup: remove listener
      return () => {
        if (joinTimeout) clearTimeout(joinTimeout);
        socketService.off('onConnect', handleConnect);
        if (hasJoined && socketService.getConnectionStatus()) {
          socketService.leaveConversation(conversationId);
        }
      };
    }

    // Cleanup for immediate join case
    return () => {
      if (joinTimeout) clearTimeout(joinTimeout);
      if (hasJoined && socketService.getConnectionStatus()) {
        socketService.leaveConversation(conversationId);
      }
    };
  }, [conversationId, queryClient]);

  // Re-join conversation on reconnect
  useEffect(() => {
    const handleReconnectJoin = () => {
      if (conversationId && socketService.getConnectionStatus()) {
        console.log('[MessageThread] Socket reconnected, re-joining conversation:', conversationId);
        socketService.joinConversation(conversationId);
      }
    };

    socketService.onConnect(handleReconnectJoin);
    socketService.onReconnect(handleReconnectJoin);

    return () => {
      socketService.off('onConnect', handleReconnectJoin);
      socketService.off('onReconnect', handleReconnectJoin);
    };
  }, [conversationId]);

  // Handle new message from Socket.io
  const handleNewMessage = useCallback((message) => {
    if (message.conversationId !== conversationId) return;

    console.log('[MessageThread] New message received:', message);

    setMessages(prevMessages => {
      // Check if message already exists by _id OR tempMessageId
      const existingIndex = prevMessages.findIndex(msg =>
        msg._id === message._id ||
        (message.tempMessageId && msg._id === message.tempMessageId)
      );

      if (existingIndex !== -1) {
        // If it exists, replace it (to update status from sending -> sent)
        const newMessages = [...prevMessages];
        newMessages[existingIndex] = { ...message, status: 'sent' };
        return newMessages;
      }

      return [...prevMessages, message];
    });

    // Auto-scroll to bottom for new messages
    shouldScrollRef.current = true;

    // Mark as read if from other user
    if (message.senderId !== currentUser?._id) {
      markConversationAsRead(conversationId)
        .then(() => {
          queryClient.invalidateQueries(['conversations']);
        })
        .catch(err => {
          console.error('Failed to mark message as read:', err);
        });
    }
  }, [conversationId, currentUser, queryClient]);

  // Handle message read receipt
  const handleMessageRead = useCallback((data) => {
    if (data.conversationId !== conversationId) return;

    console.log('[MessageThread] Messages marked as read:', data);

    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (data.messageIds.includes(msg._id)) {
          return { ...msg, isRead: true, readAt: new Date().toISOString() };
        }
        return msg;
      });
    });
  }, [conversationId]);

  // Handle typing indicators
  const handleTypingStart = useCallback((data) => {
    if (data.conversationId !== conversationId) return;
    if (data.userId === currentUser?._id) return;

    console.log('[MessageThread] User started typing:', data.userId);
    setIsTyping(true);
  }, [conversationId, currentUser]);

  const handleTypingStop = useCallback((data) => {
    if (data.conversationId !== conversationId) return;
    if (data.userId === currentUser?._id) return;

    console.log('[MessageThread] User stopped typing:', data.userId);
    setIsTyping(false);
  }, [conversationId, currentUser]);

  // Handle reconnection - sync missed messages
  const handleReconnect = useCallback(async () => {
    console.log('[MessageThread] Socket reconnected, syncing missed messages...');

    // Get the timestamp of the last message
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const lastTimestamp = lastMessage.sentAt || lastMessage.createdAt;

    if (!lastTimestamp) return;

    setIsSyncing(true);

    try {
      const missedMessages = await socketService.syncMissedMessages(
        conversationId,
        lastTimestamp
      );

      if (missedMessages && missedMessages.length > 0) {
        console.log('[MessageThread] Synced', missedMessages.length, 'missed messages');

        setMessages(prevMessages => {
          // Filter out duplicates
          const newMessages = missedMessages.filter(
            newMsg => !prevMessages.some(msg => msg._id === newMsg._id)
          );

          return [...prevMessages, ...newMessages];
        });

        // Auto-scroll to show new messages
        shouldScrollRef.current = true;
      }
    } catch (error) {
      console.error('[MessageThread] Failed to sync missed messages:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [conversationId, messages]);

  // Subscribe to Socket.io events
  useEffect(() => {
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageRead(handleMessageRead);
    socketService.onTypingStart(handleTypingStart);
    socketService.onTypingStop(handleTypingStop);
    socketService.onReconnect(handleReconnect);

    return () => {
      socketService.off('onNewMessage', handleNewMessage);
      socketService.off('onMessageRead', handleMessageRead);
      socketService.off('onTypingStart', handleTypingStart);
      socketService.off('onTypingStop', handleTypingStop);
      socketService.off('onReconnect', handleReconnect);

      // Cleanup typing indicator timers
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [handleNewMessage, handleMessageRead, handleTypingStart, handleTypingStop, handleReconnect]);

  // Debounced typing indicator state
  const [isTypingIndicatorActive, setIsTypingIndicatorActive] = useState(false);
  const typingDebounceRef = useRef(null);

  // Handle input change with debounced typing indicator (300ms)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    // Clear previous debounce timeout
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    // If there's text, start typing indicator after 300ms debounce
    if (value.trim()) {
      typingDebounceRef.current = setTimeout(() => {
        if (!isTypingIndicatorActive) {
          socketService.startTyping(conversationId);
          setIsTypingIndicatorActive(true);
        }
        typingDebounceRef.current = null;
      }, 300);

      // Clear stop typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingIndicatorActive) {
          socketService.stopTyping(conversationId);
          setIsTypingIndicatorActive(false);
        }
        typingTimeoutRef.current = null;
      }, 3000);
    } else {
      // If input is empty, stop typing indicator immediately
      if (isTypingIndicatorActive) {
        socketService.stopTyping(conversationId);
        setIsTypingIndicatorActive(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // Send message
  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content || isSending) return;

    // Clear typing indicator and debounce timers
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingIndicatorActive) {
      socketService.stopTyping(conversationId);
      setIsTypingIndicatorActive(false);
    }

    // Generate temporary message ID
    const tempMessageId = `temp_${Date.now()}_${Math.random()}`;

    // Create optimistic message
    const optimisticMessage = {
      _id: tempMessageId,
      conversationId,
      senderId: currentUser?._id,
      recipientId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
      status: 'sending',
      isOptimistic: true
    };

    // Add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
    setIsSending(true);
    shouldScrollRef.current = true;

    try {
      // Send message via Socket.io
      const response = await socketService.sendMessage(
        conversationId,
        content,
        tempMessageId
      );

      console.log('[MessageThread] Message sent successfully:', response);

      // Update optimistic message with real data
      setMessages(prev => prev.map(msg => {
        if (msg._id === tempMessageId) {
          return {
            ...response.message,
            status: 'sent'
          };
        }
        return msg;
      }));

      // Remove from failed messages if it was there
      setFailedMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempMessageId);
        return newMap;
      });

    } catch (error) {
      console.error('[MessageThread] Failed to send message:', error);

      // Mark message as failed
      setMessages(prev => prev.map(msg => {
        if (msg._id === tempMessageId) {
          return { ...msg, status: 'failed' };
        }
        return msg;
      }));

      // Store failed message for retry
      setFailedMessages(prev => new Map(prev).set(tempMessageId, content));

    } finally {
      setIsSending(false);
    }
  };

  // Retry failed message
  const handleRetryMessage = async (messageId) => {
    const content = failedMessages.get(messageId);
    if (!content) return;

    console.log('[MessageThread] Retrying failed message:', messageId);

    // Update message status to sending
    setMessages(prev => prev.map(msg => {
      if (msg._id === messageId) {
        return { ...msg, status: 'sending' };
      }
      return msg;
    }));

    try {
      // Resend message via Socket.io
      const response = await socketService.sendMessage(
        conversationId,
        content,
        messageId
      );

      console.log('[MessageThread] Retry successful:', response);

      // Update message with real data
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          return {
            ...response.message,
            status: 'sent'
          };
        }
        return msg;
      }));

      // Remove from failed messages
      setFailedMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(messageId);
        return newMap;
      });

    } catch (error) {
      console.error('[MessageThread] Retry failed:', error);

      // Mark as failed again
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          return { ...msg, status: 'failed' };
        }
        return msg;
      }));
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e) => {
    const target = e.target;
    const scrollTop = target.scrollTop;

    // Check if scrolled to top (with some buffer)
    if (scrollTop < 50 && hasMore && !isLoadingMore && !isFetching) {
      console.log('[MessageThread] Loading more messages...');
      setIsLoadingMore(true);
      previousScrollHeightRef.current = target.scrollHeight;
      shouldScrollRef.current = false;

      // Load next page with 1s delay
      setTimeout(() => {
        setPage(prev => prev + 1);
      }, 1000);
    }
  }, [hasMore, isLoadingMore, isFetching]);

  // Restore scroll position after loading more messages
  useLayoutEffect(() => {
    if (page > 1 && scrollAreaRef.current) {
      const newScrollHeight = scrollAreaRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
      // Only adjust if new content was added (or just spinner removed)
      if (scrollDiff >= 0) {
        const currentScrollTop = scrollAreaRef.current.scrollTop;
        // If the user was at the top (loading more), keep them at the same relative message
        // Subtract approx height of loading spinner (40px) to prevent jump
        if (currentScrollTop < 50) {
          scrollAreaRef.current.scrollTop = currentScrollTop + scrollDiff - 40;
        }
      }
    }
  }, [messages, page]);

  // Handle Enter key to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Format message timestamp
   */
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);

      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: vi });
      } else if (isYesterday(date)) {
        return `Hôm qua ${format(date, 'HH:mm', { locale: vi })}`;
      } else {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  /**
   * Get message status icon
   */
  const getStatusIcon = (message) => {
    if (message.status === 'sending') {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }
    if (message.status === 'failed') {
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
    if (message.isRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  /**
   * Get initials for avatar
   */
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Loading state - only for initial load
  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col h-full">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "justify-end" : "justify-start")}>
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
              <Skeleton className={cn("h-16 rounded-lg", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-sm font-medium mb-1">Không thể tải tin nhắn</p>
        <p className="text-xs text-muted-foreground mb-4">
          {error?.message || 'Đã xảy ra lỗi'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries(['messages', conversationId])}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipientAvatar} alt={recipientName} />
            <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
          </Avatar>
          {/* Online status indicator */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{recipientName}</h3>
            {isOnline && (
              <span className="text-xs text-green-600 font-medium">● Online</span>
            )}
          </div>
          {isTyping && (
            <p className="text-xs text-muted-foreground">Đang nhập...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="flex-1 p-4 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Syncing missed messages indicator */}
        {isSyncing && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Đang đồng bộ tin nhắn...</span>
            </div>
          </div>
        )}

        {/* Messages list */}
        <div className="space-y-4">
          {messages.map((message) => {
            const isSentByMe = message.senderId === currentUser?._id;
            const isFailed = message.status === 'failed';

            return (
              <div
                key={message._id}
                className={cn(
                  "flex gap-2 items-end",
                  isSentByMe ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar for received messages */}
                {!isSentByMe && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={recipientAvatar} alt={recipientName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(recipientName)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message bubble */}
                <div className={cn(
                  "flex flex-col gap-1 max-w-[70%]",
                  isSentByMe && "items-end"
                )}>
                  <div className={cn(
                    "rounded-lg px-3 py-2 break-words",
                    isSentByMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                    isFailed && "bg-destructive/10 border border-destructive"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Timestamp and status */}
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.sentAt || message.createdAt)}
                    </span>

                    {isSentByMe && (
                      <span className="flex items-center">
                        {getStatusIcon(message)}
                      </span>
                    )}

                    {/* Retry button for failed messages */}
                    {isFailed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-xs"
                        onClick={() => handleRetryMessage(message._id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Thử lại
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <Input
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
