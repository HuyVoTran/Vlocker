import { Package, MapPin, Ruler, Edit, Lock, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from 'react';

interface Locker {
  id: string;
  location: string;
  block: string;
  size: string;
  dimensions: string;
  status: string;
  price: string;
}

export default function AvailableLockers() {
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);

  const availableLockers: Locker[] = [
    {
      id: 'L102',
      location: 'Tòa A - Tầng 1',
      block: 'A1',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      status: 'active',
      price: '50,000đ/tháng'
    },
    {
      id: 'L105',
      location: 'Tòa A - Tầng 1',
      block: 'A1',
      size: 'Vừa',
      dimensions: '40x40x60cm',
      status: 'active',
      price: '70,000đ/tháng'
    },
    {
      id: 'L108',
      location: 'Tòa A - Tầng 1',
      block: 'A1',
      size: 'Lớn',
      dimensions: '50x50x80cm',
      status: 'maintenance',
      price: '100,000đ/tháng'
    },
    {
      id: 'L256',
      location: 'Tòa B - Tầng 1',
      block: 'B1',
      size: 'Vừa',
      dimensions: '40x40x60cm',
      status: 'active',
      price: '70,000đ/tháng'
    },
    {
      id: 'L257',
      location: 'Tòa B - Tầng 1',
      block: 'B1',
      size: 'Lớn',
      dimensions: '50x50x80cm',
      status: 'active',
      price: '100,000đ/tháng'
    },
    {
      id: 'L260',
      location: 'Tòa B - Tầng 2',
      block: 'B2',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      status: 'locked',
      price: '50,000đ/tháng'
    },
    {
      id: 'L378',
      location: 'Tòa C - Tầng 2',
      block: 'C2',
      size: 'Lớn',
      dimensions: '50x50x80cm',
      status: 'active',
      price: '100,000đ/tháng'
    },
    {
      id: 'L380',
      location: 'Tòa C - Tầng 2',
      block: 'C2',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      status: 'active',
      price: '50,000đ/tháng'
    },
    {
      id: 'L421',
      location: 'Tòa A - Tầng 2',
      block: 'A2',
      size: 'Vừa',
      dimensions: '40x40x60cm',
      status: 'active',
      price: '70,000đ/tháng'
    },
    {
      id: 'L422',
      location: 'Tòa A - Tầng 2',
      block: 'A2',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      status: 'maintenance',
      price: '50,000đ/tháng'
    }
  ];

  const filteredLockers = availableLockers.filter(locker => {
    const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
    const matchesSize = filterSize === 'all' || locker.size === filterSize;
    return matchesBlock && matchesSize;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-700">Bảo trì</Badge>;
      case 'locked':
        return <Badge className="bg-red-100 text-red-700">Tạm khóa</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Không xác định</Badge>;
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Nhỏ':
        return 'text-blue-600';
      case 'Vừa':
        return 'text-green-600';
      case 'Lớn':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý tủ trống</h1>
        <p className="text-gray-600">Theo dõi và quản lý trạng thái các tủ chưa được sử dụng</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng tủ trống</p>
              <p className="text-gray-900">{availableLockers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Hoạt động</p>
              <p className="text-gray-900">{availableLockers.filter(l => l.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Bảo trì</p>
              <p className="text-gray-900">{availableLockers.filter(l => l.status === 'maintenance').length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tạm khóa</p>
              <p className="text-gray-900">{availableLockers.filter(l => l.status === 'locked').length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
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
              <SelectItem value="C2">Tòa C2</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSize} onValueChange={setFilterSize}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo kích thước" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kích thước</SelectItem>
              <SelectItem value="Nhỏ">Nhỏ</SelectItem>
              <SelectItem value="Vừa">Vừa</SelectItem>
              <SelectItem value="Lớn">Lớn</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Tìm kiếm theo mã tủ..." className="md:col-span-2" />
        </div>
      </Card>

      {/* Lockers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã tủ</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Block/Tòa</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Giá thuê</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLockers.map((locker) => (
              <TableRow key={locker.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>{locker.id}</span>
                  </div>
                </TableCell>
                <TableCell>{locker.location}</TableCell>
                <TableCell>
                  <Badge variant="outline">{locker.block}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className={getSizeColor(locker.size)}>{locker.size}</p>
                    <p className="text-xs text-gray-500">{locker.dimensions}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-blue-600">{locker.price}</span>
                </TableCell>
                <TableCell>{getStatusBadge(locker.status)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLocker(locker)}
                      >
                        Quản lý
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Quản lý tủ {selectedLocker?.id}</DialogTitle>
                        <DialogDescription>
                          Thay đổi trạng thái hoạt động của tủ
                        </DialogDescription>
                      </DialogHeader>
                      {selectedLocker && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Mã tủ</p>
                              <p className="text-gray-900">{selectedLocker.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Vị trí</p>
                              <p className="text-gray-900">{selectedLocker.location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Block/Tòa</p>
                              <p className="text-gray-900">{selectedLocker.block}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Kích thước</p>
                              <p className="text-gray-900">{selectedLocker.size} ({selectedLocker.dimensions})</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Giá thuê</p>
                              <p className="text-blue-600">{selectedLocker.price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Trạng thái hiện tại</p>
                              {getStatusBadge(selectedLocker.status)}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Thay đổi trạng thái</p>
                            <Select defaultValue={selectedLocker.status}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="maintenance">Bảo trì</SelectItem>
                                <SelectItem value="locked">Tạm khóa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button variant="outline">Hủy</Button>
                        <Button>Lưu thay đổi</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
