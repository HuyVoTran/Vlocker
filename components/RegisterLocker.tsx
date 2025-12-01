import { Package, MapPin, Ruler, DollarSign, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';

export default function RegisterLocker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterSize, setFilterSize] = useState('all');

  const availableLockers = [
    {
      id: 'L102',
      location: 'Tòa A - Tầng 1',
      block: 'A1',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      price: '50,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L105',
      location: 'Tòa A - Tầng 1',
      block: 'A1',
      size: 'Vừa',
      dimensions: '40x40x60cm',
      price: '70,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L256',
      location: 'Tòa B - Tầng 1',
      block: 'B1',
      size: 'Vừa',
      dimensions: '40x40x60cm',
      price: '70,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L257',
      location: 'Tòa B - Tầng 1',
      block: 'B1',
      size: 'Lớn',
      dimensions: '50x50x80cm',
      price: '100,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L378',
      location: 'Tòa C - Tầng 2',
      block: 'C2',
      size: 'Lớn',
      dimensions: '50x50x80cm',
      price: '100,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L380',
      location: 'Tòa C - Tầng 2',
      block: 'C2',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      price: '50,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L421',
      location: 'Tòa A - Tầng 2',
      block: 'A2',
      size: 'Vừa',
      dimensions: '40x40x60cm',
      price: '70,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L422',
      location: 'Tòa A - Tầng 2',
      block: 'A2',
      size: 'Nhỏ',
      dimensions: '30x30x40cm',
      price: '50,000đ/tháng',
      status: 'available'
    },
    {
      id: 'L589',
      location: 'Tòa B - Tầng 3',
      block: 'B3',
      size: 'Lớn',
      dimensions: '50x50x80cm',
      price: '100,000đ/tháng',
      status: 'available'
    }
  ];

  const filteredLockers = availableLockers.filter(locker => {
    const matchesSearch = locker.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         locker.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
    const matchesSize = filterSize === 'all' || locker.size === filterSize;
    return matchesSearch && matchesBlock && matchesSize;
  });

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Nhỏ':
        return 'bg-blue-100 text-blue-700';
      case 'Vừa':
        return 'bg-green-100 text-green-700';
      case 'Lớn':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Đăng ký tủ mới</h1>
        <p className="text-gray-600">Chọn tủ phù hợp với nhu cầu của bạn</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã tủ hoặc vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterBlock} onValueChange={setFilterBlock}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn block/tòa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả block</SelectItem>
              <SelectItem value="A1">Tòa A1</SelectItem>
              <SelectItem value="A2">Tòa A2</SelectItem>
              <SelectItem value="B1">Tòa B1</SelectItem>
              <SelectItem value="B3">Tòa B3</SelectItem>
              <SelectItem value="C2">Tòa C2</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSize} onValueChange={setFilterSize}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn kích thước" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kích thước</SelectItem>
              <SelectItem value="Nhỏ">Nhỏ</SelectItem>
              <SelectItem value="Vừa">Vừa</SelectItem>
              <SelectItem value="Lớn">Lớn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
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
              <p className="text-gray-900">50,000đ/tháng</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lockers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLockers.map((locker) => (
          <Card key={locker.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-900">Tủ {locker.id}</p>
                  <Badge className={getSizeColor(locker.size)}>{locker.size}</Badge>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Trống</Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-900">{locker.location}</p>
                  <p className="text-xs text-gray-500">Block {locker.block}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{locker.dimensions}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-blue-600">{locker.price}</span>
              </div>
            </div>

            <Button className="w-full">
              Thuê tủ ngay
            </Button>
          </Card>
        ))}
      </div>

      {filteredLockers.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 mb-2">Không tìm thấy tủ phù hợp</p>
          <p className="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
        </Card>
      )}
    </div>
  );
}
