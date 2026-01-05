import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { Package, Clock, CreditCard, Plus, Smartphone, MapPin, Unlock, Lock, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/toast-context';

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as Error & { info?: unknown; status?: number };
    try {
      error.info = await res.json();
    } catch {
      // Ignore if response body is not JSON
    }
    error.status = res.status;
    throw error;
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "API returned an error");
  }
  return json.data;
};

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
  export default function ResidentDashboard({
    onNavigate, // Assuming onNavigate is passed from a parent component
  }: { onNavigate: (page: string, locker?: Locker) => void }) {
  const { showToast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    data: myLockers = [],
    error: myLockersError,
    isLoading: myLockersLoading,
    mutate: mutateMyLockers,
  } = useSWR<MyLockerItem[]>(
    session?.user?.id ? `/api/lockers/resident/mylocker` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // SWR for Available Lockers
  const {
    data: availableLockers = [],
    error: availableLockersError,
    isLoading: availableLockersLoading,
    mutate: mutateAvailableLockers,
  } = useSWR<Locker[]>(
    session?.user?.id ? `/api/lockers/resident/available` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const isLoading = myLockersLoading || availableLockersLoading;
  const error = myLockersError || availableLockersError;

  const userName = session?.user?.name;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMyLocker, setSelectedMyLocker] = useState<MyLockerItem | null>(null);
  const [selectedAvailableLocker, setSelectedAvailableLocker] = useState<Locker | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [registering, setRegistering] = useState<boolean>(false);

  const sortedMyLockers = useMemo(() => {
    // Define sort order priority from MyLockers.tsx
    const getSortPriority = (item: MyLockerItem) => {
      if (item.booking.status === 'stored' && item.booking.paymentStatus === 'paid') {
        return 1; // 1. Đã thanh toán
      }
      if (item.booking.status === 'stored' && item.booking.paymentStatus === 'pending') {
        return 2; // 2. Chưa thanh toán
      }
      if (item.booking.status === 'active') {
        return 3; // 3. Chưa dùng
      }
      return 4; // Others
    };

    return [...myLockers].sort((a, b) => getSortPriority(a) - getSortPriority(b));
  }, [myLockers]);

  const slides = [
    {
      title: "Quản lý tủ thông minh, trong tầm tay bạn",
      description: "Theo dõi trạng thái, mở tủ từ xa và nhận thông báo realtime ngay trên dashboard.",
      cta1: { text: "Tìm tủ ngay", action: () => onNavigate('register-locker') }, // This uses the smart onNavigate
      cta2: { text: "Tìm hiểu thêm", action: () => router.push('/HowItWorks') }, // This is a public page
      image: "https://i.pinimg.com/1200x/37/58/ff/3758ff1aff31ae34b2005e98f3fb72eb.jpg",
      icon: <Smartphone className="w-6 h-6" />,
      iconText: "VLocker"
    },
    // {
    //   title: "Trạng thái hệ thống",
    //   description: `${availableLockers.length + myLockers.length} tủ đang online\n1 tủ cần kiểm tra`,
    //   cta1: { text: "Xem chi tiết", action: () => onNavigate('my-lockers') },
    //   cta2: { text: "Kiểm tra sự cố", action: () => onNavigate('report') },
    //   image: "https://i.pinimg.com/1200x/63/79/fd/6379fd7003047ac995e58b48966f6624.jpg",
    //   icon: <TrendingUp className="w-6 h-6" />,
    //   iconText: "Realtime"
    // },
    {
      title: `Chào ${userName || 'bạn'}`,
      description: `Bạn đang sử dụng ${myLockers.length} tủ, nếu bạn muốn sử dụng thêm hãy đăng ký tủ mới liền nha!`,
      cta1: { text: "Xem tủ của tôi", action: () => onNavigate('my-lockers') },
      cta2: { text: "Xem lịch sử", action: () => onNavigate('history') },
      image: "https://i.pinimg.com/1200x/03/98/03/039803e9538226f3dd913cf3b7246771.jpg",
      icon: <UserIcon className="w-6 h-6" />,
      iconText: "Cá nhân hoá"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 30000); // Change slide every 30 seconds
    return () => clearInterval(slideInterval);
  }, [slides.length]);

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

    const calculateCost = (item: MyLockerItem): number => {
      const { booking, locker } = item;
      const dailyRate = Number(locker?.price) || 10000;
      if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.cost && booking.cost > 0) {
        return booking.cost;
      }
      if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
        const startTime = new Date(booking.startTime);
        const now = new Date();
        const daysDiff = Math.ceil((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, daysDiff) * dailyRate;
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
      
      try {
        const res = await fetch('/api/lockers/resident/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: selectedMyLocker.booking._id }),
        });

        const json = await res.json();
        
        if (!res.ok || !json.success) {
          if (json.message && json.message.includes('hết hạn')) {
            mutateMyLockers();
          }
          throw new Error(json.message || 'Lỗi mở tủ');
        }

        showToast('Tủ đã được mở thành công!', 'success');
        mutateMyLockers();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Lỗi mở tủ', 'error');
      } finally {
        setActionLoading(null);
      }
    };

    const handleLock = async () => {
      if (!selectedMyLocker) return;
      
      setActionLoading('lock');
      
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
        mutateMyLockers();
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
        mutateMyLockers();
        setSelectedMyLocker(null);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Lỗi thanh toán', 'error');
      } finally {
        setActionLoading(null);
      }
    };

    // Xử lý trạng thái tải session
    if (status === "loading") {
      return <div className="p-6 max-w-7xl mx-auto">Đang tải phiên làm việc...</div>;
    }

    // Xử lý khi không có session hoặc user
    if (!session?.user) {
      return <div className="p-6 max-w-7xl mx-auto text-red-600">Lỗi: Không thể tải dữ liệu người dùng. Vui lòng đăng nhập lại.</div>;
    }

    if (isLoading) {
      return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    if (error) {
      return <div className="p-6 text-red-600">Lỗi: {error.message}</div>;
    }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Carousel Banner */}      
      <Card className="relative bg-gradient-to-r from-neutral-700 to-neutral-900 text-white overflow-hidden min-h-[320px] flex items-center rounded-2xl group select-none">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center h-full px-10 md:px-20 py-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {slide.icon}
                  <span className="text-grey-100">{slide.iconText}</span>
                </div>
                <h2 className="text-white mb-4 text-2xl font-bold" style={{ whiteSpace: 'pre-line' }}>
                  {slide.title}
                </h2>
                <p className="text-grey-500 mb-6" style={{ whiteSpace: 'pre-line' }}>
                  {slide.description}
                </p>
                <div className="flex gap-4">
                  <Button variant="secondary" onClick={slide.cta1.action}>
                    {slide.cta1.text}
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-neutral-800" onClick={slide.cta2.action}>
                    {slide.cta2.text}
                  </Button>
                </div>
              </div>
              <div className="hidden md:block relative h-full">
                <ImageWithFallback
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-100"
                />
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}`}
            />
          ))}
        </div>
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/10 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/10 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </Card>

      {/* My Lockers Section */}
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
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">Tủ {mylocker.locker?.lockerId || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Tòa {mylocker.locker?.building || 'N/A'} - Block {mylocker.locker?.block || 'N/A'}</p>
                    </div>
                  </div>
                  {mylocker.booking.status === 'active' ? (
                    <Badge className="bg-gray-100 text-gray-700">Đang thuê</Badge>
                  ) : mylocker.booking.paymentStatus === 'pending' ? (
                    <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
                  ) : mylocker.booking.paymentStatus === 'paid' ? (
                    <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Không có</Badge>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {mylocker.booking.status === 'active' ? (
                      <span className="text-gray-600">Chưa tính tiền</span>
                    ) : mylocker.booking.paymentStatus === 'pending' ? (
                      <span className="text-gray-600">Chờ thanh toán</span>
                    ): mylocker.booking.paymentStatus === 'paid' ? (
                      <span className="text-gray-600">Đã thanh toán</span>
                    ) : (
                      <span className="text-gray-600">Không có</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {mylocker.booking.status === 'stored'
                        ? calculateCost(mylocker).toLocaleString()
                        : (mylocker.booking.cost || 0).toLocaleString()}đ
                    </span>
                  </div>
                </div>
                {mylocker.booking.status === 'active' ? (
                  <Button className="w-full" variant="default" onClick={() => setSelectedMyLocker(mylocker)}>
                    Chi tiết
                  </Button>
                ) : mylocker.booking.paymentStatus === 'pending' ? (
                  <Button className="w-full" variant="default" onClick={() => setSelectedMyLocker(mylocker)}>
                    Thanh toán ngay
                  </Button>
                ) : mylocker.booking.paymentStatus === 'paid' ? (
                  <Button className="w-full" variant="default" onClick={() => setSelectedMyLocker(mylocker)}>
                    Mở tủ
                  </Button>
                ) : (
                  <Button className="w-full" variant="default" onClick={() => setSelectedMyLocker(mylocker)}>
                    Không có
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
                      {selectedMyLocker && selectedMyLocker.booking?.status === 'stored'
                        ? calculateCost(selectedMyLocker).toLocaleString()
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
                onClick={() => {
                  if (selectedMyLocker) {
                    router.push(`/resident/report?lockerId=${selectedMyLocker.locker.lockerId}&locker_id=${selectedMyLocker.locker._id}`);
                  }
                }}
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
          {availableLockers.length > 0 ? (
            availableLockers.slice(0, 3).map((locker) => (
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
                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{(Number(locker.price) || 10000).toLocaleString('vi-VN')} VNĐ/Ngày</p>
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
                    <p className="text-gray-900">{formatSize(selectedAvailableLocker.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giá</p>
                    <p className="text-blue-600">{selectedAvailableLocker.price ? `${Number(selectedAvailableLocker.price).toLocaleString('vi-VN')} VNĐ/Ngày` : '10,000 VNĐ/Ngày'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">Không có dữ liệu</div>
            )}

              <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button className="w-full" disabled={registering} onClick={async () => {
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
                    const msg = json?.message || `Server error (${res.status})`;
                    throw new Error(msg);
                  }

                  showToast('Đăng ký tủ thành công!', 'success');
                  mutateMyLockers();
                  mutateAvailableLockers();
                  setSelectedAvailableLocker(null);
                } catch (err) {
                  console.error('Register error', err);
                  showToast(err instanceof Error ? err.message : String(err), 'error');
                } finally {
                  setRegistering(false);
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