import { CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { MyLockerItem } from '@/components/dashboard/MyLockers';

export function RealLockerPaymentCard({
  lockerItem,
  amount,
  usageTime,
  paymentMethod,
  onPaymentMethodChange,
  isPaying,
  onPay,
}: {
  lockerItem: MyLockerItem;
  amount: number;
  usageTime: string;
  paymentMethod: 'momo' | 'paypal' | 'vnpay';
  onPaymentMethodChange: (method: 'momo' | 'paypal' | 'vnpay') => void;
  isPaying: boolean;
  onPay: () => void;
}) {
  const payLabel = paymentMethod === 'paypal'
    ? 'Pay with PayPal'
    : paymentMethod === 'vnpay'
      ? 'Pay with VNPay'
      : 'Pay with MoMo';

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Thanh toán trả tủ</DialogTitle>
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
          <span className="text-gray-900">
            {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'vnpay' ? 'VNPay' : 'MoMo'}
          </span>
        </div>
      </Card>
      <RealPaymentMethodSelector value={paymentMethod} onChange={onPaymentMethodChange} />
      <Button className="w-full" onClick={onPay} disabled={isPaying}>
        <CreditCard className="w-4 h-4 mr-2" />
        {isPaying ? 'Đang chuyển đến cổng thanh toán...' : payLabel}
      </Button>
    </div>
  );
}

export function RealPaymentMethodSelector({
  value,
  onChange,
}: {
  value: 'momo' | 'paypal' | 'vnpay';
  onChange: (method: 'momo' | 'paypal' | 'vnpay') => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <p className="text-sm text-gray-500">Chọn phương thức thanh toán</p>
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={value === 'momo' ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onChange('momo')}
        >
          MoMo
        </Button>
        <Button
          variant={value === 'paypal' ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onChange('paypal')}
        >
          PayPal
        </Button>
        <Button
          variant={value === 'vnpay' ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onChange('vnpay')}
        >
          VNPay
        </Button>
      </div>
    </Card>
  );
}

export function RealPaymentSuccessState({ isProcessing }: { isProcessing: boolean }) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Thanh toán thành công</DialogTitle>
        <DialogDescription>Payment successful. Locker is opening.</DialogDescription>
      </DialogHeader>
      <Card className="p-4">
        <p className="text-gray-700">{isProcessing ? 'Đang cập nhật trạng thái tủ...' : 'Tủ đang được mở.'}</p>
      </Card>
    </div>
  );
}
