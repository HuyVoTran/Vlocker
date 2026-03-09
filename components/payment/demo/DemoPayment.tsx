import { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { MyLockerItem } from '@/components/dashboard/MyLockers';

export default function DemoPayment({
  lockerItem,
  amount,
  usageTime,
  onSuccess,
}: {
  lockerItem: MyLockerItem;
  amount: number;
  usageTime: string;
  onSuccess: () => Promise<void> | void;
}) {
  const [method, setMethod] = useState<'momo' | 'paypal' | 'vnpay'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const methodLabel = useMemo(() => {
    if (method === 'paypal') return 'PayPal';
    if (method === 'vnpay') return 'VNPay';
    return 'MoMo';
  }, [method]);

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handlePay = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Thanh toán thành công</DialogTitle>
          <DialogDescription>Payment successful. Locker is opening.</DialogDescription>
        </DialogHeader>
        <Card className="p-4">
          <p className="text-gray-700">Tủ đang được mở.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Thanh toán trả tủ (Demo)</DialogTitle>
        <DialogDescription>Xác nhận thông tin trước khi thanh toán</DialogDescription>
      </DialogHeader>
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tủ</span>
          <span className="text-gray-900">{lockerItem.locker?.lockerId ?? 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Thời gian sử dụng</span>
          <span className="text-gray-900">{usageTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tổng tiền</span>
          <span className="text-blue-600 font-semibold">{amount.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Phương thức</span>
          <span className="text-gray-900">{methodLabel}</span>
        </div>
      </Card>
      <Card className="p-4 space-y-3">
        <p className="text-sm text-gray-500">Chọn phương thức thanh toán</p>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={method === 'momo' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setMethod('momo')}
          >
            MoMo
          </Button>
          <Button
            variant={method === 'paypal' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setMethod('paypal')}
          >
            PayPal
          </Button>
          <Button
            variant={method === 'vnpay' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setMethod('vnpay')}
          >
            VNPay
          </Button>
        </div>
      </Card>
      <Button className="w-full" onClick={handlePay} disabled={isProcessing}>
        <CreditCard className="w-4 h-4 mr-2" />
        {isProcessing ? 'Đang xử lý thanh toán...' : `Pay with ${methodLabel}`}
      </Button>
    </div>
  );
}
