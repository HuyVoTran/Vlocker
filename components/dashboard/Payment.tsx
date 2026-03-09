'use client';
import { CreditCard, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '../ui/toast-context';

export default function Payment() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const amountParam = searchParams?.get('amount');
  const orderInfoParam = searchParams?.get('orderInfo');

  const [amount] = useState<number>(() => {
    const parsed = Number(amountParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000;
  });
  const [orderInfo] = useState<string>(() => orderInfoParam || 'Thanh toán thuê tủ');
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/payment/momo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderInfo }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.payUrl) {
        throw new Error(json.message || 'Không thể tạo thanh toán MoMo.');
      }
      window.location.href = json.payUrl as string;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi.', 'error');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Thanh toán MoMo</h1>
        <p className="text-gray-600">Xác nhận thông tin và thực hiện thanh toán</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Thông tin thanh toán</h3>
              <p className="text-sm text-gray-500">Kiểm tra trước khi chuyển đến MoMo</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="amount">Số tiền</Label>
              <Input
                id="amount"
                value={`${amount.toLocaleString('vi-VN')} VNĐ`}
                readOnly
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="orderInfo">Thông tin đơn hàng</Label>
              <Input
                id="orderInfo"
                value={orderInfo}
                readOnly
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handlePay} disabled={isPaying}>
                <CreditCard className="w-4 h-4 mr-2" />
                {isPaying ? 'Đang chuyển đến MoMo...' : 'Pay with MoMo'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-gray-900 mb-4">Hướng dẫn</h4>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-900 mb-1">🔐 Bảo mật</p>
              <p className="text-gray-600">Bạn sẽ được chuyển đến cổng MoMo để thanh toán an toàn.</p>
            </div>
            <div>
              <p className="text-gray-900 mb-1">📄 Xác nhận</p>
              <p className="text-gray-600">Kiểm tra lại số tiền và thông tin đơn hàng trước khi thanh toán.</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-900 mb-2">💡 Lưu ý</p>
            <p className="text-sm text-blue-700">Sau khi thanh toán, hệ thống sẽ cập nhật trạng thái tự động.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
