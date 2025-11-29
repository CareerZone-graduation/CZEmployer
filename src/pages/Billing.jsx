import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayment } from '@/hooks/usePayment';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';
import { CreditCard, History } from 'lucide-react';
import CreditHistory from '@/components/billing/CreditHistory';
import RechargeHistory from '@/components/billing/RechargeHistory';

const coinPackages = [
  { amount: 50, price: 5000, popular: false },
  { amount: 100, price: 10000, popular: false },
  { amount: 200, price: 20000, popular: false },
  { amount: 500, price: 50000, popular: true },
  { amount: 1000, price: 100000, popular: false },
  { amount: 2000, price: 200000, popular: false },
];

const BillingPage = () => {
  const { user } = useSelector((state) => state.auth);
  const coinBalance = user?.user?.coinBalance ?? 0;
  const [selectedOption, setSelectedOption] = useState(coinPackages.find(p => p.popular).amount);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ZALOPAY');
  const { isProcessing, handlePayment } = usePayment();

  const getPackageDetails = () => {
    if (selectedOption === 'custom') {
      const amount = parseInt(customAmount, 10);
      if (!isNaN(amount) && amount > 0) {
        return { amount, price: amount * 100 };
      }
      return { amount: 0, price: 0 };
    }
    return coinPackages.find(p => p.amount === selectedOption);
  };

  const selectedPackage = getPackageDetails();
  const finalAmount = selectedPackage?.amount || 0;

  const handleSubmit = () => {
    console.log('🔵 handleSubmit called');
    console.log('🔵 finalAmount:', finalAmount);
    console.log('🔵 paymentMethod:', paymentMethod);
    console.log('🔵 Calling handlePayment with:', { coins: finalAmount, paymentMethod });

    if (finalAmount > 0) {
      handlePayment({ coins: finalAmount, paymentMethod });
    } else {
      console.error('❌ finalAmount is 0 or invalid:', finalAmount);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Thanh toán & Hóa đơn</CardTitle>
              <CardDescription>Nạp xu vào tài khoản để sử dụng các tính năng cao cấp.</CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">Số dư hiện tại</span>
              <span className="text-2xl font-bold text-yellow-600">{formatCurrency(coinBalance).replace('₫', 'Xu')}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="recharge" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="recharge" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Nạp Xu
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử giao dịch
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recharge">
              {/* Usage Information Banner */}
              <div className="pb-6">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-lg">
                      ℹ️
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-2">Bạn có thể sử dụng xu để:</h4>
                      <ul className="text-sm text-blue-800 space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong>Đăng tin tuyển dụng</strong> - 100 xu/tin</span>
                        </li>
                        {/* <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong>Xem thông tin ứng viên</strong> - Chi phí tùy theo gói</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong>Mở khóa CV</strong> - Truy cập hồ sơ chi tiết ứng viên</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong>Các tính năng cao cấp khác</strong></span>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Coin Packages */}
                <div className="md:col-span-2 space-y-4">
                  <Label className="text-lg font-semibold">Chọn gói xu</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {coinPackages.map((pkg) => (
                      <div
                        key={pkg.amount}
                        className={cn(
                          "relative rounded-lg border p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-28",
                          selectedOption === pkg.amount ? "border-primary ring-2 ring-primary" : "hover:border-gray-400"
                        )}
                        onClick={() => setSelectedOption(pkg.amount)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold rounded-full">
                            Phổ biến
                          </div>
                        )}
                        <div className="text-2xl font-bold">{pkg.amount} xu</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(pkg.price)}</div>
                      </div>
                    ))}
                    {/* Custom Amount Option */}
                    <div
                      className={cn(
                        "relative rounded-lg border p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-28",
                        selectedOption === 'custom' ? "border-primary ring-2 ring-primary" : "hover:border-gray-400"
                      )}
                      onClick={() => setSelectedOption('custom')}
                    >
                      <div className="text-lg font-semibold">Tùy chỉnh</div>
                      <div className="text-sm text-muted-foreground">Nhập số xu</div>
                    </div>
                  </div>
                  {selectedOption === 'custom' && (
                    <div className="pt-4">
                      <Label htmlFor="custom-amount">Nhập số xu bạn muốn nạp</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Ví dụ: 150"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="mt-2"
                        min="1"
                      />
                    </div>
                  )}

                  {/* Usage Suggestion */}
                  {finalAmount > 0 && (
                    <div className="pt-2 text-center text-sm text-muted-foreground italic">
                      {`Với ${finalAmount} xu, bạn có thể đăng được ${Math.floor(finalAmount / 100)} tin tuyển dụng.`}
                    </div>
                  )}
                </div>

                {/* Right Column: Payment Method & Summary */}
                <div className="md:col-span-1 space-y-6">
                  {/* Payment Method */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Chọn phương thức thanh toán</Label>
                    <RadioGroup
                      defaultValue="ZALOPAY"
                      className="mt-2 flex flex-col gap-4"
                      onValueChange={setPaymentMethod}
                      value={paymentMethod}
                    >
                      <Label htmlFor="ZALOPAY" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-gray-400">
                        <RadioGroupItem value="ZALOPAY" id="ZALOPAY" />
                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="h-8 w-8" />
                        <span>ZaloPay</span>
                      </Label>
                      <Label htmlFor="VNPAY" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-gray-400">
                        <RadioGroupItem value="VNPAY" id="VNPAY" />
                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPAY" className="h-8 w-8" />
                        <span>VNPAY</span>
                      </Label>
                      <Label htmlFor="MOMO" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-gray-400">
                        <RadioGroupItem value="MOMO" id="MOMO" />
                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" alt="MoMo" className="h-8 w-8" />
                        <span>MoMo</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {/* Payment Summary */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">Tổng thanh toán</div>
                    <div className="text-3xl font-bold text-primary">
                      {selectedPackage ? formatCurrency(selectedPackage.price) : '0 VNĐ'}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button onClick={handleSubmit} disabled={isProcessing || finalAmount <= 0} size="lg" className="w-full">
                    {isProcessing ? 'Đang xử lý...' : `Thanh toán với ${paymentMethod}`}
                  </Button>
                </div>
              </div>

              <RechargeHistory />
            </TabsContent>

            <TabsContent value="history">
              <CreditHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default BillingPage;