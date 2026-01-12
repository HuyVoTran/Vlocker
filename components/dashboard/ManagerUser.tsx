'use client';
import { User, Edit } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useToast } from '../ui/toast-context';
import { FilterBar, FilterConfig } from '../ui/FilterBar';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch data');
  }
  return json.data;
};

interface ResidentUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  building?: string;
  block?: string;
  floor?: string;
  unit?: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export default function ManagerUser() {
  const [filters, setFilters] = useState({
    searchTerm: '',
    building: 'all',
    block: 'all',
  });
  const [selectedUser, setSelectedUser] = useState<ResidentUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ building: '', block: '', floor: '', unit: '' });
  const { showToast } = useToast();

  const { data: allUsers = [], error, isLoading, mutate } = useSWR<ResidentUser[]>(
    '/api/users',
    fetcher,
    { revalidateOnFocus: false }
  );

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const search = filters.searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.phone && user.phone.includes(search));

      const matchesBuilding =
        filters.building === "all" || user.building === filters.building;
      const matchesBlock = filters.block === "all" || user.block === filters.block;

      return matchesSearch && matchesBuilding && matchesBlock;
    });
  }, [allUsers, filters]);

  const uniqueBuildings = useMemo(() => {
    return Array.from(new Set(allUsers.map(u => u.building).filter((b): b is string => !!b))).sort();
  }, [allUsers]);

  const uniqueBlocks = useMemo(() => {
    return Array.from(new Set(allUsers.map(u => u.block).filter((b): b is string => !!b))).sort();
  }, [allUsers]);

  const formatAddress = (user: ResidentUser) => {
    if (!user.building && !user.block) return 'Chưa cập nhật';
    return [
      user.unit ? `Căn hộ ${user.unit}` : '',
      user.floor ? `Tầng ${user.floor}` : '',
      user.block ? `Block ${user.block}` : '',
      user.building ? `Tòa ${user.building}` : '',
    ].filter(Boolean).join(', ');
  };

  const handleEditClick = (user: ResidentUser) => {
    setIsEditing(true);
    setEditData({
      building: user.building || '',
      block: user.block || '',
      floor: user.floor || '',
      unit: user.unit || '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id, ...editData }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Cập nhật địa chỉ thất bại.');
      }
      showToast('Cập nhật địa chỉ thành công!', 'success');
      mutate(); // Re-fetch data
      setSelectedUser(null);
      setIsEditing(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi.', 'error');
    }
  };

  const handleFilterChange = (id: string, value: string) => {
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const filterConfig: FilterConfig[] = [
    {
      id: 'searchTerm',
      type: 'search',
      placeholder: 'Tìm kiếm theo tên, email, hoặc SĐT...',
      className: 'md:col-span-1',
    },
    {
      id: 'building',
      type: 'select',
      placeholder: 'Lọc theo tòa nhà',
      options: [{ value: 'all', label: 'Tất cả tòa nhà' }, ...uniqueBuildings.map(b => ({ value: b, label: `Tòa ${b}` }))],
    },
    {
      id: 'block',
      type: 'select',
      placeholder: 'Lọc theo block',
      options: [{ value: 'all', label: 'Tất cả block' }, ...uniqueBlocks.map(b => ({ value: b, label: `Block ${b}` }))],
    },
  ];

  if (isLoading) return <div className="p-6">Đang tải danh sách người dùng...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error.message}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý người dùng</h1>
        <p className="text-gray-600">Xem và chỉnh sửa thông tin cư dân</p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfig}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        gridClass="grid md:grid-cols-3 gap-4"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Không có dữ liệu phù hợp.</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{user.email}</p>
                      <p className="text-gray-500">{user.phone || 'Chưa có SĐT'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={formatAddress(user)}>
                    {formatAddress(user)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) { setSelectedUser(null); setIsEditing(false); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và tùy chọn chỉnh sửa địa chỉ.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <Label>Họ tên</Label>
                  <p className="text-gray-900 mt-1">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <p className="text-gray-900 mt-1">{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <Label>Ngày tham gia</Label>
                  <p className="text-gray-900 mt-1">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>

                <div className="col-span-2">
                  <Label>Địa chỉ</Label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="building" className="text-xs text-gray-500">Tòa</Label>
                        <Input id="building" placeholder="Tòa" value={editData.building} onChange={e => setEditData({...editData, building: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="block" className="text-xs text-gray-500">Block</Label>
                        <Input id="block" placeholder="Block" value={editData.block} onChange={e => setEditData({...editData, block: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="floor" className="text-xs text-gray-500">Tầng</Label>
                        <Input id="floor" placeholder="Tầng" value={editData.floor} onChange={e => setEditData({...editData, floor: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="unit" className="text-xs text-gray-500">Căn hộ</Label>
                        <Input id="unit" placeholder="Căn hộ" value={editData.unit} onChange={e => setEditData({...editData, unit: e.target.value})} className="mt-1" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 mt-1">{formatAddress(selectedUser)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>Hủy</Button>
                <Button onClick={handleSave}>Lưu thay đổi</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setSelectedUser(null); setIsEditing(false); }}>Đóng</Button>
                <Button onClick={() => handleEditClick(selectedUser!)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa địa chỉ
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
