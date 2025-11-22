import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { X, MessageCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import ChatContextHeader from './ChatContextHeader';
import socketService from '@/services/socketService';
import { cn } from '@/lib/utils';
import { getAccessToken } from '@/utils/token'; // <-- 1. Import hàm này
/**
 * ChatInterface Component
 * Main chat interface with conversation list sidebar and message thread
 * Manages Socket.io connection lifecycle and conversation selection
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the chat interface is open
 * @param {Function} props.onClose - Callback to close the chat interface
 * @param {string} props.conversationId - Initial conversation ID to open (optional)
 * @param {string} props.recipientId - Initial recipient ID to start conversation with (optional)
 */
const ChatInterface = ({
  isOpen,
  onClose,
  conversationId: initialConversationId = null,
  recipientId: initialRecipientId = null
}) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'connecting', 'reconnecting', 'disconnected'
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [nextRetryDelay, setNextRetryDelay] = useState(0);
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Get current user and token from Redux
  const currentUser = useSelector((state) => state.auth.user?.user);
  const token = getAccessToken(); // <-- THAY BẰNG DÒNG NÀY  
  // Use ref to track if we've already initiated connection
  const isConnectionInitiatedRef = useRef(false);
  const hasCleanedUpRef = useRef(false);
  console.log(connectionStatus)


  /**
     * Establish Socket connection on mount
     * Chỉ gọi connect một lần và để thư viện tự xử lý reconnect.
     */
  useEffect(() => {
    if (!isOpen || !token) {
      return;
    }

    // 1. Nếu đã kết nối, không làm gì cả
    const isSocketConnected = socketService.getConnectionStatus();
    if (isSocketConnected) {
      console.log('[ChatInterface] Socket already connected');
      setConnectionStatus('connected');
      return;
    }

    // 2. Nếu đang trong quá trình khởi tạo (từ lần render trước), không làm gì cả
    if (isConnectionInitiatedRef.current) {
      console.log('[ChatInterface] Connection already in progress, waiting...');
      return;
    }

    // 3. Dọn dẹp mọi instance "treo" từ trước (Rất quan trọng!)
    console.log('[ChatInterface] Disconnecting any stale socket instance...');
    socketService.disconnect();

    // 4. Bắt đầu kết nối MỘT LẦN DUY NHẤT
    console.log('[ChatInterface] Establishing Socket connection...');
    isConnectionInitiatedRef.current = true;
    setConnectionStatus('connecting');

    const connectSocket = async () => {
      try {
        // Chỉ cần gọi connect() một lần.
        // Nếu thất bại, thư viện sẽ tự động thử kết nối lại
        // và useEffect 2 (với onReconnecting, onDisconnect) sẽ xử lý.
        await socketService.connect(token);

        console.log('[ChatInterface] Socket.connect() call successful');

        // Nếu nó kết nối ngay lập tức, cập nhật trạng thái
        if (socketService.getConnectionStatus()) {
          setConnectionStatus('connected');
        }
        // Nếu không, status vẫn là 'connecting' và 
        // listener 'onConnect' (trong useEffect 2) sẽ xử lý

      } catch (error) {
        // Lỗi này xảy ra nếu lệnh `connect()` bị lỗi ngay lập tức
        console.error('[ChatInterface] Socket.connect() call failed immediately:', error.message);
        setConnectionStatus('disconnected');
        isConnectionInitiatedRef.current = false; // Cho phép thử lại nếu component mở lại
      }
    };

    connectSocket();

    // 5. Cleanup khi component unmount
    return () => {
      console.log('[ChatInterface] Component unmounting, keeping socket connected');
      // Reset ref để lần mở tiếp theo có thể kết nối lại
      isConnectionInitiatedRef.current = false;
    };
  }, [isOpen, token]); // Phụ thuộc vẫn giữ nguyên

  // Track selected conversation for reconnect handler
  const selectedConversationRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  /**
   * Handle connection status events
   */
  useEffect(() => {
    if (!isOpen) return;

    // Connection established
    const handleConnect = () => {
      console.log('[ChatInterface] Socket connected');
      setConnectionStatus('connected');
      setReconnectAttempt(0);
    };

    // Connection lost
    const handleDisconnect = (reason) => {
      console.log('[ChatInterface] Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    };

    // Connection error
    const handleConnectionError = (data) => {
      console.error('[ChatInterface] Socket connection error:', data);
      setConnectionStatus('disconnected');
      if (data?.attempt) {
        setReconnectAttempt(data.attempt);
      }
      if (data?.nextDelay) {
        setNextRetryDelay(data.nextDelay);
      }
    };

    // Reconnecting
    const handleReconnecting = (attemptNumber) => {
      console.log('[ChatInterface] Socket reconnecting, attempt:', attemptNumber);
      setConnectionStatus('reconnecting');
      setReconnectAttempt(attemptNumber);
    };

    // Reconnected successfully
    const handleReconnect = (attemptNumber) => {
      console.log('[ChatInterface] Socket reconnected after', attemptNumber, 'attempts');
      setConnectionStatus('connected');
      setReconnectAttempt(0);

      // Trigger message sync for active conversation
      if (selectedConversationRef.current?._id) {
        console.log('[ChatInterface] Triggering message sync after reconnect');
        // Dispatch custom event to notify MessageThread to sync
        window.dispatchEvent(new CustomEvent('socket:reconnected', {
          detail: { conversationId: selectedConversationRef.current._id }
        }));
      }
    };

    // Reconnection failed
    const handleReconnectFailed = () => {
      console.error('[ChatInterface] Socket reconnection failed');
      setConnectionStatus('disconnected');
    };

    // Handle user presence update
    const handleUserPresence = (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    // Handle initial online users list
    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users));
    };

    // Register event handlers
    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);
    socketService.onConnectionError(handleConnectionError);
    socketService.onReconnecting(handleReconnecting);
    socketService.onReconnect(handleReconnect);
    socketService.onReconnectFailed(handleReconnectFailed);
    socketService.onUserPresence(handleUserPresence);
    socketService.onOnlineUsers(handleOnlineUsers);

    // Request online users if connected
    if (socketService.getConnectionStatus()) {
      socketService.getOnlineUsers();
    }

    // Cleanup
    return () => {
      socketService.off('onConnect', handleConnect);
      socketService.off('onDisconnect', handleDisconnect);
      socketService.off('onConnectionError', handleConnectionError);
      socketService.off('onReconnecting', handleReconnecting);
      socketService.off('onReconnect', handleReconnect);
      socketService.off('onReconnectFailed', handleReconnectFailed);
      socketService.off('onUserPresence', handleUserPresence);
      socketService.off('onOnlineUsers', handleOnlineUsers);
    };
  }, [isOpen]);

  /**
     * Handle initial conversation selection or creation
     * *** CHỈ CHẠY KHI SOCKET ĐÃ KẾT NỐI THÀNH CÔNG ***
     */
  useEffect(() => {
    // Chỉ chạy khi:
    // 1. Cửa sổ đang mở (isOpen)
    // 2. ĐÃ KẾT NỐI (connectionStatus === 'connected')
    // 3. Có ID ban đầu để xử lý (initialConversationId hoặc initialRecipientId)
    if (!isOpen || connectionStatus !== 'connected' || (!initialConversationId && !initialRecipientId)) {
      return;
    }

    const initializeConversation = async () => {
      // Nếu conversationId được cung cấp, chọn nó
      if (initialConversationId) {
        console.log('[ChatInterface] Selecting initial conversationId:', initialConversationId);
        setSelectedConversation({
          _id: initialConversationId,
        });
        setShowMobileThread(true);
        return;
      }

      // Nếu recipientId được cung cấp, tạo hoặc lấy cuộc trò chuyện
      // Chúng ta đã biết socket 'connected', nên KHÔNG CẦN 'await new Promise' nữa
      if (initialRecipientId) {
        try {
          console.log('[ChatInterface] Creating/getting conversation with recipient:', initialRecipientId);
          // Đảm bảo import đã được xử lý (bạn có thể đưa import ra ngoài nếu muốn)
          const { createOrGetConversation } = await import('@/services/chatService');
          const conversation = await createOrGetConversation(initialRecipientId);
          console.log('[ChatInterface] Conversation created/retrieved:', conversation);

          setSelectedConversation(conversation);
          setShowMobileThread(true);
        } catch (error) {
          console.error('[ChatInterface] Error creating conversation:', error);
          toast.error(error.message || 'Không thể tạo cuộc trò chuyện');
        }
      }
    };

    initializeConversation();
  }, [isOpen, initialConversationId, initialRecipientId, connectionStatus]); // <-- THÊM 'connectionStatus' VÀO MẢNG DEPENDENCY
  /**
   * Handle conversation selection from list
   */
  const handleConversationSelect = useCallback((conversation) => {
    console.log('[ChatInterface] Conversation selected:', conversation._id);
    setSelectedConversation(conversation);
    setShowMobileThread(true);
  }, []);

  /**
   * Handle back button on mobile
   */
  const handleBackToList = useCallback(() => {
    setShowMobileThread(false);
  }, []);

  /**
   * Handle close button
   */
  const handleClose = useCallback(() => {
    setSelectedConversation(null);
    setShowMobileThread(false);
    onClose();
  }, [onClose]);

  /**
   * Get other participant from conversation
   */
  const getOtherParticipant = (conversation) => {
    if (!conversation || !currentUser) return null;

    console.log("người dùng", conversation)
    return conversation.otherParticipant;
  };

  /**
   * Render connection status indicator
   */
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
          <span>
            Đang kết nối lại... (lần {reconnectAttempt}
            {delaySeconds > 0 && `, thử lại sau ${delaySeconds}s`})
          </span>
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

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-auto md:left-auto md:right-4 md:bottom-4 md:top-4 md:w-[900px] md:max-w-[calc(100vw-2rem)] bg-background border rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Tin nhắn</h2>
              {renderConnectionStatus()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Connection error alert */}
        {connectionStatus === 'disconnected' && (
          <Alert variant="destructive" className="m-4 mb-0">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Mất kết nối với máy chủ. Đang thử kết nối lại...</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 h-7"
                onClick={async () => {
                  console.log('[ChatInterface] Manual reconnect triggered');
                  // Reset connection state
                  socketService.disconnect();
                  isConnectionInitiatedRef.current = false;
                  hasCleanedUpRef.current = false;

                  setConnectionStatus('connecting');
                  isConnectionInitiatedRef.current = true;

                  try {
                    await socketService.connect(token);
                    console.log('[ChatInterface] Manual reconnect successful');
                    setConnectionStatus('connected');
                  } catch (error) {
                    console.error('[ChatInterface] Manual reconnect failed:', error);
                    // Don't set to disconnected, let auto-reconnect continue
                  }
                }}
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Reconnecting alert */}
        {connectionStatus === 'reconnecting' && (
          <Alert className="m-4 mb-0 border-amber-500 bg-amber-50 text-amber-900">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Đang kết nối lại với máy chủ... (lần thử {reconnectAttempt})
            </AlertDescription>
          </Alert>
        )}

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List - Sidebar */}
          <div className={cn(
            "w-full md:w-80 border-r flex-shrink-0",
            showMobileThread && "hidden md:block"
          )}>
            <ConversationList
              selectedConversationId={selectedConversation?._id}
              onConversationSelect={handleConversationSelect}
              onlineUsers={onlineUsers}
            />
          </div>

          {/* Message Thread - Main area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !showMobileThread && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Mobile back button */}
                <div className="md:hidden flex items-center gap-2 p-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                  >
                    ← Quay lại
                  </Button>
                </div>

                {/* Show loading state while connecting */}
                {connectionStatus === 'connecting' ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Đang kết nối...
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Vui lòng đợi trong giây lát
                    </p>
                  </div>
                ) : (
                  /* Message thread */
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
              // Empty state - no conversation selected
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin với ứng viên
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
