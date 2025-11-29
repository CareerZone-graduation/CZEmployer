import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import MessageThread from '../../components/support/MessageThread';
import AttachmentUploader from '../../components/common/AttachmentUploader';
import { getSupportRequestById, addFollowUpMessage } from '../../services/supportRequestService';

const STATUS_CONFIG = {
  pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-800' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Cao', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-800' }
};

const CATEGORY_LABELS = {
  'technical-issue': 'Vấn đề kỹ thuật',
  'account-issue': 'Vấn đề tài khoản',
  'payment-issue': 'Vấn đề thanh toán',
  'job-posting-issue': 'Vấn đề đăng tin',
  'application-issue': 'Vấn đề ứng tuyển',
  'general-inquiry': 'Thắc mắc chung'
};

const SupportRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['supportRequest', id],
    queryFn: () => getSupportRequestById(id)
  });

  const mutation = useMutation({
    mutationFn: () => addFollowUpMessage(id, message, files),
    onSuccess: () => {
      toast.success('Tin nhắn đã được gửi');
      setMessage('');
      setFiles([]);
      setShowAttachments(false);
      queryClient.invalidateQueries(['supportRequest', id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const request = data?.data || data;
  const canAddMessage = request?.status === 'pending' || request?.status === 'in-progress';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/support')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Request Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{request?.subject}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Danh mục: {CATEGORY_LABELS[request?.category] || request?.category}</span>
                <span>•</span>
                <span>Tạo lúc: {format(new Date(request?.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[request?.status]?.color}`}>
                {STATUS_CONFIG[request?.status]?.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_CONFIG[request?.priority]?.color}`}>
                {PRIORITY_CONFIG[request?.priority]?.label}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Mô tả:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{request?.description}</p>
          </div>

          {request?.attachments && request.attachments.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-900 mb-3">Tệp đính kèm ({request.attachments.length}):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.attachments.map((file, index) => {
                  const isImage = file.fileType?.startsWith('image/');
                  
                  return (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {isImage ? (
                        <div className="relative group cursor-pointer" onClick={() => setPreviewImage(file)}>
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(file);
                              }}
                              className="px-3 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Xem
                            </button>
                            <a
                              href={file.url}
                              download={file.filename}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Tải về
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-gray-100">
                          <Paperclip className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {(file.fileSize / 1024).toFixed(2)} KB
                          </p>
                          {!isImage && (
                            <a
                              href={file.url}
                              download={file.filename}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử tin nhắn</h2>
          </div>
          <MessageThread
            messages={request?.messages || []}
            adminResponses={request?.adminResponses || []}
            currentUserId={request?.requester?.userId}
          />
        </div>

        {/* Follow-up Form */}
        {canAddMessage && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thêm tin nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Nhập tin nhắn của bạn..."
                disabled={mutation.isPending}
              />

              {showAttachments && (
                <AttachmentUploader files={files} onChange={setFiles} />
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Paperclip className="w-5 h-5" />
                  <span>{showAttachments ? 'Ẩn' : 'Đính kèm tệp'}</span>
                </button>

                <button
                  type="submit"
                  disabled={mutation.isPending || !message.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>{mutation.isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {!canAddMessage && (
          <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
            Yêu cầu này đã được {request?.status === 'resolved' ? 'giải quyết' : 'đóng'}. Bạn không thể thêm tin nhắn mới.
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{previewImage.filename}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewImage.url}
                alt={previewImage.filename}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <a
                href={previewImage.url}
                download={previewImage.filename}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải về
              </a>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Mở tab mới
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportRequestDetailPage;
