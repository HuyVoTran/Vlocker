"use client";

import MyLockers from "@/components/MyLockers";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { MyLockerItem } from "@/components/MyLockers";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [myLockers, setMyLockers] = useState<MyLockerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (status === "loading") return;
      
      if (status === "unauthenticated" || !session?.user?.id) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching my lockers for user:", session.user.id);
        const myRes = await fetch(`/api/lockers/resident/mylocker?userId=${session.user.id}`);
        console.log("My lockers response status:", myRes.status);
        
        if (!myRes.ok) {
          throw new Error(`My lockers API error: ${myRes.status}`);
        }
        
        const myJson = await myRes.json();
        console.log("My lockers data:", myJson);
        setMyLockers(myJson.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading my lockers:", err);
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
        setLoading(false);
      }
    }

    loadData();
  }, [session, status, router]);

  const handleNavigate = (page: string, locker?: MyLockerItem) => {
    if (locker?.locker?._id) {
      router.push(`/resident/${page}/${locker.locker._id}`);
    } else {
      router.push(`/resident/${page}`);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Lỗi: {error}</div>;
  }

  return <MyLockers myLockers={myLockers} onNavigate={handleNavigate} />;
}
