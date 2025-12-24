"use client";

import ResidentDashboard from "@/components/ResidentDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Locker } from "@/components/ResidentDashboard";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log("Page session status:", status);
  console.log("Page session data:", session);

  if (status === "loading") {
    return <div className="p-6">Đang tải phiên đăng nhập...</div>;
  }

  if (status === "unauthenticated" || !session?.user?.id) {
    console.log("No session or user ID, redirecting to login");
    router.push("/");
    return <div className="p-6">Chuyển hướng đến đăng nhập...</div>;
  }

  const user = {
    _id: session.user.id,
    building: session.user.building || "A",
    block: session.user.block || "1",
  };

  console.log("User object:", user);

  const handleNavigate = (page: string, locker?: Locker) => {
    // This page is the resident dashboard; navigate to resident routes
    if (locker) {
      router.push(`/resident/${page}/${locker._id}`);
    } else {
      router.push(`/resident/${page}`);
    }
  };

  return <ResidentDashboard onNavigate={handleNavigate} />;
}
