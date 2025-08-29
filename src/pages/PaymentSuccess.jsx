import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getMe } from '@/services/authService';

const PaymentSuccess = () => {
  const { setUser } = useAuth();

  useEffect(() => {
    // Refetch user data to update coin balance
    getMe()
      .then(response => {
        if (response.data) {
          setUser(response.data);
        }
      })
      .catch(error => {
        console.error('Failed to refetch user data after payment:', error);
      });
  }, [setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4">Thanh toán thành công!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Giao dịch nạp xu của bạn đã được hoàn tất. Số xu đã được cập nhật vào tài khoản của bạn.
          </p>
          <Button asChild>
            <Link to="/dashboard">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;