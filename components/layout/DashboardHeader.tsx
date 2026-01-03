 'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Notification {
  read: boolean;
}

interface HeaderProps {
  userRole: 'resident' | 'manager' | null;
}

export default function Header({ userRole }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Chỉ fetch khi người dùng đã được xác thực
    if (session) {
      const fetchUnreadCount = async () => {
        try {
          const res = await fetch('/api/notifications/unread-count'); // Sử dụng endpoint mới
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUnreadCount(data.data.count); // API đã trả về số lượng
            }
          }
        } catch (error) {
          console.error("Không thể tải số lượng thông báo:", error);
        }
      };
      fetchUnreadCount();
    }
  }, [session]); // Chạy lại khi session thay đổi

  const role = session?.user?.role || userRole || 'resident';
  const fullName = session?.user?.name || (role === 'resident' ? 'Người dùng' : 'Quản lý');
  const initial = fullName ? fullName.charAt(0).toUpperCase() : 'A';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
            className="inline-flex"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-sm text-gray-500">Xin chào,</p>
            <p className="text-gray-900">{fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-1 text-xs bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/profile')}
              aria-label="Mở trang profile"
              className="hover:bg-gray-100 rounded-full"
            >
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">{initial}</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
