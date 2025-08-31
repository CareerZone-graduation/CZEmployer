import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { AlertCircle, Mail } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail } from '@/services/authService';

const EmailVerificationBanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const userEmail = useSelector((state) => state.auth.user?.user?.email);

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast.error('Không tìm thấy địa chỉ email để gửi lại.');
      return;
    }
    setIsLoading(true);
    try {
      await resendVerificationEmail({ email: userEmail });
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
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert variant="destructive" className="max-w-4xl mx-auto shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-bold">Yêu cầu xác thực tài khoản</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p>
            Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email và làm theo hướng dẫn.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-0 sm:ml-4"
            onClick={handleResendEmail}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EmailVerificationBanner;