import React from 'react';
import { 
  Clock, AlertCircle, MessageSquare, Wrench, User, 
  CreditCard, Briefcase, Users, HelpCircle, ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_CONFIG = {
  pending: { label: 'Đang chờ xử lý', color: 'bg-amber-50 text-amber-700 border border-amber-100/60' },
  'in-progress': { label: 'Đang giải quyết', color: 'bg-blue-50 text-blue-700 border border-blue-100/60' },
  resolved: { label: 'Đã giải quyết', color: 'bg-emerald-50 text-emerald-700 border border-emerald-100/60' },
  closed: { label: 'Đã đóng', color: 'bg-gray-50 text-gray-500 border border-gray-200' }
};

const CATEGORY_LABELS = {
  'technical-issue': 'Lỗi kỹ thuật hệ thống',
  'account-issue': 'Hồ sơ & Tài khoản tuyển dụng',
  'payment-issue': 'Gói dịch vụ & Thanh toán',
  'job-posting-issue': 'Đăng & Kiểm duyệt tin tuyển dụng',
  'application-issue': 'Hồ sơ & Sàng lọc ứng viên',
  'general-inquiry': 'Thắc mắc chung'
};

// Helper to choose dynamic icons based on category for maximum premium feel
const getCategoryIcon = (category) => {
  switch (category) {
    case 'technical-issue':
      return <Wrench className="w-5 h-5" />;
    case 'account-issue':
      return <User className="w-5 h-5" />;
    case 'payment-issue':
      return <CreditCard className="w-5 h-5" />;
    case 'job-posting-issue':
      return <Briefcase className="w-5 h-5" />;
    case 'application-issue':
      return <Users className="w-5 h-5" />;
    default:
      return <HelpCircle className="w-5 h-5" />;
  }
};

const SupportRequestList = ({ requests = [], onSelect, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đang tải yêu cầu hỗ trợ...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white border border-emerald-100/30 rounded-3xl shadow-[0_10px_30px_rgb(0,0,0,0.01)] animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h4 className="text-base font-black text-gray-900 mb-1">Chưa có yêu cầu hỗ trợ</h4>
        <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
          Danh sách yêu cầu hỗ trợ trống. Khi có bất cứ khó khăn nào trong quá trình tuyển dụng, bạn có thể tạo yêu cầu để chúng tôi hỗ trợ ngay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4.5">
      {requests.map((request) => (
        <div
          key={request._id}
          onClick={() => onSelect(request._id)}
          className="premium-card group p-5 md:p-6 flex items-start gap-4 cursor-pointer hover:border-emerald-250 transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle decoration indicator bar inside active cards */}
          {request.hasUnreadAdminResponse && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
          )}

          {/* Dynamic Category Squircle Icon Box */}
          <div className="premium-icon-box shrink-0 group-hover:scale-105 group-hover:border-emerald-250 group-hover:bg-emerald-50">
            {getCategoryIcon(request.category)}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-950 text-base group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight leading-snug">
                    {request.subject}
                  </h3>
                  {request.hasUnreadAdminResponse && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-black uppercase bg-red-100 text-red-700 rounded-full animate-pulse border border-red-200">
                      Tin mới
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {CATEGORY_LABELS[request.category] || request.category}
                </p>
              </div>

              {/* Status & Priority Badges */}
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                {request.priority === 'urgent' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-150">
                    Khẩn cấp
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${STATUS_CONFIG[request.status]?.color || 'bg-gray-50 text-gray-600'}`}>
                  {STATUS_CONFIG[request.status]?.label || request.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
              {request.description}
            </p>

            {/* Card Footer Details */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold pt-1 border-t border-emerald-50/20">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-350" />
                <span>
                  Gửi lúc: {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>

              {request.adminResponses && request.adminResponses.length > 0 ? (
                <span className="text-emerald-700 font-bold bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100/50 flex items-center gap-1.5 group-hover:bg-emerald-100/50 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{request.adminResponses.length} phản hồi</span>
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chưa có phản hồi</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Subtle transition right arrow indicator */}
          <div className="self-center pl-2 text-gray-350 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportRequestList;
