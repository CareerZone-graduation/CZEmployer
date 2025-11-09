import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail, logoutServer } from '@/services/authService';
import { toast } from 'sonner';
import { logoutSuccess } from '@/redux/authSlice';

const VerifyEmailPrompt = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { email, isEmailVerified } = useSelector((state) => ({
    email: state.auth.user?.user?.email,
    isEmailVerified: state.auth.isEmailVerified,
  }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is already verified (e.g., verified in another tab and reloaded),
    // redirect them to the dashboard.
    if (isEmailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [isEmailVerified, navigate]);

  const handleLogout = async () => {
    try {
      await logoutServer();
    } catch (error) {
      // Ngay cả khi server logout lỗi, vẫn nên logout ở client
      console.error('Server logout failed:', error);
    } finally {
      // Disconnect socket before logout
      const { default: socketService } = await import('@/services/socketService');
      socketService.disconnect();
      dispatch(logoutSuccess());
      navigate('/auth/login', { replace: true });
    }
  };

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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Mail className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Yêu cầu xác thực tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email và làm theo hướng dẫn.
          </p>
          <p className="font-semibold text-primary mb-6">{email || 'email của bạn'}</p>
          <p className="text-muted-foreground mb-6">
            Kiểm tra hộp thư đến (và cả thư mục spam) để kích hoạt tài khoản.
          </p>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Chưa nhận được email?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-primary"
                onClick={handleResendEmail}
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lại'}
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPrompt;