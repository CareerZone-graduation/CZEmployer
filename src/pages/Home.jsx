import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-700">
              <Briefcase className="h-7 w-7" />
              <span>CareerZone</span>
            </Link>
            <nav className="space-x-4">
              <Link to="/auth/login" className="text-gray-600 hover:text-emerald-700 font-medium">
                Đăng nhập
              </Link>
              <Link to="/auth/register">
                <Button className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800">
                  Đăng ký
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center">
        <div className="text-center w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Tìm Kiếm và Tuyển Dụng Nhân Tài Hàng Đầu
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Nền tảng kết nối nhà tuyển dụng với những ứng viên xuất sắc nhất. Đăng tin tuyển dụng và quản lý ứng viên một cách hiệu quả.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/auth/register">
                <Button size="lg" className="bg-emerald-700 text-white hover:bg-emerald-800">
                  Bắt đầu Tuyển dụng
                </Button>
            </Link>
            <Link to="/auth/login">
                <Button size="lg" variant="outline">
                  Tôi đã có tài khoản
                </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
