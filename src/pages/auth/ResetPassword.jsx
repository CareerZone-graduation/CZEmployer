import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import * as authService from '@/services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token không hợp lệ');
      navigate('/auth/login');
    }
  }, [token, navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        token,
        newPassword
      });
      
      if (response.success) {
        setIsSuccess(true);
        toast.success(response.message || 'Đặt lại mật khẩu thành công');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Đặt lại mật khẩu thành công
            </h2>
            <p className="text-gray-600">
              Mật khẩu của bạn đã được cập nhật thành công
            </p>
          </div>

          <Button 
            asChild 
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <Link to="/auth/login">
              Đăng nhập ngay
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Đặt lại mật khẩu
        </h2>
        <p className="text-gray-600">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            Mật khẩu mới
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-11 pr-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              disabled={isLoading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Mật khẩu phải có ít nhất 8 ký tự
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 pr-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              disabled={isLoading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
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
              Đang cập nhật...
            </>
          ) : (
            'Đặt lại mật khẩu'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button asChild variant="ghost" className="text-gray-600 hover:text-emerald-600">
          <Link to="/auth/login">
            Quay lại đăng nhập
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ResetPassword;
