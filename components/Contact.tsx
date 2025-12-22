import { Phone, Mail, MapPin, Clock, Send, MessageSquare, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/toast-context';

export default function Contact() {
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-blue-600" />,
      title: 'Hotline',
      content: '1900-0911',
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
      question: 'Shipper có thể mở tủ của tôi không?',
      answer: [
        'Không. Shipper chỉ được phép bỏ hàng vào tủ đã được đặt trước.',
        'Sau khi đóng tủ, hệ thống sẽ tự động khóa và shipper không có quyền mở lại.'
      ]
    },
    {
      question: 'Tôi cần thanh toán khi nào?',
      answer: [
        'Người dùng cần thanh toán phí lưu trữ trước khi mở tủ để nhận đồ.',
        'Phí được tính tự động theo thời gian sử dụng với mức 5.000 VNĐ/ngày.'
      ]
    },
    {
      question: 'Nếu tôi quên đóng tủ thì sao?',
      answer: [
        'Hệ thống sẽ cảnh báo trạng thái tủ chưa đóng trên Dashboard.',
        'Ban quản lý có thể theo dõi và xử lý kịp thời để đảm bảo an toàn.'
      ]
    },
    {
      question: 'Ban quản lý có xem được lịch sử sử dụng tủ không?',
      answer: [
        'Có. Quản lý có thể xem lịch sử thuê tủ.',
        'Trạng thái hiện tại và các báo cáo thống kê để phục vụ công tác vận hành.'
      ]
    },
    {
      question: 'Tôi có thể quản lý tủ khi không ở nhà không?',
      answer: [
        'Có. Người dùng có thể theo dõi trạng thái, thanh toán và mở tủ từ xa.',
        'Giúp việc giao nhận hàng hóa linh hoạt và thuận tiện hơn.'
      ]
    }
  ];

  // State cho form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ tên của bạn"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}

                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="subject">Chủ đề</Label>
                <Input
                  id="subject"
                  placeholder="Chủ đề tin nhắn"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Nội dung</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung tin nhắn của bạn..."
                className="mt-2 min-h-[150px]"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={async () => {
                setIsSubmitting(true);

                try {
                  const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, phone, subject, message }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gửi tin nhắn thất bại.');
                  }

                  // Xử lý thành công
                  showToast('Tin nhắn đã được gửi thành công!', 'success');
                  setName('');
                  setEmail('');
                  setPhone('');
                  setSubject('');
                  setMessage('');
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Đã xảy ra một lỗi không xác định.', 'error');
                } finally {
                  setIsSubmitting(false);
                }
              }} disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </Button>
              <Button variant="outline" onClick={() => {
                setName('');
                setEmail('');
                setPhone('');
                setSubject('');
                setMessage('');
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
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
                <div className="text-sm text-gray-600 space-y-1">
                  {faq.answer.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
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
              Gọi ngay 1900-0911
            </Button>
          </div>
        </Card>
      </div>

      {/* Map Section */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Vị trí văn phòng</h3>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858229994582!2d106.6919923759021!3d10.82208175848834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e53610d76b%3A0x866210c456c3330f!2zNjkvNjggxJAuIMSQ4bq3bmcgVGh1eSBUcsOibSwgUGjGsOG7nW5nIDEzLCBCw6xuaCBUaOG6oW5oLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1672531200000!5m2!1svi!2s"
          className="w-full h-[400px] border-0 rounded-lg"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Vị trí văn phòng VLocker"
        >
        </iframe>
      </Card>
    </div>
  );
}
