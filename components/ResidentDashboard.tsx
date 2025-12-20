import { useState, useEffect } from "react";
import { Package, Clock, CreditCard, Plus, Smartphone, MapPin, Unlock, Lock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useToast } from './ui/toast-context';

interface ResidentDashboardProps {
  onNavigate: (page: string, locker?: Locker) => void;
  user: User;
}

export interface User {
  _id: string;
  building?: string;
  block?: string;
}

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

// === Quan trọng: Kiểu gộp trả về từ API ===
interface MyLockerItem {
  locker: Locker;
  booking: Booking;
}

  export default function ResidentDashboard({
    onNavigate,
    user,
  }: ResidentDashboardProps) {
    const { showToast } = useToast();
    const [myLockers, setMyLockers] = useState<MyLockerItem[]>([]);
    const [filteredLockers, setFilteredLockers] = useState<Locker[]>([]);
    const [selectedMyLocker, setSelectedMyLocker] = useState<MyLockerItem | null>(null);
    const [selectedAvailableLocker, setSelectedAvailableLocker] = useState<Locker | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [registering, setRegistering] = useState<boolean>(false);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // currentUser alias (component receives `user` prop)
    const currentUser = user;

    // Update time every minute for countdown
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }, []);

    // Helper functions
    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return 'N/A';
      try {
        const d = new Date(date);
        return d.toLocaleString('vi-VN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return String(date);
      }
    };

    const calculateCost = (booking: Booking): number => {
      if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.cost && booking.cost > 0) {
        return booking.cost;
      }
      if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
        const startTime = new Date(booking.startTime);
        const now = new Date();
        const daysDiff = Math.ceil((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, daysDiff) * 5000;
      }
      return booking.cost || 0;
    };

    const getRemainingPickupTime = (booking: Booking): number | null => {
      if (booking.status === 'stored' && booking.paymentStatus === 'paid') {
        if (!booking.pickupExpiryTime) {
          return null;
        }
        const expiry = new Date(booking.pickupExpiryTime);
        const diffMs = expiry.getTime() - currentTime.getTime();
        const diffMinutes = Math.ceil(diffMs / (1000 * 60));
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

    // Handler functions
    const handleOpen = async () => {
      if (!selectedMyLocker) return;
      
      setActionLoading('open');
      setActionError(null);
      
      try {
        const res = await fetch('/api/lockers/resident/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: selectedMyLocker.booking._id }),
        });

        const json = await res.json();
        
        if (!res.ok || !json.success) {
          if (json.message && json.message.includes('hết hạn')) {
            // Refresh data if expired
            window.location.reload();
          }
          throw new Error(json.message || 'Lỗi mở tủ');
        }

        showToast('Tủ đã được mở thành công!', 'success');
        window.location.reload();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Lỗi mở tủ', 'error');
      } finally {
        setActionLoading(null);
      }
    };

    const handleLock = async () => {
      if (!selectedMyLocker) return;
      
      setActionLoading('lock');
      setActionError(null);
      
      try {
        const res = await fetch('/api/lockers/resident/lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: selectedMyLocker.booking._id }),
        });

        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Lỗi khóa tủ');
        }

        showToast(json.message || 'Khóa tủ thành công!', 'success');
        window.location.reload();
        setSelectedMyLocker(null);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Lỗi khóa tủ', 'error');
      } finally {
        setActionLoading(null);
      }
    };

    const handlePayment = async () => {
      if (!selectedMyLocker) return;
      
      setActionLoading('payment');
      setActionError(null);
      
      try {
        const res = await fetch('/api/lockers/resident/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bookingId: selectedMyLocker.booking._id,
            paymentMethod: 'virtual'
          }),
        });

        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Lỗi thanh toán');
        }

        showToast('Thanh toán thành công! Bạn có thể mở tủ ngay bây giờ.', 'success');
        window.location.reload();
        setSelectedMyLocker(null);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Lỗi thanh toán', 'error');
      } finally {
        setActionLoading(null);
      }
    };
  
    useEffect(() => {
      async function loadData() {
        try {
          setLoading(true);
          setError(null);

          console.log("Loading dashboard for user:", user._id, user.building, user.block);
  
          // === Fetch My Locker (có cả locker + booking) ===
          console.log("Fetching my lockers...");
          const myRes = await fetch(`/api/lockers/resident/mylocker?userId=${user._id}`);
          console.log("My lockers response status:", myRes.status);
          if (!myRes.ok) {
            throw new Error(`My lockers API error: ${myRes.status}`);
          }
          const myJson = await myRes.json();
          console.log("My lockers data:", myJson);
          setMyLockers(myJson.data || []);
  
          // === Fetch Available Lockers ===
          if (user.building && user.block) {
            console.log("Fetching available lockers...");
            const availRes = await fetch(
              `/api/lockers/resident/available?building=${user.building}&block=${user.block}`
            );
            console.log("Available lockers response status:", availRes.status);
            if (!availRes.ok) {
              throw new Error(`Available lockers API error: ${availRes.status}`);
            }
            const availJson = await availRes.json();
            console.log("Available lockers data:", availJson);
            const avail = availJson.data || [];
            setFilteredLockers(avail);
          } else {
            console.log("No building/block provided, skipping available lockers");
          }
          
          setLoading(false);
        } catch (err) {
          console.error("Error loading dashboard:", err);
          setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
          setLoading(false);
        }
      }
  
      if (user._id) {
        loadData();
      } else {
        console.log("User ID not ready yet");
        setLoading(false);
      }
    }, [user._id, user.building, user.block]);
  
    if (loading) {
      return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    if (error) {
      return <div className="p-6 text-red-600">Lỗi: {error}</div>;
    }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* App Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-6 h-6" />
              <span className="text-blue-100">Ứng dụng di động</span>
            </div>
            <h2 className="text-white mb-4">
              Tải VLocker App để trải nghiệm tốt hơn
            </h2>
            <p className="text-blue-100 mb-6">
              Mở tủ bằng điện thoại, nhận thông báo realtime, quản lý dễ dàng mọi lúc mọi nơi
            </p>
            <div className="flex gap-4">
              <Button variant="secondary">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Button>
              <Button variant="secondary">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Google Play
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1614020661483-d2bb855eee1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBwaG9uZXxlbnwxfHx8fDE3NjMwNTM1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="VLocker Mobile App"
              className="w-full h-64 object-contain"
            />
          </div>
        </div>
      </Card>

      {/* My Lockers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Tủ của tôi</h2>
          <Button variant="outline" onClick={() => onNavigate('my-lockers')}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {myLockers.length > 0 ? (
            myLockers.slice(0, 3).map((mylocker) => (
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
                  {mylocker.booking.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700">Đang thuê</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">Đang sử dụng</Badge>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {mylocker.booking.status === 'active' ? (
                      <span className="text-gray-600">Chưa tính tiền</span>
                    ) : (
                      <span className="text-gray-600">Chờ thanh toán</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{(mylocker.booking.cost || 0).toLocaleString()}đ</span>
                  </div>
                </div>
                {mylocker.booking.status === 'active' ? (
                  <Button className="w-full" variant="default" onClick={() => setSelectedMyLocker(mylocker)}>
                    Chi tiết
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" onClick={() => setSelectedMyLocker(mylocker)}>
                    Thanh toán ngay
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <p className="text-gray-500 col-span-3">Bạn chưa có tủ nào</p>
          )}
        </div>
      </div>
      <div>
        <Dialog open={!!selectedMyLocker} onOpenChange={(open: boolean) => { if (!open) setSelectedMyLocker(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chi tiết tủ {selectedMyLocker?.locker?.lockerId ?? ''}</DialogTitle>
              <DialogDescription>Thông tin chi tiết và các tùy chọn cho tủ của bạn</DialogDescription>
            </DialogHeader>

            {selectedMyLocker ? (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã tủ</p>
                    <p className="text-gray-900">{selectedMyLocker.locker?.lockerId ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tòa</p>
                    <p className="text-gray-900">{selectedMyLocker.locker?.building ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Block</p>
                    <p className="text-gray-900">{selectedMyLocker.locker?.block ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái đặt</p>
                    {selectedMyLocker.booking?.status === 'active' ? (
                      <p className="text-gray-900">Chưa dùng</p>
                    ) : selectedMyLocker.booking?.status === 'stored' ? (
                      <p className="text-gray-900">Đã dùng</p>
                    ) : (
                      <p className="text-gray-900">Không có</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian bắt đầu</p>
                    <p className="text-gray-900">{formatDate(selectedMyLocker.booking?.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian kết thúc</p>
                    <p className="text-gray-900">{formatDate(selectedMyLocker.booking?.endTime)}</p>
                  </div>
                  {selectedMyLocker.booking?.status === 'stored' && selectedMyLocker.booking?.paymentStatus === 'paid' && (
                    <div>
                      <p className="text-sm text-gray-500">Thời gian lấy đồ còn lại</p>
                      {selectedMyLocker.booking?.pickupExpiryTime ? (
                        <p className={`text-gray-900 ${getRemainingPickupTime(selectedMyLocker.booking) !== null && getRemainingPickupTime(selectedMyLocker.booking)! <= 0 ? 'text-red-600 font-semibold' : 'text-orange-600 font-semibold'}`}>
                          {formatRemainingTime(getRemainingPickupTime(selectedMyLocker.booking)) || 'Đã hết hạn'}
                        </p>
                      ) : (
                        <p className="text-red-600 font-semibold">Chưa có thời gian hết hạn</p>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Số tiền</p>
                    <p className="text-blue-600">
                      {selectedMyLocker.booking?.status === 'stored'
                        ? calculateCost(selectedMyLocker.booking).toLocaleString()
                        : (selectedMyLocker.booking?.cost || 0).toLocaleString()}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                    {selectedMyLocker.booking?.paymentStatus === 'paid' ? (
                      <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>
                    ) : selectedMyLocker.booking?.status === 'stored' ? (
                      <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Không có</Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">Không có dữ liệu</div>
            )}

            {actionError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {actionError}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-col gap-2">
              {/* Status: active - Có thể mở tủ và khóa tủ */}
              {selectedMyLocker && selectedMyLocker.booking?.status === 'active' && (
                <>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={handleOpen}
                    disabled={actionLoading !== null}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    {actionLoading === 'open' ? 'Đang mở...' : 'Mở tủ'}
                  </Button>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={handleLock}
                    disabled={actionLoading !== null}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {actionLoading === 'lock' ? 'Đang khóa...' : 'Khóa tủ (Bắt đầu tính tiền)'}
                  </Button>
                </>
              )}

              {/* Status: stored - Phải thanh toán mới được mở tủ */}
              {selectedMyLocker && selectedMyLocker.booking?.status === 'stored' && (
                <>
                  {selectedMyLocker.booking?.paymentStatus === 'pending' ? (
                    <Button 
                      className="w-full bg-yellow-600 hover:bg-yellow-700" 
                      onClick={handlePayment}
                      disabled={actionLoading !== null}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {actionLoading === 'payment' ? 'Đang xử lý...' : 'Thanh toán (Tạm thanh toán ảo)'}
                    </Button>
                  ) : (
                    <>
                      {getRemainingPickupTime(selectedMyLocker.booking) !== null && getRemainingPickupTime(selectedMyLocker.booking)! <= 0 ? (
                        <Button 
                          className="w-full bg-gray-400 cursor-not-allowed" 
                          disabled={true}
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Đã hết hạn lấy đồ
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          onClick={handleOpen}
                          disabled={actionLoading !== null}
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          {actionLoading === 'open' ? 'Đang mở...' : 'Mở tủ'}
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onNavigate('renew', selectedMyLocker?.locker)}
                disabled={actionLoading !== null}
              >
                Báo Cáo Lỗi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Lockers Section */}
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
        {/* Lockers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLockers.length > 0 ? (
            filteredLockers.slice(0, 3).map((locker) => (
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

                <Button className="w-full" onClick={() => setSelectedAvailableLocker(locker)}>
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

        {/* Lockers Pop-up */}
        <Dialog open={!!selectedAvailableLocker} onOpenChange={(open: boolean) => { if (!open) setSelectedAvailableLocker(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Đăng ký tủ {selectedAvailableLocker?.lockerId ?? ''}</DialogTitle>
              <DialogDescription>Xem lại thông tin trước khi xác nhận thuê</DialogDescription>
            </DialogHeader>

            {selectedAvailableLocker ? (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã tủ</p>
                    <p className="text-gray-900">{selectedAvailableLocker.lockerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tòa</p>
                    <p className="text-gray-900">{selectedAvailableLocker.building}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Block</p>
                    <p className="text-gray-900">{selectedAvailableLocker.block}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tầng</p>
                    <p className="text-gray-900">{selectedAvailableLocker.floor ?? '1'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kích thước</p>
                    <p className="text-gray-900">{selectedAvailableLocker.size ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giá</p>
                    <p className="text-blue-600">{selectedAvailableLocker.price ?? '5,000 VNĐ/Ngày'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">Không có dữ liệu</div>
            )}

              <DialogFooter className="flex-col sm:flex-col gap-2">
              {registerError && (
                <div className="text-sm text-red-600">Lỗi: {registerError}</div>
              )}
              <Button className="w-full" disabled={registering} onClick={async () => {
                if (!selectedAvailableLocker) return;
                setRegisterError(null);
                setRegistering(true);
                try {
                  const res = await fetch('/api/lockers/resident/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser._id, lockerId: selectedAvailableLocker._id })
                  });

                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    const msg = json?.message || `Server error (${res.status})`;
                    setRegisterError(msg);
                    setRegistering(false);
                    return;
                  }

                  // success: remove locker from lists and close dialog
                  setFilteredLockers(prev => prev.filter(l => l._id !== selectedAvailableLocker._id));
                  setSelectedAvailableLocker(null);
                } catch (err) {
                  console.error('Register error', err);
                  showToast(err instanceof Error ? err.message : String(err), 'error');
                } finally {
                  setRegistering(false);
                  window.location.reload();
                }
              }}>
                {registering ? 'Đang xử lý...' : 'Xác nhận thuê'}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSelectedAvailableLocker(null)}>
                Hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
