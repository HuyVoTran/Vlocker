"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AddressData {
  building: string;
  block: string;
  floor: string;
  unit: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<AddressData>({
    building: "",
    block: "",
    floor: "",
    unit: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user?.isProfileComplete) {
        // Nếu hồ sơ đã hoàn tất, chuyển hướng đến dashboard
        const role = session.user?.role;
        router.push(role === 'manager' ? '/manager/dashboard' : '/resident/dashboard');
      }
    } else if (status === "unauthenticated") {
      // Nếu chưa đăng nhập, quay về trang login
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!address.building || !address.block || !address.floor || !address.unit) {
      setError("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    setLoading(true);

    try {
      // Ghi chú: API endpoint này nên được đổi tên thành /api/auth/complete-profile để rõ nghĩa hơn
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) { // Lỗi Conflict - Địa chỉ đã tồn tại
          throw new Error(data.message || "Địa chỉ căn hộ này đã được đăng ký.");
        }
        throw new Error(data.message || "Cập nhật thông tin thất bại.");
      }

      // Cập nhật session ở phía client để isProfileComplete = true
      // Điều này sẽ kích hoạt useEffect ở trên để chuyển hướng
      await update({ ...address, isProfileComplete: true });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session?.user || session.user.isProfileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 select-none">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-2 text-black-600">
          Hoàn Tất Hồ Sơ
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Chào {session.user.name}, vui lòng cung cấp địa chỉ căn hộ của bạn để tiếp tục.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tòa</label>
              <select name="building" value={address.building} onChange={handleSelect} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400" required>
                <option value="">Chọn Tòa</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
              <select name="block" value={address.block} onChange={handleSelect} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400" required>
                <option value="">Chọn Block</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tầng</label>
              <select name="floor" value={address.floor} onChange={handleSelect} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400" required>
                <option value="">Chọn Tầng</option>
                {Array.from({ length: 50 }, (_, i) => { const floor = (i + 1).toString().padStart(2, "0"); return <option key={floor} value={floor}>{floor}</option>; })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Căn</label>
              <select name="unit" value={address.unit} onChange={handleSelect} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400" required>
                <option value="">Chọn Căn</option>
                {Array.from({ length: 50 }, (_, i) => { const unit = (i + 1).toString().padStart(2, "0"); return <option key={unit} value={unit}>{unit}</option>; })}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white py-2 rounded-md transition mt-6 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-neutral-800 hover:bg-neutral-700"}`}>
            {loading ? "Đang lưu..." : "Lưu và Tiếp Tục"}
          </button>
        </form>
      </div>
    </div>
  );
}