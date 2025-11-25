import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { LogIn, Loader2, Mail, Lock } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as authService from '@/services/authService';
import { fetchUser } from '@/redux/authSlice';
import * as tokenUtil from '@/utils/token';
import { VIETNAMESE_CONTENT } from '@/constants/vietnamese';

const LoginForm = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('r1@gmail.com');
  const [password, setPassword] = useState('a');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email || !password) {
        toast.error(VIETNAMESE_CONTENT.messages.error.required);
        return;
      }

      if (!validateEmail(email)) {
        toast.error(VIETNAMESE_CONTENT.messages.error.invalidEmail);
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
              'Quyền truy cập bị từ chối. Hệ thống này chỉ dành cho nhà tuyển dụng và HR.',
            );
            return;
          }
          // Save the token first
          tokenUtil.saveAccessToken(loginData.accessToken);
          // Then, dispatch fetchUser to get the full profile
          console.log("test");
          dispatch(fetchUser());
          toast.success(VIETNAMESE_CONTENT.messages.success.login);
          // Navigation will be handled automatically by the router reacting to auth state change
        } else {
          throw new Error('Phản hồi từ server không hợp lệ.');
        }
      } catch (err) {
        // Handle specific error messages from server
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.status === 401) {
          toast.error('Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu.');
        } else {
          toast.error(VIETNAMESE_CONTENT.messages.error.loginFailed);
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
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Chào mừng quý khách trở lại
        </h2>
        <p className="text-gray-600">
          Đăng nhập để tiếp tục quản lý hoạt động tuyển dụng của doanh nghiệp
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {VIETNAMESE_CONTENT.forms.email}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="recruiter@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              disabled={isLoading}
              className="pl-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              {VIETNAMESE_CONTENT.forms.password}
            </Label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pl-11 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
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
                {VIETNAMESE_CONTENT.messages.loading.login}
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                {VIETNAMESE_CONTENT.navigation.login}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Hoặc</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setIsLoading(true);
                try {
                  const response = await authService.googleLogin(credentialResponse.credential);
                  const { data: loginData } = response;

                  if (loginData && loginData.accessToken) {
                    if (loginData.role !== 'recruiter') {
                      toast.error('Quyền truy cập bị từ chối. Tài khoản này không phải là tài khoản nhà tuyển dụng.');
                      return;
                    }

                    tokenUtil.saveAccessToken(loginData.accessToken);
                    dispatch(fetchUser());
                    toast.success(VIETNAMESE_CONTENT.messages.success.login);
                  }
                } catch (error) {
                  console.error('Google login error:', error);
                  toast.error(error.response?.data?.message || 'Đăng nhập Google thất bại');
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                toast.error('Đăng nhập Google thất bại');
              }}
              width="100%"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        </div>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/auth/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
};

export default Login;
