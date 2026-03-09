import { Package, Edit, Lock, Play, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import useSWR from 'swr';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState, useMemo, useEffect } from 'react';
import { Label } from '../ui/label';
import { useToast } from '../ui/toast-context';
import { FilterBar, FilterConfig } from '../ui/FilterBar';

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

const formatSize = (size: string) => {
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

export default function AvailableLockers() {
  const [filters, setFilters] = useState({
    building: 'all',
    block: 'all',
    status: 'all',
    size: 'all',
    searchTerm: '',
  });
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { showToast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLockerData, setNewLockerData] = useState({
    building: '',
    block: '',
    size: 'M',
    floor: '',
    price: '10000',
  });

  // Fetch tất cả các tủ không đang được cư dân thuê
  const { data: allLockers = [], error: fetchError, isLoading: fetchLoading, mutate } = useSWR<Locker[]>(
    '/api/lockers/manager/available',
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const eventSource = new EventSource('/api/lockers/stream');
    const handleEvent = () => mutate();
    eventSource.addEventListener('locker', handleEvent as EventListener);
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [mutate]);

  // Lấy danh sách block và size duy nhất từ dữ liệu đã fetch
  const uniqueBuildings = useMemo(() => {
    const buildings = Array.from(new Set(allLockers.map(locker => locker.building)));
    return buildings.sort();
  }, [allLockers]);

  const uniqueBlocks = useMemo(() => {
    const blocks = Array.from(new Set(allLockers.map(locker => locker.block)));
    return blocks.sort();
  }, [allLockers]);

  const uniqueSizes = useMemo(() => {
    const sizes = Array.from(new Set(allLockers.map(locker => locker.size)));
    return sizes.sort();
  }, [allLockers]);

  const filteredLockers = allLockers.filter((locker: Locker) => {
    const matchesBuilding = filters.building === 'all' || locker.building === filters.building;
    const matchesBlock = filters.block === 'all' || locker.block === filters.block;
    const matchesStatus = filters.status === 'all' || locker.status === filters.status;
    const matchesSize = filters.size === 'all' || locker.size === filters.size;
    const matchesSearch = locker.lockerId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          locker.building.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          locker.block.toLowerCase().includes(filters.searchTerm.toLowerCase());
    return matchesBuilding && matchesBlock && matchesStatus && matchesSearch && matchesSize;
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

  const handleDeleteLocker = async () => {
    if (!selectedLocker) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/lockers/manager/available', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockerId: selectedLocker._id }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Xóa tủ thất bại.');
      }
      showToast('Xóa tủ thành công!', 'success');
      mutate(); // Re-fetch data
      setIsDeleteDialogOpen(false);
      setSelectedLocker(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa tủ.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNewLocker = async () => {
    if (!newLockerData.building || !newLockerData.block) {
      showToast('Vui lòng điền đầy đủ Tòa và Block.', 'error');
      return;
    }
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/lockers/manager/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLockerData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Thêm tủ mới thất bại.');
      }
      showToast('Thêm tủ mới thành công!', 'success');
      mutate(); // Re-fetch data
      setIsAddDialogOpen(false);
      setNewLockerData({ building: '', block: '', size: 'M', floor: '', price: '10000' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleNewLockerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLockerData({ ...newLockerData, [e.target.name]: e.target.value });
  };

  // Helper để tạo chuỗi vị trí
  const getLocationString = (locker: Locker) => {
    return `Tòa ${locker.building} - Block ${locker.block}`;
  };

  const handleFilterChange = (id: string, value: string) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const filterConfig: FilterConfig[] = [
    {
      id: 'searchTerm',
      type: 'search',
      placeholder: 'Tìm kiếm theo mã tủ, tòa, block...',
      icon: null,
      className: 'relative',
    },
    {
      id: 'building',
      type: 'select',
      placeholder: 'Lọc theo tòa',
      options: [
        { value: 'all', label: 'Tất cả tòa' },
        ...uniqueBuildings.map(b => ({ value: b, label: `Tòa ${b}` })),
      ],
    },
    {
      id: 'block',
      type: 'select',
      placeholder: 'Lọc theo block',
      options: [
        { value: 'all', label: 'Tất cả block' },
        ...uniqueBlocks.map(b => ({ value: b, label: `Block ${b}` })),
      ],
    },
    {
      id: 'size',
      type: 'select',
      placeholder: 'Lọc theo kích thước',
      options: [
        { value: 'all', label: 'Tất cả kích thước' },
        ...uniqueSizes.map(s => ({ value: s, label: formatSize(s) })),
      ],
    },
    { id: 'status', type: 'select', placeholder: 'Lọc theo trạng thái', options: [{ value: 'all', label: 'Tất cả trạng thái' }, { value: 'available', label: 'Hoạt động' }, { value: 'maintenance', label: 'Bảo trì' }, { value: 'locked', label: 'Tạm khóa' }] },
  ];

  if (fetchLoading) {
    return <div className="p-6 max-w-7xl mx-auto">Đang tải dữ liệu tủ...</div>;
  }
  if (fetchError) {
    return <div className="p-6 max-w-7xl mx-auto text-red-600">Lỗi: {fetchError.message}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Quản lý tủ trống</h1>
          <p className="text-gray-600">Theo dõi, quản lý trạng thái và thêm mới các tủ chưa được sử dụng</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm tủ mới
        </Button>
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
      <FilterBar
        filters={filterConfig}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        gridClass="grid md:grid-cols-5 gap-4"
      />

      {/* Lockers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã tủ</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Kích thước</TableHead>
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
                <TableCell>{formatSize(locker.size)}</TableCell>
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

      {/* Dialog for adding a new locker */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tủ khóa mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết cho tủ khóa mới. Mã tủ sẽ được tạo tự động theo định dạng TòaBlock-STT (ví dụ: A1-01).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building" className="text-right">Tòa</Label>
              <Input id="building" name="building" value={newLockerData.building} onChange={handleNewLockerInputChange} className="col-span-3" placeholder="VD: A" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="block" className="text-right">Block</Label>
              <Input id="block" name="block" value={newLockerData.block} onChange={handleNewLockerInputChange} className="col-span-3" placeholder="VD: 1" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">Tầng</Label>
              <Input id="floor" name="floor" value={newLockerData.floor} onChange={handleNewLockerInputChange} className="col-span-3" placeholder="VD: 12" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">Kích thước</Label>
              <Select name="size" value={newLockerData.size} onValueChange={(value) => setNewLockerData({ ...newLockerData, size: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn kích thước" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">{formatSize('S')}</SelectItem>
                  <SelectItem value="M">{formatSize('M')}</SelectItem>
                  <SelectItem value="L">{formatSize('L')}</SelectItem>
                  <SelectItem value="XL">{formatSize('XL')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Giá / ngày</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newLockerData.price}
                onChange={handleNewLockerInputChange}
                className="col-span-3"
                placeholder="VD: 10000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewLockerData({ building: '', block: '', size: 'M', floor: '', price: '10000' });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAddNewLocker} disabled={updatingStatus}>
              {updatingStatus ? 'Đang thêm...' : 'Thêm tủ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for delete confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tủ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn tủ {selectedLocker?.lockerId}? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={updatingStatus}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteLocker} disabled={updatingStatus}>
              {updatingStatus ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <p className="text-gray-900">{formatSize(selectedLocker.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Giá thuê</p>
                  <p className="text-blue-600">{selectedLocker.price ? `${Number(selectedLocker.price).toLocaleString('vi-VN')} VNĐ/Ngày` : '10,000 VNĐ/Ngày'}</p>
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
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tủ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
