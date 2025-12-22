'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Bắt đầu đếm ngược
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Hẹn giờ để chuyển hướng sau 5 giây
    const redirectTimeout = setTimeout(() => {
      router.push('/');
    }, 5000);

    // Dọn dẹp timer khi component bị hủy
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6 select-none">
      <div className="max-w-md">
        <Compass className="w-24 h-24 mx-auto text-neutral-500 mb-6 animate-pulse" />
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">Ối, Lạc Đường Rồi!</h2>
        <p className="text-gray-500 mb-6">Đừng lo, chúng tôi sẽ đưa bạn về nơi an toàn.</p>
        <p className="text-gray-500 mb-8">Tự động chuyển về trang chủ trong <span className="font-bold text-blue-600">{countdown}</span> giây...</p>
        <Link href="/" passHref><Button><Home className="w-4 h-4 mr-2" />Về Trang Chủ Ngay</Button></Link>
      </div>
    </div>
  );
}