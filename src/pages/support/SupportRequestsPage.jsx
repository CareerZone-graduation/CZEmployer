import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, HelpCircle, LifeBuoy, AlertCircle } from 'lucide-react';
import SupportRequestList from '../../components/support/SupportRequestList';
import { getUserSupportRequests } from '../../services/supportRequestService';
import { Badge } from '@/components/ui/badge';

const SupportRequestsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['supportRequests', filters],
    queryFn: async () => {
      console.log('🔍 Fetching support requests with filters:', filters);
      const result = await getUserSupportRequests(filters);
      console.log('📦 Support requests response:', result);
      return result;
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectRequest = (id) => {
    navigate(`/support/${id}`);
  };

  const totalRequests = data?.meta?.totalCount || 0;

  return (
    <div className="space-y-6 pb-12 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Premium Hero Header Card with Grid Overlay */}
      <div className="relative bg-white rounded-3xl border border-emerald-100/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_30px_-10px_rgba(5,150,105,0.03)] overflow-hidden animate-in fade-in duration-500">
        {/* Subtle grid pattern background decorative */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(oklch(0.55 0.16 150) 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px',
          }}
        ></div>
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <LifeBuoy className="w-5 h-5 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Trung tâm Hỗ trợ</span>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100/60 font-bold px-2.5 py-0.5 rounded-full shadow-none text-xs">
                {totalRequests} Yêu cầu
              </Badge>
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Gửi yêu cầu hỗ trợ và tương tác trực tiếp với ban quản trị CareerZone. Chúng tôi luôn sẵn sàng đồng hành cùng doanh nghiệp của bạn.
          </p>
        </div>
        
        <button
          onClick={() => navigate('/support/new')}
          className="bg-premium-gradient hover:opacity-90 active:scale-95 text-white border-0 rounded-xl shadow-md shadow-emerald-100/40 flex items-center justify-center gap-2 font-bold transition-all px-6 h-11 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo yêu cầu hỗ trợ</span>
        </button>
      </div>

      {/* Advanced Filter Panel - Glassmorphic design */}
      <div className="premium-glass-card p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-850 font-bold text-sm shrink-0">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Bộ lọc yêu cầu:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-white/80 border border-emerald-100/50 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all hover:bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Đang chờ xử lý</option>
              <option value="in-progress">Đang trong tiến trình</option>
              <option value="resolved">Đã giải quyết thành công</option>
              <option value="closed">Đã đóng yêu cầu</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 bg-white/80 border border-emerald-100/50 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all hover:bg-white"
            >
              <option value="">Tất cả danh mục</option>
              <option value="technical-issue">Lỗi kỹ thuật hệ thống</option>
              <option value="account-issue">Hồ sơ & Tài khoản nhà tuyển dụng</option>
              <option value="payment-issue">Gói dịch vụ & Thanh toán</option>
              <option value="job-posting-issue">Kiểm duyệt & Đăng tin tuyển dụng</option>
              <option value="application-issue">Quản lý & Sàng lọc hồ sơ ứng viên</option>
              <option value="general-inquiry">Thắc mắc & Tư vấn chung</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-150 rounded-2xl p-4.5 flex items-start gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-850 text-sm">Đã xảy ra sự cố</h4>
            <p className="text-xs text-red-700 mt-0.5">Không thể tải danh sách các yêu cầu hỗ trợ. Vui lòng thử tải lại trang hoặc liên hệ bộ phận CSKH.</p>
          </div>
        </div>
      )}

      {/* Request List */}
      <SupportRequestList
        requests={Array.isArray(data) ? data : (data?.data || [])}
        onSelect={handleSelectRequest}
        isLoading={isLoading}
      />

      {/* Premium Pagination Control */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-emerald-50/50 pt-5">
          <p className="text-xs text-gray-400 font-semibold">
            Hiển thị trang <span className="text-gray-700 font-bold">{filters.page}</span> trên tổng số <span className="text-gray-700 font-bold">{data.meta.totalPages}</span> trang hỗ trợ
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-emerald-150 bg-white rounded-xl text-xs font-bold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
            >
              Trước
            </button>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === data.meta.totalPages}
              className="px-4 py-2 border border-emerald-150 bg-white rounded-xl text-xs font-bold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportRequestsPage;
