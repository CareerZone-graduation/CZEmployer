import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download, FileText, MessageSquare } from 'lucide-react';

// Status Label
const getStatusLabel = (status) => {
  const statusLabels = {
    'pending': 'Đang chờ',
    'in-progress': 'Đang xử lý',
    'resolved': 'Đã giải quyết',
    'closed': 'Đã đóng'
  };
  return statusLabels[status] || status;
};

// Priority Label
const getPriorityLabel = (priority) => {
  const priorityLabels = {
    'urgent': 'Khẩn cấp',
    'high': 'Cao',
    'medium': 'Trung bình',
    'low': 'Thấp'
  };
  return priorityLabels[priority] || priority;
};

const MessageThread = ({ messages = [], adminResponses = [] }) => {
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
        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        Chưa có tin nhắn nào
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {allMessages.map((message, index) => {
        const isAdmin = message.type === 'admin';

        return (
          <div
            key={index}
            className={`relative pl-4 py-4 border-l-4 ${
              isAdmin 
                ? 'border-l-green-500 bg-green-50/50' 
                : 'border-l-blue-500 bg-white'
            } ${index !== allMessages.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            {/* Header: Name, Badge, Time */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {isAdmin 
                    ? (message.adminName || 'admin@gmail.com') 
                    : (message.sender?.name || 'Bạn')
                  }
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  isAdmin 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAdmin ? 'Admin' : 'Nhà tuyển dụng'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(message.createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
              </span>
            </div>

            {/* Message Content */}
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Status/Priority Changes */}
            {isAdmin && (message.statusChange || message.priorityChange) && (
              <div className="mt-2 space-y-1">
                {message.statusChange && (
                  <p className="text-sm text-green-600">
                    Trạng thái: {getStatusLabel(message.statusChange.from)} → {getStatusLabel(message.statusChange.to)}
                  </p>
                )}
                {message.priorityChange && (
                  <p className="text-sm text-green-600">
                    Độ ưu tiên: {getPriorityLabel(message.priorityChange.from)} → {getPriorityLabel(message.priorityChange.to)}
                  </p>
                )}
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.attachments.map((file, fileIndex) => (
                  <a
                    key={fileIndex}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="truncate max-w-[150px]">{file.filename}</span>
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;
