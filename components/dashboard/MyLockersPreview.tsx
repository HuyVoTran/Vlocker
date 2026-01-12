'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Package, Clock, CreditCard, Unlock, Lock, XCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/toast-context';

// Interfaces (có thể chuyển ra file riêng nếu dùng ở nhiều nơi)
export interface Locker {
  _id: string;
  lockerId: string;
  building: string;
  block: string;
  status: string;
  floor?: string | number;
  size?: string;
  price?: string | number;
}

export interface Booking {
  _id: string;
  userId: string;
  lockerId: string;
  startTime?: string | Date;
  endTime?: string | Date;
  pickupExpiryTime?: string | Date;
  status?: string;
  cost?: number;
  paymentStatus?: string;
}

export interface MyLockerItem {
  locker: Locker;
  booking: Booking;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as Error & { info?: unknown; status?: number };
    try { error.info = await res.json(); } catch { /* ignore */ }
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API returned an error");
  return json.data;
};

interface MyLockersPreviewProps {
  onNavigate: (page: string) => void;
}

export default function MyLockersPreview({ onNavigate }: MyLockersPreviewProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { data: myLockers = [], error, isLoading, mutate: mutateMyLockers } = useSWR<MyLockerItem[]>(
    `/api/lockers/resident/mylocker`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [selectedMyLocker, setSelectedMyLocker] = useState<MyLockerItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMyLockersUpdate = (event: CustomEvent<MyLockerItem>) => {
      const newLockerItem = event.detail;
      if (newLockerItem) {
        mutateMyLockers((currentData = []) => [...currentData, newLockerItem], false);
        showToast(`Đã thêm tủ ${newLockerItem.locker.lockerId} vào danh sách của bạn!`, 'info');
      }
    };
    window.addEventListener('myLockersUpdated', handleMyLockersUpdate as EventListener);
    return () => window.removeEventListener('myLockersUpdated', handleMyLockersUpdate as EventListener);
  }, [mutateMyLockers, showToast]);

  const sortedMyLockers = useMemo(() => {
    const getSortPriority = (item: MyLockerItem) => {
      if (item.booking.status === 'stored' && item.booking.paymentStatus === 'paid') return 1;
      if (item.booking.status === 'stored' && item.booking.paymentStatus === 'pending') return 2;
      if (item.booking.status === 'active') return 3;
      return 4;
    };
    return [...myLockers].sort((a, b) => getSortPriority(a) - getSortPriority(b));
  }, [myLockers]);

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(date);
    }
  };

  const calculateCost = (item: MyLockerItem): number => {
    const { booking, locker } = item;
    const dailyRate = Number(locker?.price) || 10000;
    if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.cost && booking.cost > 0) return booking.cost;
    if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
      const daysDiff = Math.ceil((new Date().getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, daysDiff) * dailyRate;
    }
    return booking.cost || 0;
  };

  const getRemainingPickupTime = (booking: Booking): number | null => {
    if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.pickupExpiryTime) {
      const diffMinutes = Math.ceil((new Date(booking.pickupExpiryTime).getTime() - currentTime.getTime()) / (1000 * 60));
      return diffMinutes > 0 ? diffMinutes : 0;
    }
    return null;
  };

  const formatRemainingTime = (minutes: number | null): string => {
    if (minutes === null) return '';
    if (minutes <= 0) return 'Đã hết hạn';
    if (minutes < 60) return `Còn ${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `Còn ${hours} giờ ${mins} phút`;
  };

  const handleApiCall = async (endpoint: string, body: object, successMessage: string, errorMessage: string, revalidate = true) => {
    setActionLoading(endpoint);
    try {
      const res = await fetch(`/api/lockers/resident/${endpoint}`, {
        method: endpoint === 'cancel' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.message?.includes('hết hạn')) mutateMyLockers();
        throw new Error(json.message || errorMessage);
      }
      showToast(successMessage, 'success');
      if (revalidate) mutateMyLockers();
      return json;
    } catch (err) {
      showToast(err instanceof Error ? err.message : errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpen = () => handleApiCall('open', { bookingId: selectedMyLocker!.booking._id }, 'Tủ đã được mở thành công!', 'Lỗi mở tủ');
  const handleLock = async () => {
    await handleApiCall('lock', { bookingId: selectedMyLocker!.booking._id }, 'Khóa tủ thành công!', 'Lỗi khóa tủ');
    setSelectedMyLocker(null);
  };
  const handlePayment = async () => {
    await handleApiCall('payment', { bookingId: selectedMyLocker!.booking._id, paymentMethod: 'virtual' }, 'Thanh toán thành công!', 'Lỗi thanh toán');
    setSelectedMyLocker(null);
  };
  const handleCancel = async () => {
    const result = await handleApiCall('cancel', { bookingId: selectedMyLocker!.booking._id }, 'Hủy lượt đặt thành công!', 'Lỗi hủy lượt đặt');
    if (result) {
      window.dispatchEvent(new CustomEvent('availableLockersUpdated'));
      setSelectedMyLocker(null);
      setIsCancelDialogOpen(false);
    }
  };

  if (isLoading) return <p className="text-gray-500 col-span-3">Đang tải danh sách tủ của bạn...</p>;
  if (error) return <p className="text-red-500 col-span-3">Lỗi: {error.message}</p>;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900">Tủ của tôi</h2>
            <p className="text-sm text-gray-500">Xem các tủ đang thuê hoặc đang sử dụng</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate('my-lockers')}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {myLockers.length > 0 ? (
            sortedMyLockers.slice(0, 3).map((mylocker) => (
              <Card key={mylocker.booking._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <p className="text-gray-900">Tủ {mylocker.locker?.lockerId || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Tòa {mylocker.locker?.building || 'N/A'} - Block {mylocker.locker?.block || 'N/A'}</p>
                    </div>
                  </div>
                  {mylocker.booking.status === 'active' ? <Badge className="bg-gray-100 text-gray-700">Đang thuê</Badge>
                    : mylocker.booking.paymentStatus === 'pending' ? <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
                    : <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {mylocker.booking.status === 'active' ? 'Chưa tính tiền'
                        : mylocker.booking.paymentStatus === 'pending' ? 'Chờ thanh toán'
                        : 'Đã thanh toán'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{calculateCost(mylocker).toLocaleString()}đ</span>
                  </div>
                </div>
                <Button className="w-full" variant="default" onClick={() => setSelectedMyLocker(mylocker)}>
                  {mylocker.booking.status === 'active' ? 'Chi tiết'
                    : mylocker.booking.paymentStatus === 'pending' ? 'Thanh toán ngay'
                    : 'Mở tủ'}
                </Button>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 col-span-3">Bạn chưa có tủ nào</p>
          )}
        </div>
      </div>
      
      <Dialog open={!!selectedMyLocker} onOpenChange={(open) => !open && setSelectedMyLocker(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết tủ {selectedMyLocker?.locker?.lockerId ?? ''}</DialogTitle>
            <DialogDescription>Thông tin chi tiết và các tùy chọn cho tủ của bạn</DialogDescription>
          </DialogHeader>
          {selectedMyLocker && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Mã tủ</p><p className="text-gray-900">{selectedMyLocker.locker?.lockerId ?? 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Tòa</p><p className="text-gray-900">{selectedMyLocker.locker?.building ?? 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Block</p><p className="text-gray-900">{selectedMyLocker.locker?.block ?? 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Trạng thái đặt</p><p className="text-gray-900">{selectedMyLocker.booking?.status === 'active' ? 'Chưa dùng' : 'Đã dùng'}</p></div>
                <div><p className="text-sm text-gray-500">Thời gian bắt đầu</p><p className="text-gray-900">{formatDate(selectedMyLocker.booking?.startTime)}</p></div>
                <div><p className="text-sm text-gray-500">Thời gian kết thúc</p><p className="text-gray-900">{formatDate(selectedMyLocker.booking?.endTime)}</p></div>
                {selectedMyLocker.booking?.status === 'stored' && selectedMyLocker.booking?.paymentStatus === 'paid' && (
                  <div>
                    <p className="text-sm text-gray-500">Thời gian lấy đồ còn lại</p>
                    <p className={`font-semibold ${getRemainingPickupTime(selectedMyLocker.booking)! <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatRemainingTime(getRemainingPickupTime(selectedMyLocker.booking))}
                    </p>
                  </div>
                )}
                <div><p className="text-sm text-gray-500">Số tiền</p><p className="text-blue-600">{calculateCost(selectedMyLocker).toLocaleString()}đ</p></div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                  {selectedMyLocker.booking?.paymentStatus === 'paid' ? <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>
                    : selectedMyLocker.booking?.status === 'stored' ? <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
                    : <Badge className="bg-gray-100 text-gray-700">Không có</Badge>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-col gap-2">
            {selectedMyLocker?.booking?.status === 'active' ? (
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleOpen} disabled={!!actionLoading}><Unlock className="w-4 h-4 mr-2" />{actionLoading === 'open' ? 'Đang mở...' : 'Mở tủ'}</Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleLock} disabled={!!actionLoading}><Lock className="w-4 h-4 mr-2" />{actionLoading === 'lock' ? 'Đang khóa...' : 'Khóa tủ'}</Button>
                <Button variant="destructive" className="w-full" onClick={() => setIsCancelDialogOpen(true)} disabled={!!actionLoading}><XCircle className="w-4 h-4 mr-2" />Hủy tủ</Button>
                <Button variant="outline" className="w-full" onClick={() => router.push(`/resident/report?lockerId=${selectedMyLocker.locker.lockerId}&locker_id=${selectedMyLocker.locker._id}`)} disabled={!!actionLoading}>Báo Cáo Lỗi</Button>
              </div>
            ) : selectedMyLocker?.booking?.status === 'stored' && (
              <>
                {selectedMyLocker.booking?.paymentStatus === 'pending' ? (
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700" onClick={handlePayment} disabled={!!actionLoading}><CreditCard className="w-4 h-4 mr-2" />{actionLoading === 'payment' ? 'Đang xử lý...' : 'Thanh toán (Tạm thanh toán ảo)'}</Button>
                ) : (
                  getRemainingPickupTime(selectedMyLocker.booking)! <= 0 ? (
                    <Button className="w-full bg-gray-400 cursor-not-allowed" disabled><Unlock className="w-4 h-4 mr-2" />Đã hết hạn lấy đồ</Button>
                  ) : (
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleOpen} disabled={!!actionLoading}><Unlock className="w-4 h-4 mr-2" />{actionLoading === 'open' ? 'Đang mở...' : 'Mở tủ'}</Button>
                  )
                )}
                <Button variant="outline" className="w-full" onClick={() => router.push(`/resident/report?lockerId=${selectedMyLocker.locker.lockerId}&locker_id=${selectedMyLocker.locker._id}`)} disabled={!!actionLoading}>Báo Cáo Lỗi</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy lượt đặt</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn hủy lượt đặt cho tủ {selectedMyLocker?.locker?.lockerId}? Thao tác này sẽ giải phóng tủ và không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={actionLoading === 'cancel'}>Không</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading === 'cancel'}>{actionLoading === 'cancel' ? 'Đang hủy...' : 'Có, hủy tủ'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
