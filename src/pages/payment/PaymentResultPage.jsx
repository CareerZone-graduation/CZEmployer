import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Coins, ArrowLeft, Home } from 'lucide-react';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const success = searchParams.get('success') === 'true';
  const message = searchParams.get('message') || '';
  const coins = searchParams.get('coins') || 0;
  const amount = searchParams.get('amount') || 0;
  const code = searchParams.get('code') || '';

  useEffect(() => {
    // Refresh user data if payment successful
    if (success) {
      // You can dispatch a Redux action here to refresh user balance
      // dispatch(fetchUserProfile());
    }
  }, [success]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {success ? (
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          ) : (
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-4">
          {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>

        {/* Success Details */}
        {success && coins > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Coins className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold text-green-700">
                +{coins} xu
              </span>
            </div>
            <p className="text-center text-sm text-green-700">
              đã được thêm vào tài khoản của bạn
            </p>
            {amount > 0 && (
              <p className="text-center text-xs text-gray-600 mt-2">
                Số tiền: {formatCurrency(amount)}
              </p>
            )}
          </div>
        )}

        {/* Error Code */}
        {!success && code && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-center text-sm text-red-700">
              Mã lỗi: <strong>{code}</strong>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </button>
          
          {success ? (
            <button
              onClick={() => navigate('/jobs/create')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Đăng tin tuyển dụng
            </button>
          ) : (
            <button
              onClick={() => navigate('/payment/recharge')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Nếu có vấn đề, vui lòng liên hệ{' '}
          <a href="mailto:support@careerzone.com" className="text-green-600 hover:underline">
            support@careerzone.com
          </a>
        </p>
      </div>
    </div>
  );
}
