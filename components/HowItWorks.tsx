import { Shield, Clock, Lock, Smartphone, Package, CheckCircle, HelpCircle} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRouter } from "next/navigation";
import Image from 'next/image';

export const metadata = {
  title: 'VLocker - Tủ thông minh cho chung cư',
};

export default function LandingPage() {
  const router = useRouter();
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-[#1e1e1e]" />,
      title: 'Bảo mật nhiều lớp',
      description: 'Tủ thông minh sử dụng OTP, trạng thái tủ theo thời gian thực và xác thực người dùng'
    },
    {
      icon: <Clock className="w-8 h-8 text-[#1e1e1e]" />,
      title: 'Gửi & nhận linh hoạt',
      description: 'Hỗ trợ shipper giao hàng và người dùng nhận đồ bất kỳ lúc nào'
    },
    {
      icon: <Lock className="w-8 h-8 text-[#1e1e1e]" />,
      title: 'Quản lý trạng thái tủ',
      description: 'Theo dõi tủ trống, tủ đã đặt, tủ đang mở hoặc đã khóa ngay trên dashboard'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-[#1e1e1e]" />,
      title: 'Thanh toán & mở khóa tiện lợi',
      description: 'Thanh toán nhanh qua Momo / VNPAY để mở khóa và lấy đồ'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Đặt tủ',
      description: 'Người dùng đăng nhập, chọn tủ trống và tiến hành đặt tủ trên hệ thống.'
    },
    {
      number: '02',
      title: 'Shipper giao hàng',
      description: 'Shipper bỏ hàng vào tủ đã đặt. Hệ thống xác nhận và khóa tủ an toàn.'
    },
    {
      number: '03',
      title: 'Thanh toán & mở tủ',
      description: 'Người dùng thanh toán phí lưu trữ để kích hoạt quyền mở tủ.'
    },
    {
      number: '04',
      title: 'Lấy hàng & hoàn tất',
      description: 'Mở tủ, lấy hàng và đóng tủ. Quy trình kết thúc, tủ sẵn sàng cho lượt tiếp theo.'
    }
  ];

  const security = [
    {
      icon: <Image src="/icons/vnpay.png" alt="Multiple Payment Methods" className="w-8 h-8" width={32} height={32}/>,
      title: 'Thanh toán Momo / VNPAY',
      description: 'Người dùng thực hiện thanh toán phí thuê tủ trực tiếp thông qua các cổng thanh toán điện tử phổ biến như Momo và VNPAY.'
    },
    {
      icon: <Image src="/icons/padlock.png" alt="Secure Locking System" className="w-8 h-8" width={32} height={32}/>,
      title: 'OTP & Xác thực truy cập',
      description: 'Đảm bảo chỉ người dùng đã thanh toán hợp lệ mới có thể mở tủ, loại bỏ rủi ro truy cập trái phép.'
    },
    {
      icon: <Image src="/icons/clock.png" alt="Real-time Locker Status" className="w-8 h-8" width={32} height={32}/>,
      title: 'Trạng thái tủ theo thời gian thực',
      description: 'Người dùng và quản lý có thể theo dõi trạng thái tủ ngay trên Dashboard, giúp việc quản lý trở nên trực quan và chính xác.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] select-none">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" onClick={() => router.push("/")}>
              <h1 className="text-black font-light">VLocker</h1>
            </div>
            <div className="flex gap-3">
              <Button className="bg-[#1e1e1e]" onClick={() => router.push("auth/login")}> 
                Đăng nhập
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gap-12">
            <div className="flex-col flex items-center justify-center">
              <h1 className="text-white mt-8 mb-6 font-bold text-3xl leading-tight text-center">
                Tìm Hiểu Thêm Về VLocker
              </h1>
              <p className="text-gray-200 mb-8 w-[40vw] text-center">
                VLocker mang đến giải pháp tủ khóa thông minh, giúp bạn nhận hàng mọi lúc mọi nơi một cách an toàn, tiện lợi và bảo mật. Không còn lo lắng về việc bỏ lỡ đơn hàng hay phải chờ đợi shipper.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => router.push("auth/register")} variant="outline">
                  <Package className="w-5 h-5 mr-2" />
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border rounded-3xl border-white w-[90vw] mx-auto mb-16 bg-gray-50 overflow-hidden">
        {/* VLocker? */}
        <section className="py-16 bg-white border rounded-b-3xl border-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://i.pinimg.com/1200x/ce/08/ae/ce08aece423c598b59a9a6ac5547af4d.jpg"
                  alt="Modern Apartment"
                  className="w-full h-[300px] object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold text-3xl mb-6">VLocker Là Gì?</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">VLocker là hệ thống tủ khóa thông minh giúp số hóa toàn bộ quy trình gửi, nhận và quản lý tủ cá nhân.</p>
                  <p className="text-gray-700">Nền tảng cho phép shipper giao hàng an toàn, người dùng mở tủ chỉ sau khi thanh toán, và quản lý theo dõi trạng thái - lịch sử sử dụng tủ theo thời gian thực.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            <div className="text-center mb-12">
              <h2 className="font-semibold text-3xl mb-4">Quy trình sử dụng</h2>
              <p className="text-gray-600">
                Chỉ 4 bước đơn giản để nhận hàng một cách tiện lợi
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#1e1e1e] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">{step.number}</span>
                  </div>
                  <h3 className="text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chung cư dùng VLocker như thế nào? */}
        <section className="py-16 bg-white border rounded-b-3xl border-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-semibold text-3xl mb-6">Chung cư được quản lý như thế nào với VLocker</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">Thay vì theo dõi thủ công bằng sổ sách hoặc trao đổi trực tiếp, toàn bộ hoạt động được quản lý tập trung trên một Dashboard trực quan.</p>
                  {[
                    'Tăng cường bảo mật giao nhận',
                    'Phân quyền rõ ràng',
                    'Tự động hóa thanh toán'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#1e1e1e] flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://i.pinimg.com/1200x/4e/94/89/4e94895b2d5adb916fbfede9f764a290.jpg"
                  alt="Modern Locker"
                  className="w-full h-[320px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="py-16 bg-grey-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-semibold text-3xl mb-4">Thanh Toán & Bảo Mật</h2>
              <p className="text-gray-600">
                Nhiều phương thức thanh toán và bảo mật đa lớp cho tủ của bạn
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {security.map((security, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#1e1e1e] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <div>{security.icon}</div>
                  </div>
                  <h3 className="text-gray-900 mb-2">{security.title}</h3>
                  <p className="text-gray-600 text-sm">{security.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white border rounded-t-3xl border-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-semibold text-3xl mb-4">FAQs</h2>
              <p className="text-gray-600">
                Giải đáp các thắc mắc phổ biến về VLocker
              </p>
            </div>
            <div className="grid md:grid-cols-5 gap-8">
            {[
              {Q: 'Shipper có thể mở tủ của tôi không?',
                A: [
                  'Không. Shipper chỉ được phép bỏ hàng vào tủ đã được đặt trước.',
                  'Sau khi đóng tủ, hệ thống sẽ tự động khóa và shipper không có quyền mở lại.']
              },
              {Q: 'Tôi cần thanh toán khi nào?',
                A: [
                  'Người dùng cần thanh toán phí lưu trữ trước khi mở tủ để nhận đồ.',
                  'Phí được tính tự động theo thời gian sử dụng với mức 5.000 VNĐ/ngày.']
              },
              {Q: 'Nếu tôi quên đóng tủ thì sao?',
                A: [
                  'Hệ thống sẽ cảnh báo trạng thái tủ chưa đóng trên Dashboard.',
                  'Ban quản lý có thể theo dõi và xử lý kịp thời để đảm bảo an toàn.']
              },
              {Q: 'Ban quản lý có xem được lịch sử sử dụng tủ không?',
                A: [
                  'Có. Quản lý có thể xem lịch sử thuê tủ.',
                  'Trạng thái hiện tại và các báo cáo thống kê để phục vụ công tác vận hành.']
              },
              {Q: 'Tôi có thể quản lý tủ khi không ở nhà không?',
                A: [
                  'Có. Người dùng có thể theo dõi trạng thái, thanh toán và mở tủ từ xa.',
                  'Giúp việc giao nhận hàng hóa linh hoạt và thuận tiện hơn.']
              }
            ].map((faq, index) => (
              <div key={index} className="flex flex-col items-start gap-3">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-[#1e1e1e] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-bold leading-snug">
                    {faq.Q}
                  </p>
                </div>

                {/* Answer */}
                <div className="text-gray-700 leading-relaxed space-y-1">
                  {faq.A.map((line, i) => (
                    <p key={i} className="mb-3">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-16 mb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4">
            Bắt đầu sử dụng VLocker ngay hôm nay
          </h2>
          <p className="text-gray-200 mb-8">
            Đăng ký tài khoản và trải nghiệm dịch vụ tủ thông minh hiện đại nhất
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-white text-black hover:bg-white hover:text-black" onClick={() => router.push("auth/login")}> 
                Đăng nhập
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3">
              <h1 className="text-white font-light">VLocker</h1>
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
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 VLocker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
