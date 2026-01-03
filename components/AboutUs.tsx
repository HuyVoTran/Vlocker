"use client";

import {
  Users,
  Cpu,
  Target,
  Mail,
  Code,
  Database,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from './ui/button';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function AboutUs() {
  const router = useRouter();

  const developers = [
    {
      name: "Trần Võ Huy",
      role: "Full-stack Developer",
      avatar: "/Avatar.jpg",
      description: "Chịu trách nhiệm chính trong việc phát triển cả frontend và backend, thiết kế cơ sở dữ liệu và triển khai hệ thống.",
    }
  ];

  const technologies = [
    {
      name: "Next.js",
      icon: <Code className="w-6 h-6 text-blue-500" />,
      category: "Frontend & Backend"
    },
    {
      name: "React",
      icon: <Code className="w-6 h-6 text-blue-500" />,
      category: "Frontend"
    },
    {
      name: "TypeScript",
      icon: <Code className="w-6 h-6 text-blue-500" />,
      category: "Language"
    },
    {
      name: "Tailwind CSS",
      icon: <Code className="w-6 h-6 text-blue-500" />,
      category: "Styling"
    },
    {
      name: "MongoDB",
      icon: <Database className="w-6 h-6 text-green-500" />,
      category: "Database"
    },
    {
      name: "NextAuth.js",
      icon: <Shield className="w-6 h-6 text-red-500" />,
      category: "Authentication"
    }
  ];

  const goals = [
    "Số hóa và tự động hóa quy trình giao nhận hàng hóa tại các khu chung cư, giảm thiểu các bước thủ công và sai sót.",
    "Tăng cường an toàn và bảo mật cho tài sản của cư dân thông qua hệ thống khóa thông minh và xác thực nhiều lớp.",
    "Cung cấp một nền tảng quản lý tập trung, minh bạch và hiệu quả cho ban quản lý tòa nhà.",
    "Mang lại sự tiện lợi và linh hoạt tối đa cho cả người nhận hàng và người giao hàng, cho phép giao/nhận 24/7."
  ];

  return (
    <div className="min-h-screen bg-gray-50 select-none">
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Về Chúng Tôi</h1>
            <p className="text-lg text-gray-600">
              Tìm hiểu về đội ngũ, công nghệ và sứ mệnh đằng sau VLocker.
            </p>
          </div>

          {/* Giới thiệu VLocker */}
          <Card>
            <CardHeader>
              <CardTitle>Giới thiệu VLocker</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <p>
                VLocker là một dự án hệ thống tủ khóa thông minh (Smart Locker) được thiết kế để hiện đại hóa quy trình giao nhận hàng hóa tại các khu dân cư, đặc biệt là chung cư. Dự án giải quyết các vấn đề phổ biến như lỡ đơn hàng, chờ đợi shipper, và thiếu an toàn khi gửi/nhận đồ.
              </p>
              <p>
                Với VLocker, chúng tôi mang đến một giải pháp toàn diện: cư dân có thể nhận hàng bất cứ lúc nào, shipper giao hàng nhanh chóng và an toàn, còn ban quản lý có thể giám sát toàn bộ hệ thống một cách dễ dàng thông qua một dashboard trực quan.
              </p>
            </CardContent>
          </Card>

          {/* Người phát triển */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Người Phát Triển
              </CardTitle>
            </CardHeader>
            <CardContent>
              {developers.map((dev, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden flex-shrink-0">
                    <Image src={dev.avatar} alt={dev.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{dev.name}</h3>
                    <p className="text-blue-600 mb-2">{dev.role}</p>
                    <p className="text-gray-700">{dev.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Công nghệ sử dụng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Công Nghệ Sử Dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  {tech.icon}
                  <div>
                    <p className="font-semibold">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.category}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mục tiêu dự án */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6" />
                Mục Tiêu Dự Án
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{goal}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Liên hệ */}
          <Card className="text-center p-8">
            <Mail className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Cần Thêm Thông Tin?</h3>
            <p className="text-gray-600 mb-6">
              Đừng ngần ngại liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.
            </p>
            <Button onClick={() => router.push('/contact')}>
              Đến Trang Liên Hệ
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
