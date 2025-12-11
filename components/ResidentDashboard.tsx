import { useState, useEffect } from "react";
import { Package, Clock, CreditCard, Plus, Smartphone } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
// import MyLockers from "./MyLockers";

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
}

export interface Booking {
  _id: string;
  userId: string;
  lockerId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  cost: number;
  paymentStatus: string;
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
    const [myLockers, setMyLockers] = useState<MyLockerItem[]>([]);
    const [availableLockers, setAvailableLockers] = useState<Locker[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
      // if (!user || !user._id) {
      //   console.log("User chưa sẵn sàng → chờ");
      //   return;
      // }

      async function loadData() {
        try {
          setLoading(true);
  
          // === Fetch My Locker (có cả locker + booking) ===
          const myRes = await fetch(`/api/resident/mylocker?userId=${user._id}`);
          const myJson = await myRes.json();
          setMyLockers(myJson.data || []);
  
          // === Fetch Available Lockers ===
          const availRes = await fetch(
            `/api/resident/available?building=${user.building}&block=${user.block}`
          );
          const availJson = await availRes.json();
          setAvailableLockers(availJson.data || []);
        } catch (err) {
          console.error("Error loading dashboard:", err);
        } finally {
          setLoading(false);
        }
      }
  
      loadData();
    }, [user]);
  
    if (loading) {
      return <div>Đang tải dữ liệu...</div>;
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
          {myLockers.map((mylocker) => (
            <Card key={mylocker.booking._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">Tủ {mylocker.locker.lockerId}</p>
                    <p className="text-sm text-gray-500">Tòa {mylocker.locker.building} - Block {mylocker.locker.block}</p>
                  </div>
                </div>
                {mylocker.booking.status === 'booked' ? (
                  <Badge className="bg-green-100 text-green-700">Đang thuê</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700">Chờ thanh toán</Badge>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{mylocker.booking.paymentStatus}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{mylocker.booking.cost.toLocaleString()}đ</span>
                </div>
              </div>
              {mylocker.booking.paymentStatus === 'stored' ? (
                <Button className="w-full" variant="default">
                  Thanh toán ngay
                </Button>
              ) : (
                <Button className="w-full" variant="outline">
                  Chi tiết
                </Button>
              )}
            </Card>
          ))}
        </div>
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
        <div className="grid md:grid-cols-3 gap-4">
          {availableLockers.map((availocker) => (
            <Card key={availocker.lockerId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-900">Tủ {availocker.lockerId}</p>
                  <p className="text-sm text-gray-500">Tòa {availocker.building} - Block {availocker.block}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  {availocker.status === 'available' ? (
                    <Badge className="bg-green-100 text-green-700">Trống</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">Đã được đặt</Badge>
                  )}
                </div>
              </div>
              <Button className="w-full" variant="default">
                Thuê tủ ngay
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
