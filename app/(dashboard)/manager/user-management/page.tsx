'use client';

import ManagerUser from "@/components/ManagerUser";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ManagerUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a manager
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user?.role !== 'manager') {
      // Redirect residents to their dashboard
      router.push('/resident/dashboard');
    }
  }, [session, status, router]);

  // Show loading state while session is being checked
  if (status === 'loading') {
    return <div className="p-6 max-w-7xl mx-auto">Đang tải...</div>;
  }

  // Render the component only if the user is a manager
  if (session?.user?.role === 'manager') {
    return <ManagerUser />;
  }

  // Fallback for the brief moment before redirection
  return null;
}