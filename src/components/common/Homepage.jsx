import React from 'react';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BarChart, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactSection from '../home/ContactSection';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Content */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                <span className="block">Nền tảng tuyển dụng</span>
                <span className="block text-emerald-600">chuyên nghiệp</span>
                <span className="block">cho doanh nghiệp Việt Nam</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-xl">
                Kết nối với ứng viên chất lượng cao, tối ưu hóa quy trình tuyển dụng và xây dựng đội ngũ mạnh mẽ với CareerZone
              </p>
              
              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>500+ doanh nghiệp tin tưởng</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>50,000+ ứng viên chất lượng</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>95% tỷ lệ tuyển dụng thành công</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register">
                  <Button 
                    size="lg" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    Dùng thử miễn phí 14 ngày
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Xem demo sản phẩm
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="relative rounded-2xl bg-white p-8 shadow-2xl border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Dashboard Tuyển dụng</h3>
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-2 w-1/2 rounded bg-gray-100"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                        <div className="h-2 w-1/3 rounded bg-gray-100"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-4/5 rounded bg-gray-200"></div>
                        <div className="h-2 w-2/5 rounded bg-gray-100"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Với CareerZone, bạn có thể tinh gọn quy trình, tiếp cận tài năng hàng đầu và xây dựng đội ngũ trong mơ
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 mb-6">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Quản lý ứng viên thông minh
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Hệ thống AI giúp sàng lọc và đề xuất ứng viên phù hợp nhất với yêu cầu công việc
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 mb-6">
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Báo cáo và phân tích chi tiết
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Theo dõi hiệu quả tuyển dụng với dashboard trực quan và báo cáo chuyên sâu
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 mb-6">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Bảo mật và tuân thủ
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Đảm bảo an toàn dữ liệu với tiêu chuẩn bảo mật cao và tuân thủ quy định pháp luật
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Career<span className="text-emerald-600">Zone</span>
              </span>
            </div>
            
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} CareerZone. Tất cả quyền được bảo lưu.
            </p>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Chính sách bảo mật
              </a>
              <a href="support" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Liên hệ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;