import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { LogIn, Loader2, Mail, Lock } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as authService from '@/services/authService';
import { fetchUser } from '@/redux/authSlice';
import * as tokenUtil from '@/utils/token';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      
      if (!email || !password) {
        toast.error('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
      }

      if (!validateEmail(email)) {
        toast.error('Vui lòng nhập email hợp lệ.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await authService.login({ email, password });
        console.log("response", response);
        const { data: loginData } = response;

        if (loginData && loginData.accessToken) {
          if (loginData.role !== 'recruiter') {
            toast.error(
              'Quyền truy cập bị từ chối. Trang này chỉ dành cho nhà tuyển dụng.',
            );
            return;
          }
          // Save the token first
          tokenUtil.saveAccessToken(loginData.accessToken);
          // Then, dispatch fetchUser to get the full profile
          console.log("test");
          dispatch(fetchUser());
          toast.success('Đăng nhập thành công!');
          // Navigation will be handled automatically by the router reacting to auth state change
        } else {
          throw new Error('Phản hồi từ server không hợp lệ.');
        }
      } catch (err) {
        // Handle specific error messages from server
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.status === 401) {
          toast.error('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } else {
          toast.error('Đăng nhập thất bại. Vui lòng thử lại sau.');
        }
        console.error('Login page error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, dispatch],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-2 text-center">
        <h2 className="text-2xl font-bold">Đăng nhập</h2>
        <p className="text-balance text-muted-foreground">
          Nhập thông tin của bạn để truy cập tài khoản
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Mật khẩu</Label>
            
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div></div>
          <Link 
            to="/auth/forgot-password" 
            className="text-sm text-primary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          Đăng nhập
        </Button>
        <Button variant="outline" className="w-full" type="button">
          <FcGoogle className="mr-2 h-4 w-4" />
          Đăng nhập với Google
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className="underline font-semibold text-emerald-700">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default Login;
