import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_CONFIG = {
  pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-800' }
};

const CATEGORY_LABELS = {
  'technical-issue': 'Vấn đề kỹ thuật',
  'account-issue': 'Vấn đề tài khoản',
  'payment-issue': 'Vấn đề thanh toán',
  'job-posting-issue': 'Vấn đề đăng tin',
  'application-issue': 'Vấn đề ứng tuyển',
  'general-inquiry': 'Thắc mắc chung'
};

const SupportRequestList = ({ requests = [], onSelect, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Chưa có yêu cầu hỗ trợ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request._id}
          onClick={() => onSelect(request._id)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {request.subject}
                </h3>
                {request.hasUnreadAdminResponse && (
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {CATEGORY_LABELS[request.category] || request.category}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[request.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                {STATUS_CONFIG[request.status]?.label || request.status}
              </span>
              {request.priority === 'urgent' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Khẩn cấp
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {request.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </span>
            </div>
            {request.adminResponses && request.adminResponses.length > 0 && (
              <span className="text-blue-600">
                {request.adminResponses.length} phản hồi
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportRequestList;
