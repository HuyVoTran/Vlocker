"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// 1. Định nghĩa kiểu dữ liệu cho Form
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  building: string;
  block: string;
  floor: string;
  unit: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Sử dụng Interface đã định nghĩa cho state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    building: "",
    block: "",
    floor: "",
    unit: "",
  });

  // 3. Định nghĩa kiểu cho sự kiện thay đổi input (ChangeEvent)
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // TRƯỜNG HỢP: Nếu là tên không được nhập ký tự khác ngoài chữ cái
    if (name === "name") {
      // Cho phép: A-Z, a-z, tiếng Việt có dấu, và khoảng trắng
      processedValue = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
    } else if (name === "phone") {
      // Chỉ cho nhập số
      processedValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
    
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    };
    
    // 4. Định nghĩa kiểu cho sự kiện submit form (FormEvent)
    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      
      // Validation:
      if (formData.name.trim().length < 1 || formData.name.trim().length > 25) {
        setError("Tên phải từ 1 đến 25 ký tự.");
        setLoading(false);
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        setError("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
        setLoading(false);
        return;
      }

      if (formData.password.length < 8 || formData.password.length > 30) {
        setError("Mật khẩu phải từ 8 đến 30 ký tự.");
        setLoading(false);
        return;
      }
      
      if (formData.confirmPassword.length < 8 || formData.confirmPassword.length > 30) {
        setError("Mật khẩu xác nhận phải từ 8 đến 30 ký tự.");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        setLoading(false);
        return;
      }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone,
          building: formData.building,
          block: formData.block,
          floor: formData.floor,
          unit: formData.unit,
        }),
      });

      if (!res.ok) {
        // Nếu phản hồi không OK, cố gắng phân tích thông báo lỗi từ body.
        let errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
        try {
          const errorData = await res.json();
          // Nếu server cung cấp một thông báo cụ thể, hãy sử dụng nó.
          errorMessage = errorData?.message || `Lỗi từ máy chủ: ${res.status}`;
        } catch (e) {
          // Nếu body của phản hồi không phải là JSON (ví dụ: trang lỗi HTML từ Next.js)
          errorMessage = `Lỗi máy chủ nội bộ (${res.status}). Vui lòng kiểm tra logs phía server.`;
        }
        throw new Error(errorMessage);
      }

      // Đăng ký thành công -> Chuyển về trang login
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/auth/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Đã xảy ra lỗi không xác định");
      } else {
        setError("Đã xảy ra lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 select-none">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-black-600">
          Đăng Ký Cư Dân
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nhóm thông tin cá nhân */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                name="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                name="phone"
                type="tel"
                placeholder="0901234567"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
                required
                maxLength={11}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                name="password"
                type="password"
                placeholder="******"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="******"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
                required
              />
            </div>
          </div>

          <hr className="my-4 border-gray-200" />
          <p className="text-sm font-semibold text-gray-600 mb-2">Địa chỉ căn hộ</p>

          {/* Nhóm thông tin địa chỉ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <select
              name="building"
              value={formData.building}
              onChange={handleSelect}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
              required
            >
              <option value="">Tòa</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* BLOCK */}
          <div>
            <select
              name="block"
              value={formData.block}
              onChange={handleSelect}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
              required
            >
              <option value="">Block</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* FLOOR */}
          <div>
            <select
              name="floor"
              value={formData.floor}
              onChange={handleSelect}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
              required
            >
              <option value="">Tầng</option>
              {Array.from({ length: 50 }, (_, i) => {
                const floor = (i + 1).toString().padStart(2, "0");
                return <option key={floor} value={floor}>{floor}</option>;
              })}
            </select>
          </div>

          {/* UNIT */}
          <div>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleSelect}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
              required
            >
              <option value="">Căn</option>
              {Array.from({ length: 50 }, (_, i) => {
                const unit = (i + 1).toString().padStart(2, "0");
                return <option key={unit} value={unit}>{unit}</option>;
              })}
            </select>
          </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition mt-6 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>

        <div className="flex justify-center items-center mt-4 text-sm">
          <span className="text-gray-600 mr-1">Đã có tài khoản?</span>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-gray-800 hover:underline font-semibold"
          >
            Đăng Nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}