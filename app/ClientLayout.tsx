"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Package, PlusCircle, User, FileText, Phone, BoxIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function ClientLayout({ children }) {
  const [currentPage, setCurrentPage] = useState("landing");
  const [userRole, setUserRole] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogin = (role) => {
    setUserRole(role);
    setCurrentPage(role === "resident" ? "resident-dashboard" : "manager-dashboard");
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage("landing");
  };

  const residentMenuItems = [
    { id: "resident-dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "my-lockers", label: "Tủ của tôi", icon: <Package className="w-5 h-5" /> },
    { id: "register-locker", label: "Đăng ký tủ mới", icon: <PlusCircle className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "report", label: "Báo cáo", icon: <FileText className="w-5 h-5" /> },
    { id: "contact", label: "Liên hệ", icon: <Phone className="w-5 h-5" /> },
  ];

  const managerMenuItems = [
    { id: "manager-dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "manager-lockers", label: "Tủ đã đặt & đã dùng", icon: <Package className="w-5 h-5" /> },
    { id: "available-lockers", label: "Tủ trống", icon: <BoxIcon className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "report", label: "Báo cáo", icon: <FileText className="w-5 h-5" /> },
    { id: "contact", label: "Liên hệ", icon: <Phone className="w-5 h-5" /> },
  ];

  const menuItems =
    userRole === "resident"
      ? residentMenuItems
      : userRole === "manager"
      ? managerMenuItems
      : [];

  if (!userRole) return children;

  // Listen for toggle events emitted from Header (client -> client communication)
  // This keeps the sidebar toggle fully client-side without passing functions cross-component boundaries.
  React.useEffect(() => {
    const onToggle = () => setIsSidebarOpen((v) => !v);
    window.addEventListener('toggleSidebar', onToggle as EventListener);
    return () => window.removeEventListener('toggleSidebar', onToggle as EventListener);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        menuItems={menuItems}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userRole={userRole}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
