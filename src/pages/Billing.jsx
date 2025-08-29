import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/usePayment';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';

const coinPackages = [
  { amount: 50, price: 50000, popular: false },
  { amount: 100, price: 100000, popular: false },
  { amount: 200, price: 200000, popular: false },
  { amount: 500, price: 500000, popular: true },
  { amount: 1040, price: 1000000, popular: false },
  { amount: 2100, price: 2000000, popular: false },
];

const BillingPage = () => {
  const [selectedCoins, setSelectedCoins] = useState(coinPackages.find(p => p.popular).amount);
  const [paymentMethod, setPaymentMethod] = useState('ZALOPAY');
  const { isProcessing, handlePayment } = usePayment();

  const selectedPackage = coinPackages.find(p => p.amount === selectedCoins);

  const handleSubmit = () => {
    handlePayment({ coins: selectedCoins, paymentMethod });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán & Hóa đơn</CardTitle>
          <CardDescription>Nạp xu vào tài khoản để sử dụng các tính năng cao cấp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Coin Packages */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Chọn gói xu</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {coinPackages.map((pkg) => (
                <div
                  key={pkg.amount}
                  className={cn(
                    "relative rounded-lg border p-4 flex flex-col items-center justify-center cursor-pointer transition-all",
                    selectedCoins === pkg.amount ? "border-primary ring-2 ring-primary" : "hover:border-gray-400"
                  )}
                  onClick={() => setSelectedCoins(pkg.amount)}
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
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Chọn phương thức thanh toán</Label>
            <RadioGroup
              defaultValue="ZALOPAY"
              className="mt-2 flex gap-8"
              onValueChange={setPaymentMethod}
              value={paymentMethod}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ZALOPAY" id="ZALOPAY" />
                <Label htmlFor="ZALOPAY" className="flex items-center gap-2">
                  <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="h-6 w-6" />
                  <span>ZaloPay</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VNPAY" id="VNPAY" />
                <Label htmlFor="VNPAY" className="flex items-center gap-2">
                   <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPAY" className="h-6 w-6" />
                  <span>VNPAY</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-end gap-4">
            <div className="text-right">
                <div className="text-muted-foreground">Tổng thanh toán</div>
                <div className="text-2xl font-bold text-primary">
                    {selectedPackage ? formatCurrency(selectedPackage.price) : formatCurrency(0)}
                </div>
            </div>
          <Button onClick={handleSubmit} disabled={isProcessing} size="lg" className="w-full md:w-auto">
            {isProcessing ? 'Đang xử lý...' : `Thanh toán với ${paymentMethod}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BillingPage;