'use client';
import { Package, Clock, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useToast } from '../ui/toast-context';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch data');
  }
  return json.data;
};

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface PopulatedLocker {
  _id: string;
  lockerId: string;
  building: string;
  block: string;
  price?: string | number;
}

interface BookingDetails {
  _id: string;
  userId: PopulatedUser;
  lockerId: PopulatedLocker;
  startTime?: string;
  status: 'active' | 'stored';
}

export default function ManagerLockers() {
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingDetails | null>(null);
  const { showToast } = useToast();

  const { data: allBookings = [], error, isLoading, mutate } = useSWR<BookingDetails[]>(
    '/api/lockers/manager/booked',
    fetcher,
    { revalidateOnFocus: false }
  );

  const filteredBookings = useMemo(() => {
    return allBookings.filter(booking => {
      const locker = booking.lockerId;
      const user = booking.userId;
      if (!locker || !user) return false;

      const matchesBuilding = filterBuilding === 'all' || locker.building === filterBuilding;
      const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'reserved' && booking.status === 'active') || (filterStatus === 'in-use' && booking.status === 'stored');
      const matchesSearch = searchTerm.trim() === '' ||
                            locker.lockerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesBuilding && matchesBlock && matchesStatus && matchesSearch;
    });
  }, [allBookings, filterBuilding, filterBlock, filterStatus, searchTerm]);

  const uniqueBlocks = useMemo(() => {
    const blocks = Array.from(new Set(allBookings.map(b => b.lockerId?.block).filter(Boolean)));
    return blocks.sort();
  }, [allBookings]);

  const uniqueBuildings = useMemo(() => {
    const buildings = Array.from(new Set(allBookings.map(b => b.lockerId?.building).filter(Boolean)));
    return buildings.sort();
  }, [allBookings]);

  const calculateDuration = (startTime?: string): string => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays > 0) {
      return `${diffDays} ngày ${diffHours} giờ`;
    }
    return `${diffHours} giờ`;
  };

  const calculateCost = (booking: BookingDetails): string => {
    if (!booking.startTime) return '0đ';
    const dailyRate = Number(booking.lockerId?.price) || 10000;
    const start = new Date(booking.startTime);
    const now = new Date();
    const daysDiff = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const cost = Math.max(1, daysDiff) * dailyRate;
    return `${cost.toLocaleString('vi-VN')}đ`;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch('/api/lockers/manager/cancel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Hủy lượt đặt thất bại.');
      }
      showToast('Hủy lượt đặt thành công!', 'success');
      mutate(); // Re-fetch data
      setBookingToCancel(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi.', 'error');
    }
  };

  if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error.message}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý tủ đang được thuê</h1>
        <p className="text-gray-600">Theo dõi và quản lý tình trạng sử dụng tủ</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Input placeholder="Tìm kiếm theo mã tủ hoặc người dùng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="reserved">Đã đặt</SelectItem>
              <SelectItem value="in-use">Đang sử dụng</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBuilding} onValueChange={setFilterBuilding}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo tòa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tòa</SelectItem>
              {uniqueBuildings.map((building: string) => (
                <SelectItem key={building} value={building}>{`Tòa ${building}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterBlock} onValueChange={setFilterBlock}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả block</SelectItem>
              {uniqueBlocks.map((block: string) => (
                <SelectItem key={block} value={block}>{`Block ${block}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã tủ</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Không có dữ liệu phù hợp.</TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${booking.status === 'active' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <Package className={`w-4 h-4 ${booking.status === 'active' ? 'text-yellow-600' : 'text-green-600'}`} />
                      </div>
                      <span>{booking.lockerId?.lockerId || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.userId?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div>
                      <p>Tòa {booking.lockerId?.building || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Block {booking.lockerId?.block || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.status === 'active' ? 'Đã đặt' : 'Đang sử dụng'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{calculateDuration(booking.startTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600">
                      {booking.status === 'stored' ? calculateCost(booking) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Chi tiết
                      </Button>
                      {booking.status === 'active' &&
                        <Button variant="destructive" size="sm" onClick={() => setBookingToCancel(booking)}>
                          <X className="w-4 h-4 mr-1" />
                          Hủy
                        </Button>
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết tủ {selectedBooking?.lockerId?.lockerId}</DialogTitle>
            <DialogDescription>
              Thông tin người dùng và tủ
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người dùng</p>
                  <p className="text-gray-900">{selectedBooking.userId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vị trí</p>
                  <p className="text-gray-900">Tòa {selectedBooking.lockerId?.building} - Block {selectedBooking.lockerId?.block}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900 text-sm truncate" title={selectedBooking.userId?.email}>{selectedBooking.userId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <p className="text-gray-900">{selectedBooking.userId?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                  <p className="text-gray-900">{calculateDuration(selectedBooking.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số tiền</p>
                  <p className="text-blue-600">{selectedBooking.status === 'stored' ? calculateCost(selectedBooking) : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy lượt đặt cho tủ {bookingToCancel?.lockerId?.lockerId}? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingToCancel(null)}>Không</Button>
            <Button variant="destructive" onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel._id)}>Có, hủy lượt đặt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
