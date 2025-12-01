import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export default function Contact() {
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-blue-600" />,
      title: 'Hotline',
      content: '1900-xxxx',
      subContent: 'Hỗ trợ 24/7'
    },
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: 'Email',
      content: 'support@vlocker.vn',
      subContent: 'Phản hồi trong 24h'
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: 'Địa chỉ',
      content: 'TP. Hồ Chí Minh',
      subContent: 'Việt Nam'
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: 'Giờ làm việc',
      content: 'Thứ 2 - Chủ nhật',
      subContent: '24/7'
    }
  ];

  const faqs = [
    {
      question: 'Làm sao để đăng ký tủ mới?',
      answer: 'Vào mục "Đăng ký tủ mới", chọn tủ phù hợp và nhấn "Thuê tủ ngay".'
    },
    {
      question: 'Tôi quên mã OTP mở tủ phải làm sao?',
      answer: 'Vào app VLocker hoặc kiểm tra SMS để lấy lại mã OTP.'
    },
    {
      question: 'Giá thuê tủ là bao nhiêu?',
      answer: 'Tủ nhỏ: 50,000đ/tháng, Tủ vừa: 70,000đ/tháng, Tủ lớn: 100,000đ/tháng.'
    },
    {
      question: 'Tủ có an toàn không?',
      answer: 'Tủ được giám sát 24/7 với hệ thống bảo mật đa lớp và khóa thông minh.'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Liên hệ</h1>
        <p className="text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {contactInfo.map((info, index) => (
          <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              {info.icon}
            </div>
            <p className="text-sm text-gray-500 mb-1">{info.title}</p>
            <p className="text-gray-900 mb-1">{info.content}</p>
            <p className="text-xs text-gray-500">{info.subContent}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact Form */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Gửi tin nhắn cho chúng tôi</h3>
              <p className="text-sm text-gray-500">Chúng tôi sẽ phản hồi sớm nhất có thể</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên của bạn"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="subject">Chủ đề</Label>
                <Input
                  id="subject"
                  placeholder="Chủ đề tin nhắn"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Nội dung</Label>
              <Textarea
                id="message"
                placeholder="Nhập nội dung tin nhắn của bạn..."
                className="mt-2 min-h-[150px]"
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Gửi tin nhắn
              </Button>
              <Button variant="outline">
                Làm mới
              </Button>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-6">
          <h4 className="text-gray-900 mb-4">Câu hỏi thường gặp</h4>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                <p className="text-gray-900 mb-2">{faq.question}</p>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-900 mb-2">💡 Cần hỗ trợ ngay?</p>
            <p className="text-sm text-blue-700 mb-3">
              Gọi hotline để được hỗ trợ trực tiếp 24/7
            </p>
            <Button className="w-full" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Gọi ngay 1900-xxxx
            </Button>
          </div>
        </Card>
      </div>

      {/* Map Section */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Vị trí văn phòng</h3>
        <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Bản đồ Google Maps</p>
            <p className="text-sm text-gray-500">TP. Hồ Chí Minh, Việt Nam</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
