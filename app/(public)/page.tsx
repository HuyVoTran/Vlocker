"use client";

import { Shield, Clock, Lock, Smartphone, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";


export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role || "resident";
      router.replace(`/${role}/dashboard`);
    }
  }, [status, session, router]);
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-black" />,
      title: 'Bảo mật nhiều lớp',
      description: 'Tủ thông minh sử dụng OTP, trạng thái tủ theo thời gian thực và xác thực người dùng.'
    },
    {
      icon: <Clock className="w-8 h-8 text-black" />,
      title: 'Gửi & nhận linh hoạt',
      description: 'Hỗ trợ shipper giao hàng và người dùng nhận đồ bất kỳ lúc nào.'
    },
    {
      icon: <Lock className="w-8 h-8 text-black" />,
      title: 'Quản lý trạng thái tủ',
      description: 'Theo dõi tủ trống, tủ đã đặt, tủ đang mở hoặc đã khóa ngay trên dashboard.'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-black" />,
      title: 'Thanh toán & mở khóa tiện lợi',
      description: 'Thanh toán nhanh qua Momo / VNPAY để mở khóa và lấy đồ.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Vào tủ của tôi',
      description: 'Người dùng truy cập danh sách các tủ đang sử dụng trên dashboard.'
    },
    {
      number: '02',
      title: 'Xem chi tiết & thanh toán',
      description: 'Kiểm tra thông tin tủ và thanh toán phí thuê qua Momo hoặc VNPAY.'
    },
    {
      number: '03',
      title: 'Mở tủ & lấy đồ',
      description: 'Sau khi thanh toán thành công, hệ thống cho phép mở tủ để lấy đồ.'
    },
    {
      number: '04',
      title: 'Đóng tủ & hoàn tất',
      description: 'Đóng tủ, kết thúc phiên sử dụng và cập nhật trạng thái tủ.'
    }
  ];

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] select-none">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-white mb-6 font-bold text-3xl leading-tight">
                Tủ Thông Minh Cho Chung Cư
                <br />
                Nhận Hàng Mọi Lúc
              </h1>
              <p className="text-gray-200 mb-8">
                VLocker mang đến giải pháp tủ khóa thông minh, giúp bạn nhận hàng mọi lúc mọi nơi một cách an toàn, tiện lợi và bảo mật. Không còn lo lắng về việc bỏ lỡ đơn hàng hay phải chờ đợi shipper.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => router.push("auth/register")} variant="outline">
                  <Package className="w-5 h-5 mr-2" />
                  Đăng ký ngay
                </Button>
                <Button size="lg" onClick={() => router.push("/HowItWorks")} variant="outline">
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://i.pinimg.com/1200x/29/f2/31/29f23159ee53b27afb11772e4f4617b8.jpg"
                alt="Smart Locker System"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="border rounded-3xl border-white w-[90vw] mx-auto mt-8 mb-16 bg-gray-50 overflow-hidden">
        {/* Features Section */}
        <section className="py-16 bg-white border rounded-t-3xl border-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-semibold text-3xl mb-4">Tính năng chính</h2>
              <p className="text-gray-600">
                Giải pháp toàn diện cho nhu cầu nhận hàng của bạn
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div>{feature.icon}</div>
                  <h3 className="text-gray-900 font-semibold">{feature.title}</h3>
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

        {/* Benefits */}
        <section className="py-16 bg-white border rounded-b-3xl border-white">
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
                <h2 className="font-semibold text-3xl mb-6">Lợi ích vượt trội</h2>
                <div className="space-y-4">
                  {[
                    'An toàn: Hệ thống bảo mật đa lớp, giám sát 24/7',
                    'Tiện lợi: Nhận hàng mọi lúc, không cần chờ đợi',
                    'Bảo mật: Mã OTP độc nhất, tự động hết hạn',
                    'Linh hoạt: Nhiều kích thước tủ phù hợp với mọi nhu cầu',
                    'Tiết kiệm: Không lo thất lạc hoặc trả hàng do vắng nhà'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#1e1e1e] flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-16 h-[40vh]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4">
            Bắt đầu sử dụng VLocker ngay hôm nay
          </h2>
          <p className="text-gray-200 mb-8">
            Đăng ký tài khoản và trải nghiệm dịch vụ tủ thông minh hiện đại nhất
          </p>
          <div className="flex gap-4 justify-center">
            {status === "loading" ? (
              <Button className="bg-white text-black hover:bg-neutral-300 hover:text-black" disabled aria-busy="true" />
            ) : (
              <Button className="bg-white text-black hover:bg-neutral-300 hover:text-black" onClick={() => router.push("auth/login")}>
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
