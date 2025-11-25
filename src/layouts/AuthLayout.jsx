import { Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Back to Homepage Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/10 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại trang chủ
        </Button>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Branding and features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white relative">
          <div className="max-w-lg">
            {/* Logo and brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">CareerZone</h1>
                <p className="text-blue-200 text-sm">Nền tảng tuyển dụng hàng đầu</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-semibold mb-6">
                Tìm kiếm nhân tài xuất sắc cho doanh nghiệp của bạn
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Hơn 100,000+ ứng viên</h3>
                    <p className="text-blue-200 text-sm">Kho ứng viên chất lượng cao từ mọi lĩnh vực</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-600/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Tỷ lệ thành công 95%</h3>
                    <p className="text-blue-200 text-sm">Kết nối thành công giữa nhà tuyển dụng và ứng viên</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Award className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-medium">Công cụ AI thông minh</h3>
                    <p className="text-blue-200 text-sm">Gợi ý ứng viên phù hợp với yêu cầu công việc</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-sm italic mb-3">
                "CareerZone đã giúp chúng tôi tìm được những nhân tài xuất sắc trong thời gian ngắn.
                Giao diện thân thiện và tính năng tìm kiếm rất hiệu quả."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  N
                </div>
                <div>
                  <p className="font-medium text-sm">Nguyễn Văn A</p>
                  <p className="text-blue-200 text-xs">HR Manager, TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CareerZone</h1>
                <p className="text-blue-200 text-sm">Nền tảng tuyển dụng hàng đầu</p>
              </div>
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <Outlet />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AuthLayout;
