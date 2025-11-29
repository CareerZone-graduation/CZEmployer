import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ConversationList from '@/components/chat/ConversationList';
import MessageThread from '@/components/chat/MessageThread';
import ChatContextHeader from '@/components/chat/ChatContextHeader';
import socketService from '@/services/socketService';
import { cn } from '@/lib/utils';
import { getAccessToken } from '@/utils/token';
import * as chatService from '@/services/chatService';

const Messaging = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [nextRetryDelay, setNextRetryDelay] = useState(0);
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Get current user and token
  const currentUser = useSelector((state) => state.auth.user?.user);
  const token = getAccessToken();

  const isConnectionInitiatedRef = useRef(false);
  const selectedConversationRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Establish Socket connection
  useEffect(() => {
    if (!token) return;

    const isSocketConnected = socketService.getConnectionStatus();
    if (isSocketConnected) {
      setConnectionStatus('connected');
      return;
    }

    if (isConnectionInitiatedRef.current) return;

    socketService.disconnect();
    isConnectionInitiatedRef.current = true;
    setConnectionStatus('connecting');

    const connectSocket = async () => {
      try {
        await socketService.connect(token);
        if (socketService.getConnectionStatus()) {
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('[Messaging] Socket.connect() failed:', error.message);
        setConnectionStatus('disconnected');
        isConnectionInitiatedRef.current = false;
      }
    };

    connectSocket();

    return () => {
      isConnectionInitiatedRef.current = false;
    };
  }, [token]);

  // Handle connection events
  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus('connected');
      setReconnectAttempt(0);
    };

    const handleDisconnect = (reason) => {
      console.log('[Messaging] Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    };

    const handleConnectionError = (data) => {
      setConnectionStatus('disconnected');
      if (data?.attempt) setReconnectAttempt(data.attempt);
      if (data?.nextDelay) setNextRetryDelay(data.nextDelay);
    };

    const handleReconnecting = (attemptNumber) => {
      setConnectionStatus('reconnecting');
      setReconnectAttempt(attemptNumber);
    };

    const handleReconnect = () => {
      setConnectionStatus('connected');
      setReconnectAttempt(0);

      if (selectedConversationRef.current?._id) {
        window.dispatchEvent(new CustomEvent('socket:reconnected', {
          detail: { conversationId: selectedConversationRef.current._id }
        }));
      }
    };

    const handleUserPresence = (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) newSet.add(data.userId);
        else newSet.delete(data.userId);
        return newSet;
      });
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users));
    };

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    socketService.onConnectionError(handleConnectionError);
    socketService.onReconnecting(handleReconnecting);
    socketService.onReconnect(handleReconnect);
    socketService.onUserPresence(handleUserPresence);
    socketService.onOnlineUsers(handleOnlineUsers);

    if (socketService.getConnectionStatus()) {
      socketService.getOnlineUsers();
    }

    return () => {
      socketService.off('onConnect', handleConnect);
      socketService.off('onDisconnect', handleDisconnect);
      socketService.off('onConnectionError', handleConnectionError);
      socketService.off('onReconnecting', handleReconnecting);
      socketService.off('onReconnect', handleReconnect);
      socketService.off('onUserPresence', handleUserPresence);
      socketService.off('onOnlineUsers', handleOnlineUsers);
    };
  }, []);

  // Handle userId query param
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  useEffect(() => {
    const initConversation = async () => {
      if (userIdParam) {
        try {
          const conversation = await chatService.createOrGetConversation(userIdParam);
          setSelectedConversation(conversation);
          setShowMobileThread(true);
        } catch (error) {
          console.error('Error initializing conversation:', error);
          // Optional: Show error toast
        }
      }
    };

    if (userIdParam && token) {
      initConversation();
    }
  }, [userIdParam, token]);

  const handleConversationSelect = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setShowMobileThread(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setShowMobileThread(false);
  }, []);

  const getOtherParticipant = (conversation) => {
    if (!conversation || !currentUser) return null;
    return conversation.otherParticipant;
  };

  const renderConnectionStatus = () => {
    if (connectionStatus === 'connected') {
      return (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Wifi className="h-3 w-3" />
          <span>Đã kết nối</span>
        </div>
      );
    }
    if (connectionStatus === 'connecting') {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Đang kết nối...</span>
        </div>
      );
    }
    if (connectionStatus === 'reconnecting') {
      const delaySeconds = Math.round(nextRetryDelay / 1000);
      return (
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Đang kết nối lại... (lần {reconnectAttempt}{delaySeconds > 0 && `, thử lại sau ${delaySeconds}s`})</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-destructive">
        <WifiOff className="h-3 w-3" />
        <span>Mất kết nối</span>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background -m-4 md:-m-6 lg:-m-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Tin nhắn</h2>
            {renderConnectionStatus()}
          </div>
        </div>
      </div>

      {/* Connection Alerts */}
      {connectionStatus === 'disconnected' && (
        <Alert variant="destructive" className="m-0 rounded-none border-x-0">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Mất kết nối với máy chủ. Đang thử kết nối lại...</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-7"
              onClick={async () => {
                socketService.disconnect();
                isConnectionInitiatedRef.current = false;
                setConnectionStatus('connecting');
                isConnectionInitiatedRef.current = true;
                try {
                  await socketService.connect(token);
                  setConnectionStatus('connected');
                } catch (error) {
                  console.error('Manual reconnect failed:', error);
                }
              }}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'reconnecting' && (
        <Alert className="m-0 rounded-none border-x-0 border-amber-500 bg-amber-50 text-amber-900">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Đang kết nối lại với máy chủ... (lần thử {reconnectAttempt})
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-80 border-r bg-white flex-shrink-0",
          showMobileThread && "hidden md:block"
        )}>
          <ConversationList
            selectedConversation={selectedConversation}
            selectedConversationId={selectedConversation?._id}
            onConversationSelect={handleConversationSelect}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* Message Thread */}
        <div className={cn(
          "flex-1 flex flex-col bg-gray-50",
          !showMobileThread && "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              <div className="md:hidden flex items-center gap-2 p-2 border-b bg-white">
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  ← Quay lại
                </Button>
              </div>

              {connectionStatus === 'connecting' ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Đang kết nối...</h3>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <ChatContextHeader context={selectedConversation.context} />
                  <div className="flex-1 min-h-0">
                    <MessageThread
                      conversationId={selectedConversation._id}
                      recipientId={getOtherParticipant(selectedConversation)?._id}
                      recipientName={getOtherParticipant(selectedConversation)?.name || 'Người dùng'}
                      recipientAvatar={getOtherParticipant(selectedConversation)?.avatar}
                      isOnline={getOtherParticipant(selectedConversation)?._id && onlineUsers.has(getOtherParticipant(selectedConversation)?._id)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin với ứng viên
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
