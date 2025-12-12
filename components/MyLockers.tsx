import { Package, Clock, CreditCard, Unlock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from 'react';

export interface Locker {
  _id?: string;
  lockerId: string;
  building?: string;
  block?: string;
  status?: string;
}

export interface Booking {
  _id: string;
  userId: string;
  lockerId: string;
  startTime?: string | Date;
  endTime?: string | Date;
  status?: string;
  cost?: number;
  paymentStatus?: string;
}

interface MyLockerItem {
  locker: Locker;
  booking: Booking;
}

interface MyLockersProps {
  myLockers: MyLockerItem[];
  onNavigate?: (page: string, locker?: MyLockerItem) => void;
}

export default function MyLockers({ myLockers, onNavigate }: MyLockersProps) {
  const [selectedLocker, setSelectedLocker] = useState<MyLockerItem | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Tủ của tôi</h1>
        <p className="text-gray-600">Quản lý tất cả các tủ bạn đang sử dụng</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {myLockers && myLockers.length > 0 ? (
          myLockers.map((mylocker) => (
            <Card key={mylocker.booking._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">Tủ {mylocker.locker?.lockerId || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Tòa {mylocker.locker?.building || 'N/A'} - Block {mylocker.locker?.block || 'N/A'}</p>
                  </div>
                </div>
                {mylocker.booking.status === 'stored' ? (
                  <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700">Đang thuê</Badge>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{mylocker.booking.paymentStatus || ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{(mylocker.booking.cost || 0).toLocaleString()}đ</span>
                </div>
              </div>
              {mylocker.booking.paymentStatus === 'pending' ? (
                <Button className="w-full" variant="default" onClick={() => onNavigate?.('payment', mylocker)}>
                  Thanh toán ngay
                </Button>
              ) : (
                <Button className="w-full" variant="outline" onClick={() => { setSelectedLocker(mylocker); onNavigate?.('my-locker', mylocker); }}>
                  Chi tiết
                </Button>
              )}
            </Card>
          ))
        ) : (
          <p className="text-gray-500 col-span-3">Bạn chưa có tủ nào</p>
        )}
      </div>
    </div>
  );
}
