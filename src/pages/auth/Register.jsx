import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, Loader2, User, Mail, Lock } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as authService from '@/services/authService';
import { VIETNAMESE_CONTENT } from '@/constants/vietnamese';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    fullname: '',
    email: '',
    role: 'recruiter', // Default role
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      const { password, fullname, email, role } = formData;

      if (!password || !fullname || !email || !role) {
        toast.error(VIETNAMESE_CONTENT.messages.error.required);
        return;
      }

      setIsLoading(true);
      try {
        const response = await authService.register(formData);
        console.log(response);
        const successMessage = response?.message || VIETNAMESE_CONTENT.messages.success.register;
        toast.success(successMessage);
        navigate('/register-success', { state: { email: formData.email } });
      } catch (err) {
        console.error(err);
        const errorMessage =
          err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và thử lại.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, navigate],
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Tạo tài khoản nhà tuyển dụng
        </h2>
        <p className="text-gray-600">
          Bắt đầu hành trình tìm kiếm và kết nối với nhân tài xuất sắc
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">
            {VIETNAMESE_CONTENT.forms.fullName}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="fullname" 
              name="fullname" 
              placeholder={VIETNAMESE_CONTENT.forms.placeholder.name} 
              required 
              value={formData.fullname} 
              onChange={handleChange} 
              disabled={isLoading} 
              className="pl-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {VIETNAMESE_CONTENT.forms.companyEmail}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder={VIETNAMESE_CONTENT.forms.placeholder.email} 
              required 
              value={formData.email} 
              onChange={handleChange} 
              disabled={isLoading} 
              className="pl-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            {VIETNAMESE_CONTENT.forms.password}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••••" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              disabled={isLoading} 
              className="pl-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mật khẩu phải có ít nhất 8 ký tự
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button 
            type="submit" 
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {VIETNAMESE_CONTENT.messages.loading.register}
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Tạo tài khoản miễn phí
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="text-center space-y-3">
        <p className="text-xs text-gray-500">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <a href="#" className="text-emerald-600 hover:underline">Điều khoản dịch vụ</a>
          {' '}và{' '}
          <a href="#" className="text-emerald-600 hover:underline">Chính sách bảo mật</a>
        </p>
        
        <p className="text-gray-600">
          Đã có tài khoản?{' '}
          <Link 
            to="/auth/login" 
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
