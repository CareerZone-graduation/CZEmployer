import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, CreditCard, Zap, Check, Info, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { createPaymentOrder } from '../../services/paymentService';

// Gói xu có sẵn
const COIN_PACKAGES = [
  { id: 1, coins: 50, price: 5000, bonus: 0, popular: false, description: 'Gói khởi đầu' },
  { id: 2, coins: 100, price: 10000, bonus: 5, popular: true, description: 'Phổ biến nhất' },
  { id: 3, coins: 500, price: 50000, bonus: 50, popular: false, description: 'Tiết kiệm 10%' },
  { id: 4, coins: 1000, price: 100000, bonus: 150, popular: false, description: 'Tiết kiệm 15%' },
  { id: 5, coins: 5000, price: 500000, bonus: 1000, popular: false, description: 'Tiết kiệm 20%' },
];

export default function RechargePage() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(COIN_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    try {
      setLoading(true);
      
      const response = await createPaymentOrder({
        coins: selectedPackage.coins,
        paymentMethod: paymentMethod,
      });
      
      console.log('Payment response:', response); // Debug log
      
      // Check if response has paymentUrl directly (new structure after apiClient change)
      if (response?.paymentUrl) {
        console.log('Redirecting to payment page:', response.paymentUrl);
        window.location.href = response.paymentUrl;
      }
      // Fallback: check old structure { success: true, data: { paymentUrl } }
      else if (response?.success && response.data?.paymentUrl) {
        console.log('Redirecting to payment page (old structure):', response.data.paymentUrl);
        window.location.href = response.data.paymentUrl;
      }
      // ZaloPay structure
      else if (response?.order_url) {
        console.log('Redirecting to ZaloPay:', response.order_url);
        window.location.href = response.order_url;
      }
      else {
        console.error('No payment URL in response:', response);
        toast.error('Không tìm thấy URL thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn thanh toán';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>
          
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Coins className="h-8 w-8 text-yellow-500" />
            Thanh toán & Hóa đơn
          </h1>
          <p className="text-gray-600 mt-2">
            Nạp xu vào tài khoản để sử dụng các tính năng cao cấp.
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-900">Bạn có thể sử dụng xu để:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
              <li>Đăng tin tuyển dụng - <strong>100 xu/tin</strong></li>
              <li>Làm nổi bật tin tuyển dụng - <strong>50 xu/ngày</strong></li>
              <li>Xem CV ứng viên chi tiết - <strong>20 xu/CV</strong></li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coin Packages */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-2">Chọn gói xu</h2>
              <p className="text-gray-600 mb-6">Chọn gói xu phù hợp với nhu cầu của bạn</p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {COIN_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative cursor-pointer transition-all rounded-lg p-6 border-2 ${
                      selectedPackage.id === pkg.id
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Phổ biến
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className="h-6 w-6 text-yellow-500" />
                      <span className="text-2xl font-bold">{pkg.coins}</span>
                      <span className="text-sm text-gray-500">xu</span>
                    </div>

                    {pkg.bonus > 0 && (
                      <div className="flex items-center gap-1 mb-3 text-green-600 text-sm font-medium">
                        <Zap className="h-4 w-4" />
                        <span>+{pkg.bonus} xu thưởng</span>
                      </div>
                    )}

                    <div className="text-lg font-semibold text-green-600 mb-2">
                      {formatCurrency(pkg.price)}
                    </div>

                    <p className="text-xs text-gray-500 mb-3">{pkg.description}</p>

                    {selectedPackage.id === pkg.id && (
                      <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" />
                        <span>Đã chọn</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
              
              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                <button
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'VNPAY'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('VNPAY')}
                >
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">VNPay</div>
                    <div className="text-xs text-gray-500">
                      Thẻ ATM, Visa, Mastercard
                    </div>
                  </div>
                  {paymentMethod === 'VNPAY' && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </button>

                <button
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'ZALOPAY'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('ZALOPAY')}
                >
                  <img 
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png" 
                    alt="ZaloPay"
                    className="h-6 w-6 object-contain"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">ZaloPay</div>
                    <div className="text-xs text-gray-500">
                      Ví điện tử ZaloPay
                    </div>
                  </div>
                  {paymentMethod === 'ZALOPAY' && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </button>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 mb-6">
                <h3 className="font-semibold mb-3">Chi tiết đơn hàng</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số xu</span>
                    <span className="font-medium">{selectedPackage.coins} xu</span>
                  </div>
                  
                  {selectedPackage.bonus > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Xu thưởng</span>
                      <span className="font-medium">+{selectedPackage.bonus} xu</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Tổng xu nhận được</span>
                    <span className="font-bold text-lg text-yellow-600">
                      {selectedPackage.coins + selectedPackage.bonus} xu
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                    <span>Thanh toán</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedPackage.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRecharge}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Thanh toán ngay
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Bằng cách nhấn "Thanh toán ngay", bạn đồng ý với{' '}
                <a href="#" className="text-green-600 hover:underline">
                  Điều khoản dịch vụ
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
