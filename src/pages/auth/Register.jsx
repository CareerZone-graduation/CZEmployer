import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, Loader2, User, Mail, Lock, Briefcase } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as authService from '@/services/authService';

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
        toast.error('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await authService.register(formData);
        console.log(response);
        const successMessage = response?.message || 'Đăng ký thành công! Vui lòng đăng nhập.';
        toast.success(successMessage);
        navigate('/register-success', { state: { email: formData.email } });
      } catch (err) {
        console.error(err);
        const errorMessage =
          err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, navigate],
  );

  return (
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Briefcase className="h-8 w-8 text-emerald-700" />
              <h1 className="text-3xl font-bold text-emerald-700">CareerZone</h1>
            </div>
            <h2 className="text-3xl font-bold">Tạo tài khoản Nhà tuyển dụng</h2>
            <p className="text-balance text-muted-foreground">
              Điền thông tin dưới đây để bắt đầu tìm kiếm ứng viên tài năng.
            </p>
          </div>
          <form onSubmit={handleRegister}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullname">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="fullname" name="fullname" placeholder="Nguyễn Văn A" required value={formData.fullname} onChange={handleChange} disabled={isLoading} className="pl-10" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="email@congty.com" required value={formData.email} onChange={handleChange} disabled={isLoading} className="pl-10" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" name="password" type="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} disabled={isLoading} className="pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Tạo tài khoản
              </Button>
              <Button variant="outline" className="w-full" type="button">
                <FcGoogle className="mr-2 h-4 w-4" />
                Đăng ký với Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="underline font-semibold text-emerald-700">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Register;
