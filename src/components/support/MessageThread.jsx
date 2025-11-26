import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download, FileText } from 'lucide-react';

const MessageThread = ({ messages = [], adminResponses = [], currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, adminResponses]);

  // Combine and sort all messages
  const allMessages = [
    ...messages.map(msg => ({ ...msg, type: 'user' })),
    ...adminResponses.map(resp => ({ ...resp, type: 'admin', content: resp.response }))
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (allMessages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có tin nhắn nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allMessages.map((message, index) => {
        const isAdmin = message.type === 'admin';
        const isCurrentUser = message.sender?.userId === currentUserId;

        return (
          <div
            key={index}
            className={`flex ${isAdmin || !isCurrentUser ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] ${isAdmin || !isCurrentUser ? 'items-start' : 'items-end'}`}>
              {/* Sender Info */}
              <div className={`flex items-center space-x-2 mb-1 ${isAdmin || !isCurrentUser ? '' : 'justify-end'}`}>
                <span className={`text-xs font-medium ${isAdmin ? 'text-blue-600' : 'text-gray-600'}`}>
                  {isAdmin ? (message.adminName || 'Quản trị viên') : (message.sender?.name || 'Bạn')}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-lg px-4 py-3 ${
                  isAdmin
                    ? 'bg-blue-50 border border-blue-200'
                    : isCurrentUser
                    ? 'bg-gray-100 border border-gray-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {/* Status/Priority Changes */}
                {isAdmin && (message.statusChange || message.priorityChange) && (
                  <div className="mt-2 pt-2 border-t border-blue-200 space-y-1">
                    {message.statusChange && (
                      <p className="text-xs text-blue-600">
                        Trạng thái: {message.statusChange.from} → {message.statusChange.to}
                      </p>
                    )}
                    {message.priorityChange && (
                      <p className="text-xs text-blue-600">
                        Độ ưu tiên: {message.priorityChange.from} → {message.priorityChange.to}
                      </p>
                    )}
                  </div>
                )}

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((file, fileIndex) => (
                      <a
                        key={fileIndex}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{file.filename}</span>
                        <Download className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;
