'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Package, MapPin, DollarSign, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useSession } from 'next-auth/react';
import { useToast } from '../ui/toast-context';

export interface Locker {
  _id: string;
  lockerId: string;
  building: string;
  block: string;
  status: string;
  floor?: string;
  size?: string;
  price?: string | number;
}

export interface User {
  id: string;
  building?: string;
  block?: string;
}

const formatSize = (size?: string) => {
  if (!size) return 'N/A';
  switch (size) {
    case 'S':
      return 'Small - Nhỏ';
    case 'M':
      return 'Medium - Trung bình';
    case 'L':
      return 'Large - Lớn';
    case 'XL':
      return 'Extra Large - Rất lớn';
    default:
      return size;
  }
};

interface RegisterLockerProps {
  user?: User;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function RegisterLocker({ user }: RegisterLockerProps) {
  const { data: session } = useSession();
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [availableLockers, setAvailableLockers] = useState<Locker[]>([]);
  const [registering, setRegistering] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { showToast } = useToast();
  const [filterSize, setFilterSize] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);

  // Lấy user data từ props hoặc session
  const currentUser = user || session?.user;

  const loadLockers = useCallback(async (loadMore = false) => {
    if (!currentUser?.id) return;

    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const currentPage = loadMore ? page + 1 : 1;
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '9', // 9 items for a 3-column grid
        search: debouncedSearchTerm,
        size: filterSize,
      });

      const res = await fetch(`/api/lockers/resident/available?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Lỗi API: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Lỗi tải dữ liệu tủ");
      }

      const newLockers: Locker[] = json.data || [];
      if (loadMore) {
        setAvailableLockers(prev => [...prev, ...newLockers]);
        setPage(currentPage);
      } else {
        setAvailableLockers(newLockers);
        setPage(1);
      }

      setHasMore(json.pagination.hasMore);
      setTotalAvailable(json.pagination.total);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentUser?.id, page, debouncedSearchTerm, filterSize]);

  useEffect(() => {
    // Fetch data when filters change
    loadLockers(false);
  }, [debouncedSearchTerm, filterSize, currentUser?.id]); // Dependency on loadLockers is implicitly handled by useCallback

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || loading) return;
    loadLockers(true);
  }, [isLoadingMore, hasMore, loading, loadLockers]);

  // Sử dụng IntersectionObserver để lazy load, hiệu quả hơn scroll listener
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement) => {
    if (loading) return; // Không làm gì nếu đang tải lần đầu
    if (observer.current) observer.current.disconnect(); // Dọn dẹp observer cũ

    observer.current = new IntersectionObserver(entries => {
      // Nếu phần tử trigger hiển thị trên màn hình và còn dữ liệu để tải
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node); // Bắt đầu theo dõi phần tử trigger
  }, [loading, hasMore, loadMore]);
  const minPrice = useMemo(() => {
    if (availableLockers.length === 0) return 10000;
    return Math.min(...availableLockers.map(l => Number(l.price || 10000)));
  }, [availableLockers]);

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto">Đang tải danh sách tủ...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-7xl mx-auto text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Đăng ký tủ mới</h1>
        <p className="text-gray-600">Chọn tủ phù hợp với nhu cầu của bạn. Hệ thống sẽ tự động lọc các tủ có sẵn trong khu vực của bạn.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng số tủ trống</p>
              <p className="text-gray-900">{totalAvailable} tủ</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 hidden md:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Kết quả lọc</p>
              <p className="text-gray-900">{totalAvailable} tủ</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Giá từ</p>
              <p className="text-gray-900">{minPrice.toLocaleString('vi-VN')} VNĐ/Ngày</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã tủ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterSize} onValueChange={setFilterSize}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo kích thước" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kích thước</SelectItem>
              <SelectItem value="S">{formatSize('S')}</SelectItem>
              <SelectItem value="M">{formatSize('M')}</SelectItem>
              <SelectItem value="L">{formatSize('L')}</SelectItem>
              <SelectItem value="XL">{formatSize('XL')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lockers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableLockers.length > 0 ? (
          availableLockers.map((locker) => (
            <Card key={locker._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">Tủ {locker.lockerId}</p>
                    <p className="text-xs text-gray-500">Block {locker.block}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Trống</Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Tòa {locker.building}</p>
                    <p className="text-xs text-gray-500">Block {locker.block}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">{(Number(locker.price) || 10000).toLocaleString('vi-VN')} VNĐ/Ngày</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => setSelectedLocker(locker)}>
                Thuê tủ ngay
              </Button>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center col-span-full">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">Không tìm thấy tủ trống</p>
            <p className="text-gray-500">Tất cả các tủ trong block của bạn hiện đã được đặt</p>
          </Card>
        )}
      </div>
      {/* Phần tử trigger vô hình để kích hoạt lazy load */}
      <div ref={loadMoreTriggerRef} />

      {isLoadingMore && (
        <div className="text-center py-4 text-sm text-gray-500 col-span-full">
          Đang tải thêm...
        </div>
      )}
      {!hasMore && availableLockers.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-400 col-span-full">
          Đã hiển thị tất cả tủ trống.
        </div>
      )}


      {/* Lockers Pop-up */}
      <Dialog open={!!selectedLocker} onOpenChange={(open: boolean) => { if (!open) setSelectedLocker(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng ký tủ {selectedLocker?.lockerId ?? ''}</DialogTitle>
            <DialogDescription>Xem lại thông tin trước khi xác nhận thuê</DialogDescription>
          </DialogHeader>

          {selectedLocker ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã tủ</p>
                  <p className="text-gray-900">{selectedLocker.lockerId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tòa</p>
                  <p className="text-gray-900">{selectedLocker.building}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Block</p>
                  <p className="text-gray-900">{selectedLocker.block}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tầng</p>
                  <p className="text-gray-900">{selectedLocker.floor ?? '1'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kích thước</p>
                  <p className="text-gray-900">{formatSize(selectedLocker.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá</p>
                  <p className="text-blue-600">{selectedLocker.price ? `${Number(selectedLocker.price).toLocaleString('vi-VN')} VNĐ/Ngày` : '10,000 VNĐ/Ngày'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">Không có dữ liệu</div>
          )}

            <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full" disabled={registering} onClick={async () => {
              if (!selectedLocker) return;
              setRegistering(true);
              try {
                const res = await fetch('/api/lockers/resident/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lockerId: selectedLocker._id })
                });

                const json = await res.json();
                if (!res.ok || !json.success) {
                  const msg = json?.message || `Server error (${res.status})`;
                  throw new Error(msg);
                }

                showToast('Đăng ký tủ thành công!', 'success');
                // Gửi sự kiện để các component khác (như Dashboard) có thể cập nhật danh sách "My Lockers"
                window.dispatchEvent(new CustomEvent('myLockersUpdated', { detail: json.data }));

                // success: remove locker from lists and close dialog
                setAvailableLockers(prev => prev.filter(l => l._id !== selectedLocker._id));
                setSelectedLocker(null);
              } catch (err) {
                console.error('Register error', err);
                showToast(err instanceof Error ? err.message : String(err), 'error');
              } finally {
                setRegistering(false);
              }
            }}>
              {registering ? 'Đang xử lý...' : 'Xác nhận thuê'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setSelectedLocker(null)}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
