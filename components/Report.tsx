'use client';
import { FileText, Upload, AlertCircle, CheckCircle, Clock, User, XCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
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
  DialogFooter,
} from "./ui/dialog";
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from './ui/toast-context';
import { useSearchParams, useRouter } from 'next/navigation';

interface ReportData {
  _id: string;
  reportId: string;
  createdAt: string;
  title: string;
  description: string;
  category: 'locker_error' | 'incident' | 'service_feedback' | 'other';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  userId?: {
    name: string;
    email: string;
  };
  lockerId?: {
    lockerId: string;
    building: string;
    block: string;
  } | null;
}

function ReportComponent() {
  const { data: session, status: sessionStatus } = useSession();
  const role = session?.user?.role;
  const searchParams = useSearchParams();
  const router = useRouter();

  // State cho danh sách báo cáo
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  // State cho form gửi báo cáo
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  // Helper functions
  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'locker_error': return 'Lỗi tủ';
      case 'incident': return 'Sự cố';
      case 'service_feedback': return 'Phản ánh dịch vụ';
      case 'other': return 'Khác';
      default: return cat;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Đang xử lý
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xử lý
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hủy
          </Badge>
        );
      default:
        return <Badge>Không xác định</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">Cao</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700">Trung bình</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-700">Thấp</Badge>;
      default:
        return <Badge>Không xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Data fetching
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      const fetchReports = async () => {
        try {
          setLoading(true);
          const res = await fetch('/api/reports');
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || 'Không thể tải lịch sử báo cáo.');
          }
          setReports(json.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
        } finally {
          setLoading(false);
        }
      };
      fetchReports();
    } else if (sessionStatus === 'unauthenticated') {
      setLoading(false);
      setError('Bạn cần đăng nhập để sử dụng chức năng này.');
    }
  }, [sessionStatus]);

  // Pre-fill form from URL query params
  useEffect(() => {
    if (searchParams) {
      const lockerIdParam = searchParams.get('lockerId');
      const locker_idParam = searchParams.get('locker_id');

      if (lockerIdParam && locker_idParam) {
        setTitle(`Báo cáo sự cố tủ ${lockerIdParam}`);
        setDescription(`Tôi gặp sự cố với tủ ${lockerIdParam}.\n\nVui lòng mô tả chi tiết sự cố của bạn ở đây:`);
        setCategory('locker_error');
        setPriority('medium');
      }
    }
  }, [searchParams]);

  // Form submission handler (for residents)
  const handleSubmitReport = async () => {
    if (!title || !description || !category || !priority) {
      showToast('Vui lòng điền đầy đủ tất cả các trường.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const locker_id = searchParams.get('locker_id');

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, priority, lockerId: locker_id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gửi báo cáo thất bại.');
      }
      showToast('Gửi báo cáo thành công!', 'success');
      // Thêm báo cáo mới vào đầu danh sách và reset form
      setReports(prev => [json.data, ...prev]);
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('');
      // Xóa query params khỏi URL sau khi gửi thành công
      router.replace(`/${role}/report`, { scroll: false });

    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status update handler (for managers)
  const handleStatusChange = async (reportId: string, newStatus: string) => {
    const originalReports = [...reports];
    // Cập nhật giao diện trước (optimistic update)
    setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: newStatus as ReportData['status'] } : r));

    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // `reportId` ở đây thực chất là `_id` của document
        body: JSON.stringify({ reportId, status: newStatus }),
      });
      if (!res.ok) {
        // Nếu có lỗi, server sẽ trả về message
        const errorData = await res.json().catch(() => ({ message: 'Cập nhật thất bại. Không thể đọc phản hồi từ server.' }));
        throw new Error(errorData.message || 'Cập nhật thất bại.');
      }
      // Thành công, không cần làm gì vì UI đã được cập nhật
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.', 'error');
      // Nếu có lỗi, hoàn tác lại thay đổi trên giao diện
      setReports(originalReports);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Báo cáo & Phản ánh</h1>
        <p className="text-gray-600">Gửi báo cáo sự cố hoặc phản ánh dịch vụ</p>
      </div>

      {role === 'resident' && (
      <div className="grid md:grid-cols-3 gap-6">
        {/* Report Form */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Gửi báo cáo mới</h3>
              <p className="text-sm text-gray-500">Điền thông tin chi tiết về vấn đề</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Loại báo cáo</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locker_error">Lỗi tủ</SelectItem>
                    <SelectItem value="incident">Sự cố</SelectItem>
                    <SelectItem value="service_feedback">Phản ánh dịch vụ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nhẹ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề ngắn gọn về vấn đề"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                className="mt-2 min-h-[150px]"
              />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSubmitReport} disabled={submitting}>
                <Upload className="w-4 h-4 mr-2" />
                {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Info */}
        <Card className="p-6">
          <h4 className="text-gray-900 mb-4">Hướng dẫn</h4>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-900 mb-1">📝 Lỗi tủ</p>
              <p className="text-gray-600">
                Báo cáo khi tủ không hoạt động, bị hỏng hoặc có vấn đề kỹ thuật
              </p>
            </div>
            <div>
              <p className="text-gray-900 mb-1">⚠️ Sự cố</p>
              <p className="text-gray-600">
                Các sự cố khẩn cấp cần xử lý ngay lập tức
              </p>
            </div>
            <div>
              <p className="text-gray-900 mb-1">💬 Phản ánh dịch vụ</p>
              <p className="text-gray-600">
                Góp ý, đề xuất cải thiện chất lượng dịch vụ
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-900 mb-2">💡 Mẹo</p>
            <p className="text-sm text-blue-700">
              Cung cấp càng nhiều thông tin chi tiết càng giúp chúng tôi xử lý nhanh hơn
            </p>
          </div>
        </Card>
      </div>
      )}

      {/* Reports History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900">Lịch sử báo cáo</h3>
            <p className="text-sm text-gray-500">Theo dõi trạng thái các báo cáo</p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã báo cáo</TableHead>
              {role === 'manager' && <TableHead>Người gửi</TableHead>}
              <TableHead>Tủ liên quan</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
              {role === 'manager' && <TableHead>Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={role === 'manager' ? 9 : 7} className="text-center">
                  Không có báo cáo nào.
                </TableCell>
              </TableRow>
            ) : (
            reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{report.reportId}</span>
                  </div>
                </TableCell>
                {role === 'manager' && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{report.userId?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  {report.lockerId ? (
                    <Badge variant="secondary">{report.lockerId.lockerId}</Badge>
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
                <TableCell className="max-w-xs truncate">{report.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{formatCategory(report.category)}</Badge>
                </TableCell>
                <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                <TableCell>
                  {getStatusBadge(report.status)}
                </TableCell>
                {role === 'manager' && (
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                      Chi tiết
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog for manager to view details and update status */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo {selectedReport?.reportId}</DialogTitle>
            <DialogDescription>
              Xem chi tiết và cập nhật trạng thái của báo cáo.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Tiêu đề</Label>
                <p className="mt-1 text-gray-900">{selectedReport.title}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Mô tả</Label>
                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
              {selectedReport.lockerId && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Tủ liên quan</Label>
                  <p className="mt-1 text-gray-900">
                    {`Tủ ${selectedReport.lockerId.lockerId} (Tòa ${selectedReport.lockerId.building}, Block ${selectedReport.lockerId.block})`}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Người gửi</Label>
                  <p className="mt-1 text-gray-900">{selectedReport.userId?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Ngày gửi</Label>
                  <p className="mt-1 text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Cập nhật trạng thái</Label>
                <Select
                  value={selectedReport.status}
                  onValueChange={(newStatus) => {
                    handleStatusChange(selectedReport._id, newStatus);
                    // Optimistically update the selected report as well
                    setSelectedReport(prev => prev ? { ...prev, status: newStatus as ReportData['status'] } : null);
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="completed">Đã xử lý</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Report() {
  return (
    // Suspense là bắt buộc khi sử dụng useSearchParams ở cấp độ trang trong Next.js
    <Suspense fallback={<div className="p-6">Đang tải trang báo cáo...</div>}>
      <ReportComponent />
    </Suspense>
  );
}
