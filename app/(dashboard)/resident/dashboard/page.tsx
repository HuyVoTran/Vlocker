"use client";

import ResidentDashboard from "@/components/ResidentDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Locker } from "@/components/ResidentDashboard";

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user?.id) return <div>Đang tải dữ liệu...</div>;

  const user = {
    _id: session.user.id,
    building: session.user.building,
    block: session.user.block,
  };

  const handleNavigate = (page: string, locker?: Locker) => {
    if (locker) {
      router.push(`/dashboard/${page}/${locker._id}`);
    } else {
      router.push(`/dashboard/${page}`);
    }
  };

  return <ResidentDashboard user={user} onNavigate={handleNavigate} />;
}
