import { Package, Clock, CreditCard, Unlock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from 'react';

export default function MyLockers() {
  const [selectedLocker, setSelectedLocker] = useState<any>(null);

  const lockers = [
    {
      id: 'L001',
      location: 'Tòa A - Tầng 1',
      block: 'A1',
      timeUsed: '2 tháng 15 ngày',
      timeRemaining: '15 ngày',
      status: 'active',
      price: '50,000đ',
      isPaid: true,
      size: 'Nhỏ (30x30x40cm)'
    },
    {
      id: 'L045',
      location: 'Tòa B - Tầng 2',
      block: 'B2',
      timeUsed: '1 tháng 7 ngày',
      timeRemaining: '7 ngày',
      status: 'active',
      price: '70,000đ',
      isPaid: true,
      size: 'Vừa (40x40x60cm)'
    },
    {
      id: 'L089',
      location: 'Tòa A - Tầng 3',
      block: 'A3',
      timeUsed: '3 tháng',
      timeRemaining: 'Hết hạn',
      status: 'pending',
      price: '50,000đ',
      isPaid: false,
      size: 'Nhỏ (30x30x40cm)'
    },
    {
      id: 'L112',
      location: 'Tòa C - Tầng 1',
      block: 'C1',
      timeUsed: '20 ngày',
      timeRemaining: '10 ngày',
      status: 'active',
      price: '100,000đ',
      isPaid: true,
      size: 'Lớn (50x50x80cm)'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Tủ của tôi</h1>
        <p className="text-gray-600">Quản lý tất cả các tủ bạn đang sử dụng</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lockers.map((locker) => (
          <Card key={locker.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  locker.status === 'active' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  <Package className={`w-6 h-6 ${
                    locker.status === 'active' ? 'text-blue-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <p className="text-gray-900">Tủ {locker.id}</p>
                  <p className="text-sm text-gray-500">{locker.location}</p>
                </div>
              </div>
              {locker.status === 'active' ? (
                <Badge className="bg-green-100 text-green-700">Đang sử dụng</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Kích thước</span>
                <span className="text-gray-900">{locker.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Block/Tòa</span>
                <span className="text-gray-900">{locker.block}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Còn lại: {locker.timeRemaining}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{locker.price}</span>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  variant={locker.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => setSelectedLocker(locker)}
                >
                  {locker.status === 'pending' ? 'Thanh toán ngay' : 'Chi tiết'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Chi tiết tủ {locker.id}</DialogTitle>
                  <DialogDescription>
                    Thông tin chi tiết và các tùy chọn cho tủ của bạn
                  </DialogDescription>
                </DialogHeader>
                
                {selectedLocker && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Mã tủ</p>
                        <p className="text-gray-900">{selectedLocker.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Vị trí</p>
                        <p className="text-gray-900">{selectedLocker.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kích thước</p>
                        <p className="text-gray-900">{selectedLocker.size}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Block/Tòa</p>
                        <p className="text-gray-900">{selectedLocker.block}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian đã dùng</p>
                        <p className="text-gray-900">{selectedLocker.timeUsed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Còn lại</p>
                        <p className="text-gray-900">{selectedLocker.timeRemaining}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số tiền</p>
                        <p className="text-blue-600">{selectedLocker.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                        {selectedLocker.isPaid ? (
                          <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Chưa thanh toán</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="flex-col sm:flex-col gap-2">
                  {selectedLocker && !selectedLocker.isPaid && (
                    <Button className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Thanh toán
                    </Button>
                  )}
                  {selectedLocker && selectedLocker.isPaid && (
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Unlock className="w-4 h-4 mr-2" />
                      Mở tủ
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    Gia hạn tủ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
    </div>
  );
}
