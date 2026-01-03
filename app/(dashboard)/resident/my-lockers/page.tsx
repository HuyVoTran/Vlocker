"use client";

import MyLockers from "@/components/dashboard/MyLockers";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { MyLockerItem } from "@/components/dashboard/MyLockers";

// Hàm fetcher chung cho SWR
const fetcher = async (url: string) => {
  const res: Response = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as Error & { info?: unknown; status?: number };
    // Đính kèm thêm thông tin vào đối tượng lỗi.
    try {
      error.info = await res.json();
    } catch {
      // Bỏ qua nếu response body không phải là JSON
    }
    error.status = res.status;
    throw error;
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "API returned an error");
  }
  return json.data;
};

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const {
    data: myLockers = [],
    error,
    isLoading,
    mutate,
  } = useSWR<MyLockerItem[]>(
    userId ? `/api/lockers/resident/mylocker?userId=${userId}` : null,
    fetcher, {
      revalidateOnFocus: false // Vô hiệu hóa việc gọi lại API khi focus
    }
  );

  const handleNavigate = (page: string, locker?: MyLockerItem) => {
    if (locker?.locker?._id) {
      router.push(`/resident/${page}/${locker.locker._id}`);
    } else {
      router.push(`/resident/${page}`);
    }
  };

  // Chuyển hướng nếu chưa đăng nhập
  if (status === "unauthenticated") {
    router.push("/");
    return null; // Trả về null trong khi chuyển hướng
  }

  if (status === "loading" || isLoading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Lỗi: {error.message}</div>;
  }

  // Truyền hàm `mutate` vào prop `onUpdate` để có thể gọi lại API từ component con
  return <MyLockers myLockers={myLockers} onNavigate={handleNavigate} onUpdate={mutate} />;
}
