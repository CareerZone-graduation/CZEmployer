import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentFailure = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4">Thanh toán thất bại</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
          </p>
          <Button asChild>
            <Link to="/dashboard">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;