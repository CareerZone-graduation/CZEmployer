import { Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-emerald-50/20 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorative abstract grid overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(oklch(0.55 0.16 150 / 0.08) 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      ></div>

      {/* Back to Homepage Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold shadow-sm rounded-xl gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Button>
      </div>

      {/* Main Dual-Panel Premium Container */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_24px_60px_-15px_rgba(5,150,105,0.06)] border border-emerald-100/50 flex flex-col md:flex-row overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* LEFT PANEL - Elegant White Auth Form Area */}
        <div className="w-full md:w-[53%] p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-100">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-xl tracking-tight flex items-center gap-0.5 select-none">
                <span>Career</span>
                <span className="text-emerald-600 font-black">Zone</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2.5 animate-pulse"></span>
              </span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nhà tuyển dụng chuyên nghiệp</p>
            </div>
          </div>

          {/* Render Active Form (Login / Register) */}
          <div className="relative">
            <Outlet />
          </div>

          {/* Small Footer Notice */}
          <p className="text-center text-[11px] text-gray-400 mt-8 font-medium">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="#" className="text-emerald-600 font-bold hover:underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="text-emerald-600 font-bold hover:underline">
              Chính sách bảo mật
            </a>{' '}
            của CareerZone.
          </p>
        </div>

        {/* RIGHT PANEL - High-end Colorful Brand Banner */}
        <div className="w-full md:w-[47%] bg-premium-gradient premium-grid-pattern p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-between relative min-h-[460px] md:min-h-auto">
          {/* Subtle grid pattern layout overlay */}
          <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Round Top Icon Box */}
            <div className="flex justify-start mb-8">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                <Mail className="h-5 w-5 text-emerald-300" />
              </div>
            </div>

            {/* Core Message Area */}
            <div className="space-y-5">
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Nhận thông báo về <span className="text-emerald-300 underline decoration-wavy decoration-emerald-400/40">việc làm mới</span> nhất
              </h2>
              
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                Đồng hành cùng CareerZone để tối ưu hóa quy trình sàng lọc hồ sơ, nhận gợi ý ứng viên tự động thông qua công nghệ AI và nhanh chóng kết nối với những nhân tài xuất sắc nhất.
              </p>

              {/* Aesthetic Bullet Checks */}
              <div className="space-y-3.5 pt-3 text-xs lg:text-sm font-bold text-white/90">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/25 flex items-center justify-center text-emerald-300 border border-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Gợi ý ứng viên thông minh tự động bằng AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/25 flex items-center justify-center text-emerald-300 border border-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Công cụ quản lý ứng viên theo Pipeline trực quan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/25 flex items-center justify-center text-emerald-300 border border-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Hệ thống tạo & đánh giá bài kiểm tra chuyên môn</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/25 flex items-center justify-center text-emerald-300 border border-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Hoàn toàn bảo mật thông tin doanh nghiệp</span>
                </div>
              </div>
            </div>

            {/* Bottom Highlight Statistics Box */}
            <div className="mt-12 border-t border-white/15 pt-6 space-y-2">
              <h3 className="text-base lg:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Tăng 70% cơ hội tuyển dụng</span>
              </h3>
              <p className="text-white/70 text-xs font-normal leading-relaxed">
                Những nhà tuyển dụng tích cực kết nối và tương tác thông qua nền tảng tự động có tỉ lệ giữ chân nhân tài và chốt hồ sơ thành công cao hơn 70% so với phương pháp thủ công truyền thống.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;

