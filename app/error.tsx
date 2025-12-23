'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Bạn có thể log lỗi này tới một dịch vụ báo cáo lỗi
    console.error(error);

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
  }, [error, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6 select-none">
      <div className="max-w-md">
        <AlertTriangle className="w-24 h-24 mx-auto text-red-500 mb-6 animate-pulse" />
        <h1 className="text-6xl font-bold text-gray-800">Lỗi</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">
          Ôi, Có Lỗi Xảy Ra!
        </h2>
        <p className="text-gray-500 mb-6">Đã có sự cố ngoài ý muốn. Bạn có thể thử lại hoặc quay về trang chủ.</p>
        <p className="text-gray-500 mb-8">Tự động chuyển về trang chủ trong <span className="font-bold text-blue-600">{countdown}</span> giây...</p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={
              // Thử render lại segment này
              () => reset()
            }
          >
            Thử Lại
          </Button>
          <Link href="/" passHref>
            <Button variant="outline"><Home className="w-4 h-4 mr-2" />Về Trang Chủ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}