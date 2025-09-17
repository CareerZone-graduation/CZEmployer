import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Loader2, CheckCircle, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as authService from '@/services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });

      if (response.success) {
        setIsEmailSent(true);
        toast.success(response.message || 'Email khôi phục mật khẩu đã được gửi');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isEmailSent ? (
        /* Success State */
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Kiểm tra email của bạn
            </h2>
            <p className="text-gray-600">
              Chúng tôi đã gửi liên kết khôi phục mật khẩu đến
            </p>
            <p className="font-semibold text-emerald-600">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Hướng dẫn tiếp theo:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Kiểm tra hộp thư đến của bạn</li>
                  <li>• Nhấp vào liên kết trong email</li>
                  <li>• Tạo mật khẩu mới</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsEmailSent(false)}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              Gửi lại email
            </Button>
            
            <Button asChild variant="outline" className="w-full h-12">
              <Link to="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Form State */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              Khôi phục mật khẩu
            </h2>
            <p className="text-gray-600">
              Nhập email để nhận liên kết khôi phục mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Địa chỉ email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang gửi email...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Gửi liên kết khôi phục
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-emerald-600">
              <Link to="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
