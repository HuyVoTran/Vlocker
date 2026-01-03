"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Xử lý nhập email
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Gửi yêu cầu reset password
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gửi yêu cầu thất bại");

      setSuccess("Đã gửi hướng dẫn đặt lại mật khẩu qua email!");
      setEmail("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        
        <div className="relative flex items-center justify-center mb-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute left-0 text-neutral-300 hover:text-neutral-400"
            aria-label="Về trang chủ"
          >
            <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-2xl font-bold text-center text-black-600">
            Quên Mật Khẩu
          </h1>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        {/* SUCCESS */}
        {success && (
          <p className="text-green-600 text-sm mb-4 text-center bg-green-50 p-2 rounded border border-green-200">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập email đã đăng ký
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
          </button>
        </form>

        <div className="flex justify-center items-center mt-4 text-sm">
          <span className="text-gray-600 mr-1">Nhớ mật khẩu rồi?</span>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
