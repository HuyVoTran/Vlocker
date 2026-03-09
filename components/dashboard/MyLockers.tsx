import { Package, Clock, CreditCard, Unlock, Lock, XCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../ui/toast-context';
import { useRouter } from 'next/navigation';
import { FilterBar, FilterConfig } from '../ui/FilterBar';
import { useSearchParams } from 'next/navigation';
import DemoPayment from '@/components/payment/demo/DemoPayment';
import {
  RealLockerPaymentCard,
  RealPaymentSuccessState,
} from '@/components/payment/real/RealPaymentComponents';

export interface Locker {
  _id?: string;
  lockerId: string;
  building?: string;
  block?: string;
  status?: string;
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

interface MyLockersProps {
  myLockers: MyLockerItem[];
  onNavigate?: (page: string, locker?: MyLockerItem) => void;
  onUpdate?: () => void; // Callback to refresh data after actions
}

export default function MyLockers({ myLockers, onUpdate }: MyLockersProps) {
  const [selectedLocker, setSelectedLocker] = useState<MyLockerItem | null>(null);
  const [loading, setLoading] = useState<string | null>(null); // Track which action is loading
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // For realtime countdown
  const [paymentView, setPaymentView] = useState<'summary' | 'success' | null>(null);
  const [isPayingWithMoMo, setIsPayingWithMoMo] = useState(false);
  const [isPayingWithPayPal, setIsPayingWithPayPal] = useState(false);
  const [isPayingWithVNPay, setIsPayingWithVNPay] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentProcessedOrderId, setPaymentProcessedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'paypal' | 'vnpay'>('momo');
  const paymentMode = (process.env.NEXT_PUBLIC_PAYMENT_MODE || 'demo') as 'demo' | 'real';
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all', // 'all', 'pending', 'paid', 'active'
  });
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate cost for 'stored' status
  const calculateCost = (item: MyLockerItem): number => {
    const { booking, locker } = item;
    const dailyRate = Number(locker?.price) || 10000;
    // If already paid, use the saved cost
    if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.cost && booking.cost > 0) {
      return booking.cost;
    }

    // If stored but not paid yet, calculate realtime cost from startTime to now
    if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
      const startTime = new Date(booking.startTime);
      const now = new Date();
      const daysDiff = Math.ceil((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, daysDiff) * dailyRate;
    }

    // For other statuses, return saved cost or 0
    return booking.cost || 0;
  };

  // Format date for display
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

  // Calculate remaining time to pickup (in minutes) - uses currentTime for realtime updates
  const getRemainingPickupTime = (booking: Booking): number | null => {
    if (booking.status === 'stored' && booking.paymentStatus === 'paid') {
      if (!booking.pickupExpiryTime) {
        console.warn('Booking missing pickupExpiryTime:', booking._id, booking);
        return null;
      }
      const expiry = new Date(booking.pickupExpiryTime);
      const diffMs = expiry.getTime() - currentTime.getTime();
      const diffMinutes = Math.ceil(diffMs / (1000 * 60));
      return diffMinutes > 0 ? diffMinutes : 0;
    }
    return null;
  };

  // Format remaining time for display
  const formatRemainingTime = (minutes: number | null): string => {
    if (minutes === null) return '';
    if (minutes <= 0) return 'Đã hết hạn';
    if (minutes < 60) return `Còn ${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `Còn ${hours} giờ ${mins} phút`;
  };

  // Handle lock action (active -> stored)
  const handleLock = async () => {
    if (!selectedLocker) return;
    
    setLoading('lock');
    setError(null);
    
    try {
      const res = await fetch('/api/lockers/resident/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedLocker.booking._id }),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Lỗi khóa tủ');
      }

      // Show success message
      showToast(json.message || 'Khóa tủ thành công!', 'success');
      
      // Refresh data
      if (onUpdate) {
        onUpdate();
      } else {
        window.location.reload();
      }
      
      setSelectedLocker(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khóa tủ', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi khóa tủ');
    } finally {
      setLoading(null);
    }
  };

  // Handle open action
  const handleOpen = async () => {
    if (!selectedLocker) return;
    
    setLoading('open');
    setError(null);
    
    try {
      const res = await fetch('/api/lockers/resident/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedLocker.booking._id }),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        // If expired, refresh data to remove from list
        if (json.message && json.message.includes('hết hạn')) {
          if (onUpdate) {
            onUpdate();
          } else {
            window.location.reload();
          }
        }
        throw new Error(json.message || 'Lỗi mở tủ');
      }

      showToast('Tủ đã được mở thành công!', 'success');
      // Refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi mở tủ', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi mở tủ');
    } finally {
      setLoading(null);
    }
  };

  const handlePayWithMoMo = async () => {
    if (!selectedLocker) return;

    setIsPayingWithMoMo(true);
    setError(null);

    try {
      const amount = calculateCost(selectedLocker);
      const orderInfo = `Thanh toán trả tủ ${selectedLocker.locker?.lockerId || ''}`.trim();
      const redirectUrl = `${window.location.origin}/resident/my-lockers`;
      const extraData = JSON.stringify({
        bookingId: selectedLocker.booking._id,
        lockerId: selectedLocker.locker?._id,
      });

      const res = await fetch('/api/payment/momo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderInfo,
          orderId: selectedLocker.booking._id,
          redirectUrl,
          extraData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.payUrl) {
        throw new Error(json.message || 'Không thể tạo thanh toán MoMo.');
      }

      window.location.href = json.payUrl as string;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi thanh toán', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi thanh toán');
    } finally {
      setIsPayingWithMoMo(false);
    }
  };

  const handlePayWithPayPal = async () => {
    if (!selectedLocker) return;

    setIsPayingWithPayPal(true);
    setError(null);

    try {
      const amount = calculateCost(selectedLocker);
      const orderInfo = `Thanh toán trả tủ ${selectedLocker.locker?.lockerId || ''}`.trim();
      const returnUrl = `${window.location.origin}/resident/my-lockers?paypal=success&bookingId=${selectedLocker.booking._id}`;
      const cancelUrl = `${window.location.origin}/resident/my-lockers?paypal=cancel`;

      const res = await fetch('/api/payment/paypal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderInfo,
          bookingId: selectedLocker.booking._id,
          returnUrl,
          cancelUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.approveUrl) {
        throw new Error(json.message || 'Không thể tạo thanh toán PayPal.');
      }

      window.location.href = json.approveUrl as string;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi thanh toán', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi thanh toán');
    } finally {
      setIsPayingWithPayPal(false);
    }
  };

  const handlePayWithVNPay = async () => {
    if (!selectedLocker) return;

    setIsPayingWithVNPay(true);
    setError(null);

    try {
      const amount = calculateCost(selectedLocker);
      const orderInfo = `Thanh toán trả tủ ${selectedLocker.locker?.lockerId || ''}`.trim();

      const res = await fetch('/api/payment/vnpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderInfo,
          bookingId: selectedLocker.booking._id,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.paymentUrl) {
        throw new Error(json.message || 'Không thể tạo thanh toán VNPay.');
      }

      window.location.href = json.paymentUrl as string;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi thanh toán', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi thanh toán');
    } finally {
      setIsPayingWithVNPay(false);
    }
  };

  useEffect(() => {
    const resultCode = searchParams?.get('resultCode');
    const orderId = searchParams?.get('orderId');
    const paypalStatus = searchParams?.get('paypal');
    const vnpayStatus = searchParams?.get('vnpay');
    const vnpayBookingId = searchParams?.get('bookingId');
    const paypalOrderId = searchParams?.get('token');
    const paypalBookingId = searchParams?.get('bookingId');

    if (resultCode === '0' && orderId && paymentProcessedOrderId !== orderId) {
      const processPayment = async () => {
        setIsConfirmingPayment(true);
        setPaymentProcessedOrderId(orderId);
        setError(null);

        try {
          const res = await fetch('/api/lockers/resident/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: orderId, paymentMethod: 'momo' }),
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Xác nhận thanh toán thất bại.');
          }

          showToast('Payment successful. Locker is opening.', 'success');

          const lockerItem = myLockers.find(item => item.booking._id === orderId) || null;
          if (lockerItem) {
            setSelectedLocker(lockerItem);
          }
          setPaymentView('success');

          await fetch('/api/lockers/resident/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: orderId }),
          });

          if (onUpdate) {
            onUpdate();
          }

          router.replace('/resident/my-lockers', { scroll: false });
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán', 'error');
          setError(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán');
        } finally {
          setIsConfirmingPayment(false);
        }
      };

      processPayment();
      return;
    }

    if (paypalStatus === 'success' && paypalOrderId && paypalBookingId && paymentProcessedOrderId !== paypalOrderId) {
      const processPayPal = async () => {
        setIsConfirmingPayment(true);
        setPaymentProcessedOrderId(paypalOrderId);
        setError(null);

        try {
          const captureRes = await fetch('/api/payment/paypal/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: paypalOrderId }),
          });
          const captureJson = await captureRes.json();
          if (!captureRes.ok || !captureJson.success) {
            throw new Error(captureJson.message || 'Xác nhận thanh toán PayPal thất bại.');
          }

          const res = await fetch('/api/lockers/resident/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: paypalBookingId, paymentMethod: 'paypal' }),
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Xác nhận thanh toán thất bại.');
          }

          showToast('Payment successful. Locker is opening.', 'success');

          const lockerItem = myLockers.find(item => item.booking._id === paypalBookingId) || null;
          if (lockerItem) {
            setSelectedLocker(lockerItem);
          }
          setPaymentView('success');

          await fetch('/api/lockers/resident/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: paypalBookingId }),
          });

          if (onUpdate) {
            onUpdate();
          }

          router.replace('/resident/my-lockers', { scroll: false });
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán', 'error');
          setError(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán');
        } finally {
          setIsConfirmingPayment(false);
        }
      };

      processPayPal();
      return;
    }

    if (vnpayStatus === 'success' && vnpayBookingId && paymentProcessedOrderId !== `vnpay-${vnpayBookingId}`) {
      const processVNPay = async () => {
        setIsConfirmingPayment(true);
        setPaymentProcessedOrderId(`vnpay-${vnpayBookingId}`);
        setError(null);

        try {
          showToast('Payment successful. Locker is opening.', 'success');

          const lockerItem = myLockers.find(item => item.booking._id === vnpayBookingId) || null;
          if (lockerItem) {
            setSelectedLocker(lockerItem);
          }
          setPaymentView('success');

          await fetch('/api/lockers/resident/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: vnpayBookingId }),
          });

          if (onUpdate) {
            onUpdate();
          }

          router.replace('/resident/my-lockers', { scroll: false });
        } catch (err) {
          showToast(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán', 'error');
          setError(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán');
        } finally {
          setIsConfirmingPayment(false);
        }
      };

      processVNPay();
    }
  }, [searchParams, paymentProcessedOrderId, myLockers, onUpdate, router, showToast]);

  const handleCancel = async () => {
    if (!selectedLocker) return;
    
    setLoading('cancel');
    setError(null);
    
    try {
      const res = await fetch('/api/lockers/resident/cancel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedLocker.booking._id }),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Lỗi hủy lượt đặt');
      }

      showToast('Hủy lượt đặt thành công!', 'success');
      
      if (onUpdate) {
        onUpdate();
      }
      
      setSelectedLocker(null);
      setIsCancelDialogOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi hủy lượt đặt', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi hủy lượt đặt');
    } finally {
      setLoading(null);
    }
  };

  const filteredAndSortedLockers = useMemo(() => {
    // Define sort order priority
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

    return myLockers
      .filter(item => {
        const matchesFilter =
          filters.status === 'all' ||
          (filters.status === 'pending' && item.booking.status === 'stored' && item.booking.paymentStatus === 'pending') ||
          (filters.status === 'paid' && item.booking.status === 'stored' && item.booking.paymentStatus === 'paid') ||
          (filters.status === 'active' && item.booking.status === 'active');

        const matchesSearch = item.locker.lockerId.toLowerCase().includes(filters.searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => getSortPriority(a) - getSortPriority(b));
  }, [myLockers, filters]);

  const handleFilterChange = (id: string, value: string) => {
    const newId = id === 'status' ? 'status' : id;
    setFilters(prev => ({ ...prev, [newId]: value }));
  };

  const filterConfig: FilterConfig[] = [
    { id: 'searchTerm', type: 'search', placeholder: 'Tìm theo mã tủ...' },
    {
      id: 'status',
      type: 'select',
      placeholder: 'Lọc theo trạng thái',
      options: [{ value: 'all', label: 'Tất cả' }, { value: 'paid', label: 'Đã thanh toán' }, { value: 'pending', label: 'Chưa thanh toán' }, { value: 'active', label: 'Chưa dùng' }],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Tủ của tôi</h1>
        <p className="text-gray-600">Quản lý tất cả các tủ bạn đang sử dụng</p>
      </div>

      {/* Filters and Search */}
      <FilterBar
        filters={filterConfig}
        filterValues={{ searchTerm: filters.searchTerm, status: filters.status }}
        onFilterChange={handleFilterChange}
        gridClass="grid md:grid-cols-3 gap-4"
        className="p-4 mb-6"
      />

      <div className="grid md:grid-cols-3 gap-4">
        {filteredAndSortedLockers.length > 0 ? (
          filteredAndSortedLockers.map((mylocker) => (
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
                  {mylocker.booking.paymentStatus === 'active' ? (
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
                <Button className="w-full" variant="default" onClick={() => setSelectedLocker(mylocker)}>
                  Chi tiết
                </Button>
              ) : mylocker.booking.paymentStatus === 'pending' ? (
                <Button className="w-full" variant="default" onClick={() => { setSelectedLocker(mylocker); setPaymentView('summary'); }}>
                  Trả tủ
                </Button>
              ) : mylocker.booking.paymentStatus === 'paid' ? (
                <Button className="w-full" variant="default" onClick={() => setSelectedLocker(mylocker)}>
                  Mở tủ
                </Button>
              ) : (
                <Button className="w-full" variant="default" onClick={() => setSelectedLocker(mylocker)}>
                  Không có
                </Button>
              )}
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {myLockers.length === 0 ? "Bạn chưa có tủ nào." : "Không tìm thấy tủ nào phù hợp với bộ lọc."}
            </p>
          </div>
        )}
      </div>
      <div>
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận hủy lượt đặt</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn hủy lượt đặt cho tủ {selectedLocker?.locker?.lockerId}? Thao tác này sẽ giải phóng tủ và không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={loading === 'cancel'}>
                Không
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={loading === 'cancel'}>
                {loading === 'cancel' ? 'Đang hủy...' : 'Có, hủy tủ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog open={!!selectedLocker} onOpenChange={(open: boolean) => { if (!open) { setSelectedLocker(null); setPaymentView(null); } }}>
          <DialogContent className="sm:max-w-md">
            {paymentView === 'summary' && selectedLocker ? (
              paymentMode === 'real' ? (
                <RealLockerPaymentCard
                  lockerItem={selectedLocker}
                  amount={calculateCost(selectedLocker)}
                  usageTime={formatDate(selectedLocker.booking?.startTime)}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  isPaying={isPayingWithMoMo || isPayingWithPayPal || isPayingWithVNPay}
                  onPay={paymentMethod === 'paypal' ? handlePayWithPayPal : paymentMethod === 'vnpay' ? handlePayWithVNPay : handlePayWithMoMo}
                />
              ) : (
                <DemoPayment
                  lockerItem={selectedLocker}
                  amount={calculateCost(selectedLocker)}
                  usageTime={formatDate(selectedLocker.booking?.startTime)}
                  onSuccess={async () => {
                    setIsConfirmingPayment(true);
                    try {
                      showToast('Payment successful. Locker is opening.', 'success');
                      await fetch('/api/lockers/resident/payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId: selectedLocker.booking._id, paymentMethod: 'virtual' }),
                      });
                      await fetch('/api/lockers/resident/open', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId: selectedLocker.booking._id }),
                      });
                      if (onUpdate) {
                        onUpdate();
                      }
                      setPaymentView('success');
                    } finally {
                      setIsConfirmingPayment(false);
                    }
                  }}
                />
              )
            ) : paymentView === 'success' ? (
              paymentMode === 'real' ? (
                <RealPaymentSuccessState isProcessing={isConfirmingPayment} />
              ) : (
                <RealPaymentSuccessState isProcessing={isConfirmingPayment} />
              )
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Chi tiết tủ {selectedLocker?.locker?.lockerId ?? ''}</DialogTitle>
                  <DialogDescription>Thông tin chi tiết và các tùy chọn cho tủ của bạn</DialogDescription>
                </DialogHeader>

                {selectedLocker ? (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Mã tủ</p>
                        <p className="text-gray-900">{selectedLocker.locker?.lockerId ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tòa</p>
                        <p className="text-gray-900">{selectedLocker.locker?.building ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Block</p>
                        <p className="text-gray-900">{selectedLocker.locker?.block ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái đặt</p>
                        {selectedLocker.booking?.status === 'active' ? (
                          <p className="text-gray-900">Chưa dùng</p>
                        ) : selectedLocker.booking?.status === 'stored' ? (
                          <p className="text-gray-900">Đã dùng</p>
                        ) : (
                          <p className="text-gray-900">Không có</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian bắt đầu</p>
                        <p className="text-gray-900">{formatDate(selectedLocker.booking?.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian kết thúc</p>
                        <p className="text-gray-900">{formatDate(selectedLocker.booking?.endTime)}</p>
                      </div>
                      {selectedLocker.booking?.status === 'stored' && selectedLocker.booking?.paymentStatus === 'paid' && (
                        <div>
                          <p className="text-sm text-gray-500">Thời gian lấy đồ còn lại</p>
                          {selectedLocker.booking?.pickupExpiryTime ? (
                            <p className={`text-gray-900 ${getRemainingPickupTime(selectedLocker.booking) !== null && getRemainingPickupTime(selectedLocker.booking)! <= 0 ? 'text-red-600 font-semibold' : 'text-orange-600 font-semibold'}`}>
                              {formatRemainingTime(getRemainingPickupTime(selectedLocker.booking)) || 'Đã hết hạn'}
                            </p>
                          ) : (
                            <p className="text-red-600 font-semibold">Chưa có thời gian hết hạn</p>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Số tiền</p>
                        <p className="text-blue-600">
                          {selectedLocker && selectedLocker.booking?.status === 'stored'
                            ? calculateCost(selectedLocker).toLocaleString()
                            : (selectedLocker.booking?.cost || 0).toLocaleString()}đ
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                        {selectedLocker.booking?.paymentStatus === 'paid' ? (
                          <Badge className="bg-green-100 text-green-700">Đã thanh toán</Badge>
                        ) : selectedLocker.booking?.paymentStatus === 'pending' ? (
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
              </>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            {paymentView === null && (
              <DialogFooter className="flex-col sm:flex-col gap-2">
                {selectedLocker && selectedLocker.booking?.status === 'active' ? (
                // GRID 2x2 cho trạng thái 'active'
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleOpen} disabled={loading !== null}>
                    <Unlock className="w-4 h-4 mr-2" />
                    {loading === 'open' ? 'Đang mở...' : 'Mở tủ'}
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleLock} disabled={loading !== null}>
                    <Lock className="w-4 h-4 mr-2" />
                    {loading === 'lock' ? 'Đang khóa...' : 'Khóa tủ'}
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => setIsCancelDialogOpen(true)} disabled={loading !== null}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Hủy tủ
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => { if (selectedLocker) { router.push(`/resident/report?lockerId=${selectedLocker.locker.lockerId}&locker_id=${selectedLocker.locker._id}`); } }} disabled={loading !== null}>
                    Báo Cáo Lỗi
                  </Button>
                </div>
                ) : selectedLocker && selectedLocker.booking?.status === 'stored' ? (
                // Layout dọc cho trạng thái 'stored'
                <>
                  {selectedLocker.booking?.paymentStatus === 'pending' ? null : (
                    <>
                      {getRemainingPickupTime(selectedLocker.booking) !== null && getRemainingPickupTime(selectedLocker.booking)! <= 0 ? (
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
                          disabled={loading !== null}
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          {loading === 'open' ? 'Đang mở...' : 'Mở tủ'}
                        </Button>
                      )}
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      if (selectedLocker) {
                        router.push(`/resident/report?lockerId=${selectedLocker.locker.lockerId}&locker_id=${selectedLocker.locker._id}`);
                      }
                    }}
                    disabled={loading !== null}
                  >
                    Báo Cáo Lỗi
                  </Button>
                </>
                ) : null}
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

