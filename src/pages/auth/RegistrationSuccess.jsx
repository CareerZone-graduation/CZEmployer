import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail } from '@/services/authService';
import { toast } from 'sonner';

const RegistrationSuccess = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [isLoading, setIsLoading] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Không tìm thấy địa chỉ email để gửi lại.');
      return;
    }
    setIsLoading(true);
    try {
      await resendVerificationEmail({ email });
      toast.success('Email xác thực đã được gửi lại thành công!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Gửi lại email thất bại. Vui lòng thử lại sau.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Đăng ký thành công!
          </h2>
          <p className="text-gray-600">
            Tài khoản của bạn đã được tạo thành công
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Email xác thực đã được gửi đến:
              </p>
              <p className="font-semibold text-emerald-600 mb-3">
                {email || 'email của bạn'}
              </p>
              <p className="text-sm text-blue-700">
                Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để kích hoạt tài khoản.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            asChild 
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <Link to="/auth/login">
              Quay lại trang đăng nhập
            </Link>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa nhận được email?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-emerald-600 hover:text-emerald-700"
                onClick={handleResendEmail}
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;