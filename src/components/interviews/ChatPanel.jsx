import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatPanel = ({ messages = [], onSendMessage, onClose, currentUserId }) => {
  const [messageText, setMessageText] = useState('');
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Tin nhắn</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Chưa có tin nhắn nào</p>
              <p className="text-xs mt-1">Gửi tin nhắn để bắt đầu trò chuyện</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    isOwnMessage ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {!isOwnMessage && message.senderName && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {format(new Date(message.timestamp), 'HH:mm', { locale: vi })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {messageText.length}/500 ký tự
        </p>
      </form>
    </div>
  );
};

export default ChatPanel;
