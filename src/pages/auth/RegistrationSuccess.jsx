import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail } from '@/services/authService';
import { toast } from 'sonner';

const RegistrationSuccess = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [isLoading, setIsLoading] = useState(false);

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
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Đăng ký thành công!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            Một email xác thực đã được gửi đến địa chỉ:
          </p>
          <p className="font-semibold text-primary mb-6">{email || 'email của bạn'}</p>
          <p className="text-muted-foreground mb-6">
            Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để kích hoạt tài khoản.
          </p>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/auth/login">Quay lại trang đăng nhập</Link>
            </Button>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;