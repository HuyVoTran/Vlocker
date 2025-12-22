import { Package, Edit, Lock, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import useSWR from 'swr';
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
} from "./ui/dialog";
import { useState, useMemo } from 'react';
import { useToast } from './ui/toast-context';

// Hàm fetcher chung cho SWR (tái sử dụng từ các component khác)
const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as Error & { info?: unknown; status?: number };
    try {
      error.info = await res.json();
    } catch {
      // Bỏ qua nếu response body không phải là JSON
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

// Cập nhật interface Locker để khớp với database model
interface Locker {
  _id: string; // ID từ MongoDB
  lockerId: string; // Mã tủ hiển thị
  building: string;
  block: string;
  size: string;
  floor?: string | number;
  price?: string | number;
  status: string;
}

export default function AvailableLockers() {
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch tất cả các tủ không đang được cư dân thuê
  const { data: allLockers = [], error: fetchError, isLoading: fetchLoading, mutate } = useSWR<Locker[]>(
    '/api/lockers/manager/available',
    fetcher,
    { revalidateOnFocus: false }
  );

  // Lấy danh sách block và size duy nhất từ dữ liệu đã fetch
  const uniqueBuildings = useMemo(() => {
    const buildings = Array.from(new Set(allLockers.map(locker => locker.building)));
    return buildings.sort();
  }, [allLockers]);

  const uniqueBlocks = useMemo(() => {
    const blocks = Array.from(new Set(allLockers.map(locker => locker.block)));
    return blocks.sort();
  }, [allLockers]);

  const filteredLockers = allLockers.filter((locker: Locker) => {
    const matchesBuilding = filterBuilding === 'all' || locker.building === filterBuilding;
    const matchesBlock = filterBlock === 'all' || locker.block === filterBlock;
    const matchesStatus = filterStatus === 'all' || locker.status === filterStatus;
    const matchesSearch = locker.lockerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          locker.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          locker.block.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBuilding && matchesBlock && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-700">Bảo trì</Badge>;
      case 'locked':
        return <Badge className="bg-red-100 text-red-700">Tạm khóa</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Không xác định</Badge>;
    }
  };

  const handleUpdateLockerStatus = async (lockerId: string, newStatus: string) => {
    if (!selectedLocker) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/lockers/manager/update-status', { // API endpoint mới
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockerId, newStatus }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Lỗi cập nhật trạng thái tủ');
      }

      showToast('Cập nhật trạng thái tủ thành công!', 'success');
      mutate(); // Re-fetch dữ liệu để cập nhật danh sách
      setSelectedLocker(null); // Đóng dialog
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái tủ', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Helper để tạo chuỗi vị trí
  const getLocationString = (locker: Locker) => {
    return `Tòa ${locker.building} - Block ${locker.block}`;
  };

  if (fetchLoading) {
    return <div className="p-6 max-w-7xl mx-auto">Đang tải dữ liệu tủ...</div>;
  }
  if (fetchError) {
    return <div className="p-6 max-w-7xl mx-auto text-red-600">Lỗi: {fetchError.message}</div>;
  }

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
              <p className="text-gray-500 text-sm mb-1">Tổng số tủ trống</p>
              <p className="text-gray-900">{allLockers.length}</p>
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
              <p className="text-gray-900">{allLockers.filter((l: Locker) => l.status === 'available').length}</p>
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
              <p className="text-gray-900">{allLockers.filter((l: Locker) => l.status === 'maintenance').length}</p>
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
              <p className="text-gray-900">{allLockers.filter((l: Locker) => l.status === 'locked').length}</p>
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
          <div className="relative">
            <Input
              placeholder="Tìm kiếm theo mã tủ, tòa, block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3"
            />
          </div>          <Select value={filterBuilding} onValueChange={setFilterBuilding}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo tòa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tòa</SelectItem>
              {uniqueBuildings.map(building => (
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
              {uniqueBlocks.map(block => (
                <SelectItem key={block} value={block}>{`Block ${block}`}</SelectItem>
              ))}
            </SelectContent>          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Hoạt động</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="locked">Tạm khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lockers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã tủ</TableHead>
              <TableHead>Vị trí</TableHead>              
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLockers.map((locker: Locker) => (
              <TableRow key={locker._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>{locker.lockerId}</span>
                  </div>
                </TableCell>
                <TableCell>{getLocationString(locker)}</TableCell>
                <TableCell>{getStatusBadge(locker.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLocker(locker)}
                  >
                    Quản lý
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog for managing a locker */}
      <Dialog open={!!selectedLocker} onOpenChange={(open) => !open && setSelectedLocker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quản lý tủ {selectedLocker?.lockerId}</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái hoạt động của tủ
            </DialogDescription>
          </DialogHeader>
          {selectedLocker && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã tủ</p>
                  <p className="text-gray-900">{selectedLocker.lockerId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vị trí</p>
                  <p className="text-gray-900">{getLocationString(selectedLocker)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Block/Tòa</p>
                  <p className="text-gray-900">{selectedLocker.block}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Kích thước</p>
                  <p className="text-gray-900">{selectedLocker.size}</p>
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
                <p className="text-sm text-gray-500 mb-2">Cập nhật trạng thái</p>
                <Select
                  defaultValue={selectedLocker.status}
                  onValueChange={(newStatus) => handleUpdateLockerStatus(selectedLocker._id, newStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Hoạt động</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="locked">Khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLocker(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
