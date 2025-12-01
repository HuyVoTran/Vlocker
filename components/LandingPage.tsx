import { Shield, Clock, Lock, Smartphone, Package, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onLogin: (role: 'resident' | 'manager') => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Bảo mật cao',
      description: 'Hệ thống khóa thông minh với mã OTP và xác thực đa lớp'
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: 'Tiện lợi 24/7',
      description: 'Nhận hàng mọi lúc mọi nơi, không cần chờ đợi'
    },
    {
      icon: <Lock className="w-8 h-8 text-blue-600" />,
      title: 'An toàn tuyệt đối',
      description: 'Tủ được giám sát liên tục, đảm bảo hàng hóa an toàn'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-blue-600" />,
      title: 'Quản lý dễ dàng',
      description: 'Ứng dụng di động thân thiện, dễ sử dụng'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Đăng ký tủ',
      description: 'Chọn tủ phù hợp với nhu cầu của bạn'
    },
    {
      number: '02',
      title: 'Shipper giao hàng',
      description: 'Shipper đặt hàng vào tủ và thông báo cho bạn'
    },
    {
      number: '03',
      title: 'Nhận mã OTP',
      description: 'Bạn nhận mã mở tủ qua app hoặc SMS'
    },
    {
      number: '04',
      title: 'Lấy hàng',
      description: 'Mở tủ bằng mã OTP và nhận hàng'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white">V</span>
              </div>
              <h1 className="text-blue-600">VLocker</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onLogin('resident')}>
                Đăng nhập Dân cư
              </Button>
              <Button onClick={() => onLogin('manager')}>
                Đăng nhập Quản lý
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-blue-600 mb-6">
                Tủ thông minh cho chung cư
                <br />
                Nhận hàng mọi lúc
              </h1>
              <p className="text-gray-600 mb-8">
                VLocker mang đến giải pháp tủ khóa thông minh, giúp bạn nhận hàng mọi lúc mọi nơi một cách an toàn, tiện lợi và bảo mật. Không còn lo lắng về việc bỏ lỡ đơn hàng hay phải chờ đợi shipper.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => onLogin('resident')}>
                  <Package className="w-5 h-5 mr-2" />
                  Đăng ký ngay
                </Button>
                <Button size="lg" variant="outline">
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1670034353433-65a76b0b2797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGxvY2tlciUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc2MzE2Njc0MHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Smart Locker System"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Tính năng chính</h2>
            <p className="text-gray-600">
              Giải pháp toàn diện cho nhu cầu nhận hàng của bạn
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Quy trình sử dụng</h2>
            <p className="text-gray-600">
              Chỉ 4 bước đơn giản để nhận hàng một cách tiện lợi
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">{step.number}</span>
                </div>
                <h3 className="text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1537695544118-fda4b1118f62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBidWlsZGluZyUyMG1vZGVybnxlbnwxfHx8fDE3NjMxMzU1OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern Apartment"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-gray-900 mb-6">Lợi ích vượt trội</h2>
              <div className="space-y-4">
                {[
                  'An toàn: Hệ thống bảo mật đa lớp, giám sát 24/7',
                  'Tiện lợi: Nhận hàng mọi lúc, không cần chờ đợi',
                  'Bảo mật: Mã OTP độc nhất, tự động hết hạn',
                  'Linh hoạt: Nhiều kích thước tủ phù hợp với mọi nhu cầu',
                  'Tiết kiệm: Không lo thất lạc hoặc trả hàng do vắng nhà'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4">
            Bắt đầu sử dụng VLocker ngay hôm nay
          </h2>
          <p className="text-blue-100 mb-8">
            Đăng ký tài khoản và trải nghiệm dịch vụ tủ thông minh hiện đại nhất
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onLogin('resident')}>
              Đăng ký Dân cư
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" onClick={() => onLogin('manager')}>
              Đăng nhập Quản lý
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">V</span>
                </div>
                <h3 className="text-white">VLocker</h3>
              </div>
              <p className="text-sm">
                Giải pháp tủ thông minh cho chung cư hiện đại
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li>Tủ thông minh</li>
                <li>Ứng dụng di động</li>
                <li>Hệ thống quản lý</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm">
                <li>Về chúng tôi</li>
                <li>Liên hệ</li>
                <li>Chính sách bảo mật</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>Hotline: 1900-xxxx</li>
                <li>Email: support@vlocker.vn</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 VLocker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
