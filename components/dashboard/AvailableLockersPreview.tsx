'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Package, Plus, MapPin, CreditCard } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/toast-context';
import { Locker, MyLockerItem } from './MyLockersPreview';

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

const formatSize = (size?: string) => {
  if (!size) return 'N/A';
  switch (size) {
    case 'S': return 'Small - Nhỏ';
    case 'M': return 'Medium - Trung bình';
    case 'L': return 'Large - Lớn';
    case 'XL': return 'Extra Large - Rất lớn';
    default: return size;
  }
};

interface AvailableLockersPreviewProps {
  onNavigate: (page: string) => void;
}

export default function AvailableLockersPreview({ onNavigate }: AvailableLockersPreviewProps) {
  const { showToast } = useToast();
  const { data: availableLockers = [], error, isLoading, mutate: mutateAvailableLockers } = useSWR<Locker[]>(
    `/api/lockers/resident/available`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [selectedAvailableLocker, setSelectedAvailableLocker] = useState<Locker | null>(null);
  const [registering, setRegistering] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => mutateAvailableLockers();
    window.addEventListener('availableLockersUpdated', handleUpdate);
    return () => window.removeEventListener('availableLockersUpdated', handleUpdate);
  }, [mutateAvailableLockers]);

  useEffect(() => {
    const eventSource = new EventSource('/api/lockers/stream');
    const handleEvent = () => mutateAvailableLockers();
    eventSource.addEventListener('locker', handleEvent as EventListener);
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [mutateAvailableLockers]);

  const handleRegister = async () => {
    if (!selectedAvailableLocker) return;
    setRegistering(true);
    try {
      const res = await fetch('/api/lockers/resident/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockerId: selectedAvailableLocker._id })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || `Server error (${res.status})`);
      }
      showToast('Đăng ký tủ thành công!', 'success');
      
      const newMyLockerItem = json.data as MyLockerItem;
      
      mutateAvailableLockers(
        (currentLockers = []) => currentLockers.filter(l => l._id !== selectedAvailableLocker._id),
        false
      );
      
      window.dispatchEvent(new CustomEvent('myLockersUpdated', { detail: newMyLockerItem }));

      setSelectedAvailableLocker(null);
    } catch (err) {
      console.error('Register error', err);
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setRegistering(false);
    }
  };

  if (isLoading) return <p className="text-gray-500 col-span-3">Đang tải danh sách tủ trống...</p>;
  if (error) return <p className="text-red-500 col-span-3">Lỗi: {error.message}</p>;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900">Tủ trống gợi ý</h2>
            <p className="text-sm text-gray-500">Đăng ký nhanh các tủ đang trống</p>
          </div>
          <Button onClick={() => onNavigate('register-locker')}>
            <Plus className="w-4 h-4 mr-2" />
            Đăng ký tủ mới
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableLockers.length > 0 ? (
            availableLockers.slice(0, 3).map((locker) => (
              <Card key={locker._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-gray-600" /></div>
                    <div>
                      <p className="text-gray-900">Tủ {locker.lockerId}</p>
                      <p className="text-xs text-gray-500">Block {locker.block}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Trống</Badge>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /><div><p className="text-sm text-gray-600">Tòa {locker.building}</p><p className="text-xs text-gray-500">Block {locker.block}</p></div></div>
                  <div className="flex items-start gap-2"><CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /><div><p className="text-sm text-gray-600">{(Number(locker.price) || 10000).toLocaleString('vi-VN')} VNĐ/Ngày</p></div></div>
                </div>
                <Button className="w-full" onClick={() => setSelectedAvailableLocker(locker)}>Thuê tủ ngay</Button>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center col-span-full">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 mb-2">Không tìm thấy tủ trống</p>
              <p className="text-gray-500">Tất cả các tủ trong khu vực của bạn hiện đã được đặt</p>
            </Card>
          )}
        </div>
      </div>
      <Dialog open={!!selectedAvailableLocker} onOpenChange={(open) => !open && setSelectedAvailableLocker(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng ký tủ {selectedAvailableLocker?.lockerId ?? ''}</DialogTitle>
            <DialogDescription>Xem lại thông tin trước khi xác nhận thuê</DialogDescription>
          </DialogHeader>
          {selectedAvailableLocker && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Mã tủ</p><p className="text-gray-900">{selectedAvailableLocker.lockerId}</p></div>
                <div><p className="text-sm text-gray-500">Tòa</p><p className="text-gray-900">{selectedAvailableLocker.building}</p></div>
                <div><p className="text-sm text-gray-500">Block</p><p className="text-gray-900">{selectedAvailableLocker.block}</p></div>
                <div><p className="text-sm text-gray-500">Tầng</p><p className="text-gray-900">{selectedAvailableLocker.floor ?? '1'}</p></div>
                <div><p className="text-sm text-gray-500">Kích thước</p><p className="text-gray-900">{formatSize(selectedAvailableLocker.size)}</p></div>
                <div><p className="text-sm text-gray-500">Giá</p><p className="text-blue-600">{selectedAvailableLocker.price ? `${Number(selectedAvailableLocker.price).toLocaleString('vi-VN')} VNĐ/Ngày` : '10,000 VNĐ/Ngày'}</p></div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full" disabled={registering} onClick={handleRegister}>{registering ? 'Đang xử lý...' : 'Xác nhận thuê'}</Button>
            <Button variant="outline" className="w-full" onClick={() => setSelectedAvailableLocker(null)}>Hủy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
