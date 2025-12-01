import { User, Mail, Phone, MapPin, Edit, Calendar, Package } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from './ui/badge';
import { useState } from 'react';

interface ProfileProps {
  userRole: 'resident' | 'manager' | null;
}

export default function Profile({ userRole }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const residentData = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    block: 'A1',
    address: 'Căn hộ 105, Tòa A',
    joinDate: '01/03/2024'
  };

  const managerData = {
    name: 'Quản lý Tòa A',
    email: 'manager.toaa@vlocker.vn',
    phone: '1900-xxxx',
    block: 'Tòa A',
    address: 'Văn phòng quản lý - Tầng trệt',
    joinDate: '01/01/2024'
  };

  const userData = userRole === 'resident' ? residentData : managerData;

  const activityHistory = [
    {
      id: 1,
      date: '15/11/2025',
      time: '14:30',
      action: 'Mở tủ L001',
      status: 'success'
    },
    {
      id: 2,
      date: '14/11/2025',
      time: '09:15',
      action: 'Thanh toán tủ L045',
      status: 'success'
    },
    {
      id: 3,
      date: '13/11/2025',
      time: '16:45',
      action: 'Đăng ký tủ L089',
      status: 'success'
    },
    {
      id: 4,
      date: '10/11/2025',
      time: '11:20',
      action: 'Mở tủ L001',
      status: 'success'
    },
    {
      id: 5,
      date: '08/11/2025',
      time: '18:30',
      action: 'Gửi báo cáo sự cố',
      status: 'pending'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 md:col-span-1">
          <div className="text-center mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {userData.name.charAt(0)}
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
              <span className="text-gray-700">Tham gia: {userData.joinDate}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {userRole === 'resident' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Thống kê</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tủ đang sử dụng</span>
                <Badge className="bg-blue-100 text-blue-700">3 tủ</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tổng giao dịch</span>
                <Badge className="bg-green-100 text-green-700">24</Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Information Form */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">Thông tin cá nhân</h3>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
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
                defaultValue={userData.name}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={userData.email}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                defaultValue={userData.phone}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="block">Block/Tòa</Label>
              <Input
                id="block"
                defaultValue={userData.block}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                defaultValue={userData.address}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h4 className="text-gray-900 mb-4">Đổi mật khẩu</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <Input
                  id="current-password"
                  type="password"
                  disabled={!isEditing}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  disabled={!isEditing}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900">Lịch sử hoạt động</h3>
            <p className="text-sm text-gray-500">Các hoạt động gần đây của bạn</p>
          </div>
          <Button variant="outline">Xem tất cả</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Giờ</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityHistory.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.date}</TableCell>
                <TableCell>{activity.time}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{activity.action}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {activity.status === 'success' ? (
                    <Badge className="bg-green-100 text-green-700">Thành công</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">Đang xử lý</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
