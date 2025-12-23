"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = (session?.user?.role as 'resident' | 'manager') || null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Listen for toggle events emitted from Header (client -> client communication)
  useEffect(() => {
    const onToggle = () => setIsSidebarOpen((v) => !v);
    window.addEventListener('toggleSidebar', onToggle as EventListener);
    return () => window.removeEventListener('toggleSidebar', onToggle as EventListener);
  }, []);

  // The onNavigate function is no longer needed here because the Sidebar
  // component now handles its own navigation internally using <Link>.
  if (!role) return <>{children}</>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
