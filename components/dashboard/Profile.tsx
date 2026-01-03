import { Mail, Phone, MapPin, Edit, Calendar, Package } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from '../ui/toast-context';

// Định nghĩa các kiểu dữ liệu sẽ lấy về
interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  building?: string;
  block?: string;
  createdAt?: string;
  floor?: string;
  unit?: string;
}

interface Activity {
  _id: string;
  createdAt: string;
  status: string;
  lockerId?: {
    lockerId: string;
  };
}

// Hàm hỗ trợ định dạng ngày giờ
function formatDateTime(date?: string) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
}

// Hàm hỗ trợ định dạng chỉ ngày
function formatDateOnly(date?: string) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return date;
  }
}

// Hàm hỗ trợ tạo mô tả cho hoạt động
function getActivityDescription(activity: Activity): string {
    switch (activity.status) {
        case 'active':
            return `Đăng ký tủ ${activity.lockerId?.lockerId || 'N/A'}`;
        case 'stored':
            return `Lưu đồ vào tủ ${activity.lockerId?.lockerId || 'N/A'}`;
        case 'completed':
            return `Hoàn tất sử dụng tủ ${activity.lockerId?.lockerId || 'N/A'}`;
        case 'cancelled':
            return `Hủy đặt tủ ${activity.lockerId?.lockerId || 'N/A'}`;
        default:
            return `Hoạt động với tủ ${activity.lockerId?.lockerId || 'N/A'}`;
    }
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho dữ liệu profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);

  // State cho các trường trong form
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const { showToast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProfileData = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch('/api/profile');
          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Không thể tải dữ liệu profile.');
          }

          const { profile: userProfile, stats: userStats, activities: userActivities } = json.data;
          setProfile(userProfile);
          setStats(userStats);
          setActivities(userActivities);
          setFormData({
            name: userProfile.name || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
          });

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    } else if (status === 'unauthenticated') {
        setLoading(false);
        setError("Bạn cần đăng nhập để xem trang này.");
    }
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showToast("Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.", "warning");
      return;
    }
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Đổi mật khẩu thất bại.");
      }

      showToast("Đổi mật khẩu thành công!", "success");
      setPasswordData({ currentPassword: '', newPassword: '' }); // Reset form
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Đã xảy ra lỗi.", "error");
    }
  };

  const handleSaveChanges = async () => {
    try {
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Cập nhật thất bại.");
        }

        showToast("Cập nhật thông tin thành công!", "success");
        setProfile(json.data); // Cập nhật state với dữ liệu mới từ server
        setIsEditing(false);
    } catch (err) {
        showToast(err instanceof Error ? err.message : "Đã xảy ra lỗi.", "error");
    }
  };

  if (loading || status === 'loading') {
    return <div className="p-6">Đang tải thông tin cá nhân...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  }

  if (!profile) {
    return <div className="p-6 text-gray-500">Không có dữ liệu để hiển thị.</div>;
  }

  const fullAddress = [
    profile.unit ? `Căn hộ ${profile.unit}` : '',
    profile.floor ? `Tầng ${profile.floor}` : '',
    profile.block ? `Block ${profile.block}` : '',
    profile.building ? `Tòa ${profile.building}` : '',
  ].filter(Boolean).join(', ');

  const userRole = session?.user?.role;
  const userData = {
    name: profile.name,
    email: profile.email,
    phone: profile.phone || 'Chưa cập nhật',
    block: profile.block || 'N/A', // Giữ lại để hiển thị riêng nếu cần
    address: fullAddress || 'Chưa cập nhật',
    joinDate: formatDateOnly(profile.createdAt)
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin và hoạt động của bạn</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 md:col-span-1">
          <div className="text-center mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {userData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-gray-900 mb-1">{userData.name}</h2>
            <p className="text-sm text-gray-500">
              {userRole === 'resident' ? 'Cư dân' : 'Quản lý'}
            </p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{userData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{userData.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{userData.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">Tham gia từ: {userData.joinDate}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {userRole === 'resident' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Thống kê</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tủ đang sử dụng</span>
                <Badge className="bg-blue-100 text-blue-700">{stats.activeBookings} tủ</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tổng giao dịch</span>
                <Badge className="bg-green-100 text-green-700">{stats.totalBookings}</Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Information Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Thông tin cá nhân</h3>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => {
                  if (isEditing) {
                    handleSaveChanges();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? 'Lưu thay đổi' : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true} // Email thường không thể chỉnh sửa
                  className="mt-2 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-2"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Địa chỉ chi tiết</Label>
                <div className="grid md:grid-cols-4 gap-4 mt-2">
                    <div>
                        <Label htmlFor="building" className="text-xs text-gray-500">Tòa nhà</Label>
                        <Input id="building" defaultValue={profile.building || 'N/A'} disabled={true} className="mt-1 bg-gray-100" />
                    </div>
                    <div>
                        <Label htmlFor="block" className="text-xs text-gray-500">Block</Label>
                        <Input id="block" defaultValue={profile.block || 'N/A'} disabled={true} className="mt-1 bg-gray-100" />
                    </div>
                    <div>
                        <Label htmlFor="floor" className="text-xs text-gray-500">Tầng</Label>
                        <Input id="floor" defaultValue={profile.floor || 'N/A'} disabled={true} className="mt-1 bg-gray-100" />
                    </div>
                    <div>
                        <Label htmlFor="unit" className="text-xs text-gray-500">Số căn hộ</Label>
                        <Input id="unit" defaultValue={profile.unit || 'N/A'} disabled={true} className="mt-1 bg-gray-100" />
                    </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Đổi mật khẩu</h3>
              <Button onClick={handleUpdatePassword}>
                Lưu mật khẩu mới
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    type="password"
                    className="mt-2"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    type="password"
                    className="mt-2"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
              </div>
          </Card>
        </div>
      </div>

      {/* Activity History */}
      {userRole === 'resident' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900">Lịch sử hoạt động</h3>
              <p className="text-sm text-gray-500">5 hoạt động gần đây nhất của bạn</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/history')}>
              Xem tất cả
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Hoạt động</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? activities.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell>{formatDateTime(activity.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{getActivityDescription(activity)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                        activity.status === 'completed' ? "bg-green-100 text-green-700"
                        : activity.status === 'cancelled' ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }>
                        {activity.status === 'active' && 'Đang hoạt động'}
                        {activity.status === 'stored' && 'Đã lưu đồ'}
                        {activity.status === 'completed' && 'Hoàn tất'}
                        {activity.status === 'cancelled' && 'Đã hủy'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    Chưa có hoạt động nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
