import { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Loader2, Check, CheckCheck, AlertCircle } from "lucide-react"
import { format, isToday, isYesterday } from 'date-fns'
import * as chatService from "@/services/chatService"
import socketService from "@/services/socketService"
import { cn } from "@/lib/utils"

const Messaging = () => {
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  const currentUser = useSelector((state) => state.auth.user?.user)
  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const shouldScrollRef = useRef(true)

  // Connect to socket on mount
  useEffect(() => {
    const connectSocket = async () => {
      try {
        setConnectionError(null);
        await socketService.connect();
      } catch (error) {
        console.error("Failed to connect socket:", error);
        setConnectionError("Failed to connect to chat server. Please try refreshing.");
      }
    };

    if (currentUser) {
      connectSocket();
    }

    // Subscribe to connection events
    const onConnect = () => {
      setIsSocketConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const onConnectionError = (err) => {
      console.error("Socket connection error:", err);
      setIsSocketConnected(false);
    };

    socketService.onConnect(onConnect);
    socketService.onDisconnect(onDisconnect);
    socketService.onConnectionError(onConnectionError);

    // Check initial status
    if (socketService.getConnectionStatus()) {
      setIsSocketConnected(true);
    }

    return () => {
      socketService.off('onConnect', onConnect);
      socketService.off('onDisconnect', onDisconnect);
      socketService.off('onConnectionError', onConnectionError);
      socketService.disconnect();
    };
  }, [currentUser]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const data = await chatService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        setMessages([]);
        setPage(1);
        setHasMore(true);

        const { data, meta } = await chatService.getConversationMessages(selectedChat._id, 1);
        // Backend returns newest first (sentAt: -1), reverse to show oldest first
        setMessages(data.reverse());
        setHasMore(data.length < meta.totalItems);

        // Join conversation room
        socketService.joinConversation(selectedChat._id);

        // Mark as read
        if (selectedChat.unreadCount > 0) {
          await chatService.markConversationAsRead(selectedChat._id);
          // Update local unread count
          setConversations(prev => prev.map(c => {
            if (c._id === selectedChat._id) {
              return { ...c, unreadCount: 0 };
            }
            return c;
          }));
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoadingMessages(false);
        shouldScrollRef.current = true;
      }
    };

    fetchMessages();

    return () => {
      if (selectedChat) {
        socketService.leaveConversation(selectedChat._id);
      }
    };
  }, [selectedChat]);

  // Re-join conversation on reconnect
  useEffect(() => {
    if (isSocketConnected && selectedChat) {
      console.log('[Messaging] Socket reconnected, re-joining conversation:', selectedChat._id);
      socketService.joinConversation(selectedChat._id);
    }
  }, [isSocketConnected, selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    if (shouldScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle scroll for infinite loading
  const handleScroll = async (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isLoadingMessages) {
      setIsLoadingMessages(true);
      shouldScrollRef.current = false; // Prevent auto-scroll to bottom
      const prevHeight = scrollAreaRef.current.scrollHeight;

      try {
        const nextPage = page + 1;
        const { data, meta } = await chatService.getConversationMessages(selectedChat._id, nextPage);

        if (data.length > 0) {
          // Backend returns newest first, reverse to get oldest first, then prepend
          setMessages(prev => [...data.reverse(), ...prev]);
          setPage(nextPage);
          setHasMore(messages.length + data.length < meta.totalItems);

          // Restore scroll position
          requestAnimationFrame(() => {
            if (scrollAreaRef.current) {
              scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight - prevHeight;
            }
          });
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to load more messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    }
  };

  // Socket event handlers
  const handleNewMessage = useCallback((message) => {
    // Update conversations list with latest message
    setConversations(prev => {
      const conversationIndex = prev.findIndex(c => c._id === message.conversationId);
      if (conversationIndex === -1) return prev; // Or fetch new conversation if not found

      const updatedConversations = [...prev];
      const conversation = { ...updatedConversations[conversationIndex] };

      conversation.latestMessage = message;
      conversation.lastMessageAt = message.sentAt || message.createdAt;

      // Increment unread count if not current chat
      if (selectedChat?._id !== message.conversationId && message.senderId !== currentUser?._id) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }

      updatedConversations[conversationIndex] = conversation;
      // Move to top
      updatedConversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      return updatedConversations;
    });

    // If message belongs to current chat, append it
    if (selectedChat?._id === message.conversationId) {
      setMessages(prev => {
        // Check if message already exists by _id OR tempMessageId
        const existingIndex = prev.findIndex(m =>
          m._id === message._id ||
          (message.tempMessageId && m._id === message.tempMessageId)
        );

        if (existingIndex !== -1) {
          // If it exists, replace it (to update status from sending -> sent)
          const newMessages = [...prev];
          newMessages[existingIndex] = { ...message, status: 'sent' };
          return newMessages;
        }

        return [...prev, message];
      });
      shouldScrollRef.current = true;

      // Mark as read if we are in the chat
      if (message.senderId !== currentUser?._id) {
        chatService.markConversationAsRead(message.conversationId);
      }
    }
  }, [selectedChat, currentUser]);

  const handleMessageRead = useCallback((data) => {
    if (selectedChat?._id === data.conversationId) {
      setMessages(prev => prev.map(msg => {
        if (data.messageIds.includes(msg._id)) {
          return { ...msg, isRead: true };
        }
        return msg;
      }));
    }
  }, [selectedChat]);

  const handleTypingStart = useCallback((data) => {
    if (selectedChat?._id === data.conversationId && data.userId !== currentUser?._id) {
      setIsTyping(true);
    }
  }, [selectedChat, currentUser]);

  const handleTypingStop = useCallback((data) => {
    if (selectedChat?._id === data.conversationId && data.userId !== currentUser?._id) {
      setIsTyping(false);
    }
  }, [selectedChat, currentUser]);

  const handleUserPresence = useCallback((data) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (data.isOnline) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });
  }, []);

  // Subscribe to socket events
  useEffect(() => {
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageRead(handleMessageRead);
    socketService.onTypingStart(handleTypingStart);
    socketService.onTypingStop(handleTypingStop);
    socketService.onUserPresence(handleUserPresence);

    return () => {
      socketService.off('onNewMessage', handleNewMessage);
      socketService.off('onMessageRead', handleMessageRead);
      socketService.off('onTypingStart', handleTypingStart);
      socketService.off('onTypingStop', handleTypingStop);
      socketService.off('onUserPresence', handleUserPresence);
    };
  }, [handleNewMessage, handleMessageRead, handleTypingStart, handleTypingStop, handleUserPresence]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || isSending) return;

    if (!isSocketConnected) {
      // Try to reconnect if not connected
      try {
        await socketService.connect();
      } catch (error) {
        console.error("Cannot send message: Socket not connected", error);
        return;
      }
    }

    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversationId: selectedChat._id,
      senderId: currentUser?._id,
      content,
      sentAt: new Date().toISOString(),
      status: 'sending',
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    shouldScrollRef.current = true;

    try {
      const response = await socketService.sendMessage(selectedChat._id, content, tempId);

      // Update message with real data
      setMessages(prev => prev.map(msg => {
        if (msg._id === tempId) {
          return { ...response.message, status: 'sent' };
        }
        return msg;
      }));

      // Update conversation list
      setConversations(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => c._id === selectedChat._id);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            latestMessage: response.message,
            lastMessageAt: response.message.sentAt
          };
          updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        }
        return updated;
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.map(msg => {
        if (msg._id === tempId) {
          return { ...msg, status: 'failed' };
        }
        return msg;
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (selectedChat && isSocketConnected) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.startTyping(selectedChat._id);

      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(selectedChat._id);
      }, 3000);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd/MM/yyyy');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleReconnect = async () => {
    try {
      setConnectionError(null);
      await socketService.connect();
    } catch (error) {
      console.error("Manual reconnection failed:", error);
      setConnectionError("Reconnection failed. Please check your internet connection.");
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-black mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
          {connectionError && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded flex items-center justify-between">
              <span>{connectionError}</span>
              <Button variant="ghost" size="sm" onClick={handleReconnect} className="h-6 px-2 text-red-700 hover:bg-red-100">
                Retry
              </Button>
            </div>
          )}
          {!isSocketConnected && !connectionError && (
            <div className="mt-2 p-2 bg-yellow-50 text-yellow-600 text-xs rounded flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Connecting to chat server...</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.otherParticipant;
              const isSelected = selectedChat?._id === conversation._id;
              const isOnline = onlineUsers.has(otherUser?._id);

              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedChat(conversation)}
                  className={cn(
                    "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                    isSelected && "bg-orange-50 border-orange-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser?.avatar} />
                        <AvatarFallback className="bg-green-700 text-white">
                          {getInitials(otherUser?.name)}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-black truncate">{otherUser?.name || 'Unknown'}</h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{otherUser?.role || 'Candidate'}</p>
                      <p className={cn(
                        "text-sm truncate",
                        conversation.unreadCount > 0 ? "font-semibold text-black" : "text-gray-500"
                      )}>
                        {conversation.latestMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-green-700 text-white text-xs ml-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.otherParticipant?.avatar} />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {getInitials(selectedChat.otherParticipant?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-black">{selectedChat.otherParticipant?.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{selectedChat.otherParticipant?.role}</p>
                    {isTyping && <span className="text-xs text-gray-500 italic">typing...</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollAreaRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {isLoadingMessages && page === 1 ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {isLoadingMessages && page > 1 && (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?._id;
                    const isFailed = msg.status === 'failed';

                    return (
                      <div key={msg._id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm",
                            isMe ? "bg-green-700 text-white" : "bg-white text-black border border-gray-200",
                            isFailed && "opacity-70"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className={cn(
                            "flex items-center justify-end gap-1 mt-1",
                            isMe ? "text-green-100" : "text-gray-400"
                          )}>
                            <span className="text-xs">
                              {format(new Date(msg.sentAt || msg.createdAt), 'HH:mm')}
                            </span>
                            {isMe && (
                              <span>
                                {msg.status === 'sending' && <Loader2 className="h-3 w-3 animate-spin" />}
                                {msg.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                                {(msg.status === 'sent' || msg.status === 'delivered') && <Check className="h-3 w-3" />}
                                {msg.isRead && <CheckCheck className="h-3 w-3" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={isSocketConnected ? "Type a message..." : "Connecting..."}
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isSending || !isSocketConnected}
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim() || isSending || !isSocketConnected}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-black mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}

export default Messaging
