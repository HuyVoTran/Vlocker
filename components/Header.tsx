 'use client';

import { Menu, Bell, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userRole: 'resident' | 'manager' | null;
}

export default function Header({ userRole }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const role = userRole || 'resident';
  const fullName = session?.user?.name || (role === 'resident' ? 'Nguyễn Văn A' : 'Quản lý Tòa A');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
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
            className="relative"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
              3
            </Badge>
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${role}/profile`)}
              aria-label="Mở trang profile"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
