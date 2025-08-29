import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePayment } from '@/hooks/usePayment';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';

const coinPackages = [
  { amount: 50, price: 5000, popular: false },
  { amount: 100, price: 10000, popular: false },
  { amount: 200, price: 20000, popular: false },
  { amount: 500, price: 50000, popular: true },
  { amount: 1000, price: 100000, popular: false },
  { amount: 2000, price: 200000, popular: false },
];

const BillingPage = () => {
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
    if (finalAmount > 0) {
      handlePayment({ coins: finalAmount, paymentMethod });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Thanh toán & Hóa đơn</CardTitle>
          <CardDescription>Nạp xu vào tài khoản để sử dụng các tính năng cao cấp.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-8 pt-6">
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
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default BillingPage;