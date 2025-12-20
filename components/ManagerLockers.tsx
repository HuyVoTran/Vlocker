import { Package, Clock, User, Phone, Mail, MapPin, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from 'react';

interface LockerDetails {
  id: string;
  user: string;
  block: string;
  location: string;
  email: string;
  phone: string;
  // Reserved
  reservedDate?: string;
  reservedTime?: string;
  // In Use
  usedTime?: string;
  price?: string;
  size?: string;
}

export default function ManagerLockers() {
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLocker, setSelectedLocker] = useState<LockerDetails | null>(null);

  const reservedLockers = [
    {
      id: 'L234',
      user: 'Trần Thị B',
      block: 'A1',
      location: 'Tòa A - Tầng 1',
      reservedDate: '15/11/2025',
      reservedTime: '2 ngày',
      email: 'tranthib@email.com',
      phone: '0901234567'
    },
    {
      id: 'L456',
      user: 'Lê Văn C',
      block: 'B2',
      location: 'Tòa B - Tầng 2',
      reservedDate: '14/11/2025',
      reservedTime: '3 ngày',
      email: 'levanc@email.com',
      phone: '0912345678'
    },
    {
      id: 'L678',
      user: 'Phạm Thị D',
      block: 'C1',
      location: 'Tòa C - Tầng 1',
      reservedDate: '15/11/2025',
      reservedTime: '1 ngày',
      email: 'phamthid@email.com',
      phone: '0923456789'
    }
  ];

  const inUseLockers = [
    {
      id: 'L001',
      user: 'Nguyễn Văn A',
      block: 'A1',
      location: 'Tòa A - Tầng 1',
      usedTime: '2 tháng 15 ngày',
      price: '50,000đ',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      size: 'Nhỏ'
    },
    {
      id: 'L045',
      user: 'Trần Văn B',
      block: 'B2',
      location: 'Tòa B - Tầng 2',
      usedTime: '1 tháng 7 ngày',
      price: '70,000đ',
      email: 'tranvanb@email.com',
      phone: '0912345678',
      size: 'Vừa'
    },
    {
      id: 'L112',
      user: 'Lê Thị C',
      block: 'C1',
      location: 'Tòa C - Tầng 1',
      usedTime: '20 ngày',
      price: '100,000đ',
      email: 'lethic@email.com',
      phone: '0923456789',
      size: 'Lớn'
    },
    {
      id: 'L189',
      user: 'Phạm Văn D',
      block: 'A2',
      location: 'Tòa A - Tầng 2',
      usedTime: '3 tháng 5 ngày',
      price: '50,000đ',
      email: 'phamvand@email.com',
      phone: '0934567890',
      size: 'Nhỏ'
    },
    {
      id: 'L256',
      user: 'Hoàng Thị E',
      block: 'B1',
      location: 'Tòa B - Tầng 1',
      usedTime: '1 tháng 12 ngày',
      price: '70,000đ',
      email: 'hoangthie@email.com',
      phone: '0945678901',
      size: 'Vừa'
    }
  ];

  const filteredReserved = reservedLockers.filter(locker => {
    const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
    return matchesBlock;
  });

  const filteredInUse = inUseLockers.filter(locker => {
    const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
    return matchesBlock;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý tủ đã đặt & đã dùng</h1>
        <p className="text-gray-600">Theo dõi và quản lý tình trạng sử dụng tủ</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Select value={filterBlock} onValueChange={setFilterBlock}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo block/tòa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả block</SelectItem>
              <SelectItem value="A1">Tòa A1</SelectItem>
              <SelectItem value="A2">Tòa A2</SelectItem>
              <SelectItem value="B1">Tòa B1</SelectItem>
              <SelectItem value="B2">Tòa B2</SelectItem>
              <SelectItem value="C1">Tòa C1</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="reserved">Đã đặt</SelectItem>
              <SelectItem value="in-use">Đang dùng</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Tìm kiếm theo mã tủ hoặc người dùng..." />
        </div>
      </Card>

      <Tabs defaultValue="reserved" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="reserved">
            Tủ đã đặt ({filteredReserved.length})
          </TabsTrigger>
          <TabsTrigger value="in-use">
            Tủ đang dùng ({filteredInUse.length})
          </TabsTrigger>
        </TabsList>

        {/* Reserved Lockers */}
        <TabsContent value="reserved">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã tủ</TableHead>
                  <TableHead>Người đặt</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Thời gian đặt</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReserved.map((locker) => (
                  <TableRow key={locker.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                          <Package className="w-4 h-4 text-yellow-600" />
                        </div>
                        <span>{locker.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{locker.user}</TableCell>
                    <TableCell>
                      <div>
                        <p>{locker.location}</p>
                        <p className="text-sm text-gray-500">Block {locker.block}</p>
                      </div>
                    </TableCell>
                    <TableCell>{locker.reservedDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{locker.reservedTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedLocker(locker)}
                            >
                              Chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Chi tiết tủ {selectedLocker?.id}</DialogTitle>
                              <DialogDescription>
                                Thông tin người đặt và tủ
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLocker && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Người đặt</p>
                                    <p className="text-gray-900">{selectedLocker.user}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Vị trí</p>
                                    <p className="text-gray-900">{selectedLocker.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="text-gray-900 text-sm">{selectedLocker.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                                    <p className="text-gray-900">{selectedLocker.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                                    <p className="text-gray-900">{selectedLocker.reservedDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Thời gian đặt</p>
                                    <p className="text-gray-900">{selectedLocker.reservedTime}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <X className="w-4 h-4 mr-1" />
                          Hủy
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* In Use Lockers */}
        <TabsContent value="in-use">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã tủ</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Thời gian sử dụng</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInUse.map((locker) => (
                  <TableRow key={locker.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <span>{locker.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{locker.user}</TableCell>
                    <TableCell>
                      <div>
                        <p>{locker.location}</p>
                        <p className="text-sm text-gray-500">Block {locker.block}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{locker.usedTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600">{locker.price}</span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLocker(locker)}
                          >
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Chi tiết tủ {selectedLocker?.id}</DialogTitle>
                            <DialogDescription>
                              Thông tin người dùng và tủ
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLocker && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Người dùng</p>
                                  <p className="text-gray-900">{selectedLocker.user}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Kích thước</p>
                                  <p className="text-gray-900">{selectedLocker.size}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Vị trí</p>
                                  <p className="text-gray-900">{selectedLocker.location}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Block</p>
                                  <p className="text-gray-900">{selectedLocker.block}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Email</p>
                                  <p className="text-gray-900 text-sm">{selectedLocker.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                                  <p className="text-gray-900">{selectedLocker.phone}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Thời gian sử dụng</p>
                                  <p className="text-gray-900">{selectedLocker.usedTime}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Số tiền</p>
                                  <p className="text-blue-600">{selectedLocker.price}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
