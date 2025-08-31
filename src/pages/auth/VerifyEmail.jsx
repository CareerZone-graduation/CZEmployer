import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MailWarning } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail } from '@/services/authService';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Email is now retrieved inside the component logic
  const email = location.state?.email;

  useEffect(() => {
    // If there's no email, redirect to login because this page is useless without it.
    if (!email) {
      navigate('/auth/login');
    }
  }, [email, navigate]);


  const handleResendEmail = async () => {
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
            <MailWarning className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Xác thực địa chỉ Email của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Tài khoản của bạn chưa được kích hoạt. Chúng tôi đã gửi một email xác thực đến:
          </p>
          <p className="font-semibold text-primary mb-6">{email}</p>
          <p className="text-muted-foreground mb-6">
            Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để hoàn tất đăng ký.
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
                {isLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
              </Button>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/login">Quay lại trang đăng nhập</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;