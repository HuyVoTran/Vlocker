"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const role = session?.user?.role || "resident";

  const handleNavigate = (page: string) => {
    router.push(`/${role}/${page}`);
  };

  // Listen for toggle events emitted from Header (client -> client)
  useEffect(() => {
    const onToggle = () => setIsSidebarOpen((v) => !v);
    window.addEventListener('toggleSidebar', onToggle as EventListener);
    return () => window.removeEventListener('toggleSidebar', onToggle as EventListener);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col">
        <Header userRole={role as 'resident' | 'manager'} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
