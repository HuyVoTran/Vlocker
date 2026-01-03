"use client";

import { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, Package, FileText, PlusCircle, User, Users, History, Contact } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { data: session } = useSession();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This is a standard pattern to prevent hydration mismatch errors with client-only components.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);
  
  if (!isOpen) return null;

  const role = session?.user?.role ?? 'resident';

  // Hàm helper để tạo link điều hướng chính xác
  const getLink = (page: string): string => {
    const sharedPages = ['profile', 'contact', 'notifications'];
    if (sharedPages.includes(page)) {
      return `/${page}`;
    }
    return `/${role}/${page}`;
  };

  // Chuẩn hóa menu items để tránh lặp code
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ...(role === 'manager'
      ? [
          { id: 'manager-lockers', label: 'Thống kê tủ', icon: <Package className="w-5 h-5" /> },
          { id: 'available-lockers', label: 'Tủ trống', icon: <PlusCircle className="w-5 h-5" /> },
          { id: 'user-management', label: 'Quản lý người dùng', icon: <Users className="w-5 h-5" /> },
        ]
      : [
          { id: 'my-lockers', label: 'Tủ của tôi', icon: <Package className="w-5 h-5" /> },
          { id: 'register-locker', label: 'Đăng ký tủ mới', icon: <PlusCircle className="w-5 h-5" /> },
        ]),
    { id: 'history', label: role === 'manager' ? 'Lịch sử thống kê' : 'Lịch sử', icon: <History className="w-5 h-5" /> },
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="w-5 h-5" /> },
    { id: 'report', label: 'Báo cáo', icon: <FileText className="w-5 h-5" /> },
    { id: 'contact', label: 'Liên hệ', icon: <Contact className="w-5 h-5" /> },
  ];
  
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col select-none">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link href={getLink('../')} className="cursor-pointer hover:opacity-80 transition-opacity">
              <h1 className="text-lg text-black font-light">VLocker</h1>
              <p className="text-xs text-neutral-500">Smart Locker System</p>
          </Link>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={getLink(item.id)}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 text-left">
            {item.icon}
            <span className="text-left">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {isMounted ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5 mr-3" />
                Đăng xuất
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={() => signOut({ callbackUrl: "/" })} className="bg-red-600 hover:bg-red-700">
                  Đăng xuất
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" disabled>
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </Button>
        )}
      </div>
    </aside>
  );
}
