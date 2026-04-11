import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { LogIn, Loader2, Mail, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as authService from '@/services/authService';
import { initiateGoogleLogin, handleGoogleCallback } from '@/services/googleAuthService';
import { fetchUser } from '@/redux/authSlice';
import * as tokenUtil from '@/utils/token';
import { VIETNAMESE_CONTENT } from '@/constants/vietnamese';

const LoginForm = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessedGoogleCallback = useRef(false);

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

  const handleGoogleLogin = useCallback(() => {
    setIsGoogleLoading(true);
    initiateGoogleLogin('recruiter').catch((error) => {
      console.error('Google login init error:', error);
      toast.error('Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.');
      setIsGoogleLoading(false);
    });
  }, []);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (!code && !errorParam) {
      return;
    }

    if (hasProcessedGoogleCallback.current) {
      return;
    }

    hasProcessedGoogleCallback.current = true;
    setIsGoogleLoading(true);

    const processGoogleCallback = async () => {
      if (errorParam) {
        toast.error('Đăng nhập Google thất bại hoặc đã bị hủy.');
        navigate('/auth/login', { replace: true });
        setIsGoogleLoading(false);
        return;
      }

      if (!code || !state) {
        toast.error('Thiếu thông tin xác thực Google.');
        navigate('/auth/login', { replace: true });
        setIsGoogleLoading(false);
        return;
      }

      try {
        const loginData = await handleGoogleCallback(code, state);

        if (!loginData?.accessToken) {
          throw new Error('Phản hồi đăng nhập Google không hợp lệ.');
        }

        if (loginData.role !== 'recruiter') {
          toast.error('Tài khoản này không thuộc nhà tuyển dụng.');
          navigate('/auth/login', { replace: true });
          return;
        }

        tokenUtil.saveAccessToken(loginData.accessToken);
        await dispatch(fetchUser()).unwrap();
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Google callback login error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập Google thất bại.';
        toast.error(errorMessage);
        navigate('/auth/login', { replace: true });
      } finally {
        setIsGoogleLoading(false);
      }
    };

    processGoogleCallback();
  }, [dispatch, navigate, searchParams]);

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
            disabled={isLoading || isGoogleLoading}
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

          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            variant="outline"
            className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                <span className="font-semibold text-gray-700">Đang xác thực Google...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-semibold text-gray-700">Đăng nhập với Google</span>
              </div>
            )}
          </Button>
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
  return <LoginForm />;
};

export default Login;
