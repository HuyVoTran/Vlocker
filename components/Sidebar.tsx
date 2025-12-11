"use client";

import { LogOut, LayoutDashboard, Package, FileText, Users, PlusCircle, User } from 'lucide-react';
import { Button } from './ui/button';
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
} from "./ui/alert-dialog";

interface SidebarProps {
  isOpen: boolean;
  onNavigate?: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const { data: session } = useSession();
  
  if (!isOpen) return null;

  const role = session?.user?.role || 'resident';

  // Menu items cho resident
  const residentMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'my-lockers',
      label: 'Tủ của tôi',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'register-locker',
      label: 'Đăng ký tủ mới',
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'report',
      label: 'Báo cáo',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'contact',
      label: 'Liên hệ',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  // Menu items cho manager
  const managerMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'manager-lockers',
      label: 'Thống kê tủ',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'available-lockers',
      label: 'Tủ trống',
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'report',
      label: 'Báo cáo',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'contact',
      label: 'Liên hệ',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const menuItems = role === 'manager' ? managerMenuItems : residentMenuItems;
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white">V</span>
          </div>
          <div>
            <h1 className="text-blue-600">VLocker</h1>
            <p className="text-xs text-gray-500">Smart Locker System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
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
      </div>
    </aside>
  );
}
