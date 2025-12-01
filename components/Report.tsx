import { FileText, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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
import { useState } from 'react';

export default function Report() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const reports = [
    {
      id: 'RP001',
      date: '15/11/2025',
      title: 'Tủ L001 không mở được',
      category: 'Lỗi tủ',
      status: 'processing',
      priority: 'high'
    },
    {
      id: 'RP002',
      date: '14/11/2025',
      title: 'Đề xuất thêm tủ tại tầng 3',
      category: 'Phản ánh dịch vụ',
      status: 'completed',
      priority: 'low'
    },
    {
      id: 'RP003',
      date: '12/11/2025',
      title: 'Tủ L045 bị kẹt cửa',
      category: 'Lỗi tủ',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'RP004',
      date: '10/11/2025',
      title: 'Hệ thống OTP không gửi',
      category: 'Sự cố',
      status: 'pending',
      priority: 'medium'
    }
  ];

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Báo cáo & Phản ánh</h1>
        <p className="text-gray-600">Gửi báo cáo sự cố hoặc phản ánh dịch vụ</p>
      </div>

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
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Lỗi tủ</SelectItem>
                    <SelectItem value="incident">Sự cố</SelectItem>
                    <SelectItem value="feedback">Phản ánh dịch vụ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locker">Mã tủ (nếu có)</Label>
                <Input
                  id="locker"
                  placeholder="Ví dụ: L001"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề ngắn gọn về vấn đề"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                className="mt-2 min-h-[150px]"
              />
            </div>

            <div>
              <Label>Upload ảnh minh họa</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0].name);
                    }
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">
                    Kéo thả ảnh vào đây hoặc click để chọn
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF (tối đa 5MB)
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-blue-600 mt-2">
                      Đã chọn: {selectedFile}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Gửi báo cáo
              </Button>
              <Button variant="outline">
                Hủy
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

      {/* Reports History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900">Lịch sử báo cáo</h3>
            <p className="text-sm text-gray-500">Theo dõi trạng thái các báo cáo đã gửi</p>
          </div>
          <Button variant="outline">Xem tất cả</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã báo cáo</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{report.id}</span>
                  </div>
                </TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell className="max-w-xs truncate">{report.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{report.category}</Badge>
                </TableCell>
                <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
