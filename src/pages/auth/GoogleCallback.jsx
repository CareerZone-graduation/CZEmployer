import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { loginSuccess, fetchUser } from '@/redux/authSlice';
import { handleGoogleCallback } from '@/services/googleAuthService';
import { saveAccessToken } from '@/utils/token';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false); // Ngăn chạy 2 lần

  useEffect(() => {
    // Ngăn chặn chạy 2 lần (React Strict Mode)
    if (hasProcessed.current) {
      console.log('Already processed, skipping...');
      return;
    }

    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      console.log('Processing Google callback...', { code: code?.substring(0, 10), state: state?.substring(0, 10) });

      // Handle OAuth errors
      if (errorParam) {
        setError('Đăng nhập Google bị hủy hoặc thất bại.');
        toast.error('Đăng nhập Google thất bại.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setError('Thiếu thông tin xác thực từ Google.');
        toast.error('Lỗi xác thực Google.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Mark as processed BEFORE API call
      hasProcessed.current = true;

      try {
        // Exchange code for tokens
        const loginData = await handleGoogleCallback(code, state);

        if (loginData && loginData.accessToken) {
          // Check role
          if (loginData.role !== 'recruiter') {
            toast.error('Tài khoản này là tài khoản ứng viên, không thể đăng nhập vào trang nhà tuyển dụng.');
            setTimeout(() => navigate('/auth/login'), 2000);
            return;
          }

          saveAccessToken(loginData.accessToken);
          await dispatch(fetchUser()).unwrap();

          toast.success('Đăng nhập thành công!');
          navigate('/');
        } else {
          throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập Google thất bại.';
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    };

    processCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Đăng nhập thất bại</h2>
            <p className="text-slate-600">{error}</p>
            <p className="text-sm text-slate-500">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-emerald-600 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-900">Đang xác thực với Google</h2>
            <p className="text-slate-600">Vui lòng đợi trong giây lát...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
