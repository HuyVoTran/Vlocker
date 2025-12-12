'use client';

import { useState, useEffect } from 'react';
import { Package, MapPin, DollarSign, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useSession } from 'next-auth/react';

export interface Locker {
  _id: string;
  lockerId: string;
  building: string;
  block: string;
  status: string;
  floor?: string;
  size?: string;
  price?: string;
}

export interface User {
  _id: string;
  building?: string;
  block?: string;
}

interface RegisterLockerProps {
  user?: User;
}

export default function RegisterLocker({ user }: RegisterLockerProps) {
  const { data: session } = useSession();
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [availableLockers, setAvailableLockers] = useState<Locker[]>([]);
  const [filteredLockers, setFilteredLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [blocks, setBlocks] = useState<string[]>([]);

  // Lấy user data từ props hoặc session
  const currentUser = user || {
    _id: session?.user?.id || '',
    building: session?.user?.building || 'A',
    block: session?.user?.block || '1'
  };

  useEffect(() => {
    async function loadLockers() {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser.building || !currentUser.block) {
          setError('Không có thông tin tòa/block của bạn');
          setLoading(false);
          return;
        }

        console.log("Loading available lockers for:", currentUser.building, currentUser.block);
        
        const res = await fetch(
          `/api/lockers/resident/available?building=${currentUser.building}&block=${currentUser.block}`
        );
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const json = await res.json();
        console.log("Available lockers loaded:", json);
        
        const lockers = json.data || [];
        setAvailableLockers(lockers);
        setFilteredLockers(lockers);
        
        // Lấy danh sách blocks duy nhất
        const uniqueBlocks = Array.from(new Set(lockers.map((l: Locker) => l.block))).sort();
        setBlocks(uniqueBlocks as string[]);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading lockers:", err);
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
        setLoading(false);
      }
    }

    if (currentUser._id) {
      loadLockers();
    }
  }, [currentUser._id, currentUser.building, currentUser.block]);

  // Cập nhật filtered lockers khi search/filter thay đổi
  useEffect(() => {
    const filtered = availableLockers.filter(locker => {
      const matchesSearch = locker.lockerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           locker.building.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
      return matchesSearch && matchesBlock;
    });
    setFilteredLockers(filtered);
  }, [searchTerm, filterBlock, availableLockers]);

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-7xl mx-auto text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Đăng ký tủ mới</h1>
        <p className="text-gray-600">Chọn tủ phù hợp với nhu cầu của bạn - Tòa {currentUser.building} Block {currentUser.block}</p>
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
          <Select value={filterBlock} onValueChange={setFilterBlock}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả block</SelectItem>
              {blocks.map((block) => (
                <SelectItem key={block} value={block}>
                  Block {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng số tủ trống</p>
              <p className="text-gray-900">{availableLockers.length} tủ</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Kết quả lọc</p>
              <p className="text-gray-900">{filteredLockers.length} tủ</p>
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
              <p className="text-gray-900">5,000 VNĐ/Ngày</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lockers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLockers.length > 0 ? (
          filteredLockers.map((locker) => (
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
              </div>

              <Button className="w-full">
                <div onClick={() => setSelectedLocker(locker)}>Thuê tủ ngay</div>
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

      {/* Lockers Pop-up */}
      <Dialog open={!!selectedLocker} onOpenChange={(open: boolean) => { if (!open) setSelectedLocker(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng ký tủ {selectedLocker?.lockerId ?? ''}</DialogTitle>
            <div className="text-sm text-gray-500">Xem lại thông tin trước khi xác nhận thuê</div>
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
                  <p className="text-gray-900">{selectedLocker.size ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá</p>
                  <p className="text-blue-600">{selectedLocker.price ?? '5,000 VNĐ/Ngày'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">Không có dữ liệu</div>
          )}

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full" onClick={async () => {
              // placeholder: perform registration (call API) or navigate
              console.log('Registering locker', selectedLocker);
              setSelectedLocker(null);
            }}>
              Xác nhận thuê
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
