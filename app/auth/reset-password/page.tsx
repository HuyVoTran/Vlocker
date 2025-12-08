"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token"); // Lấy token từ URL

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Thiếu mã xác thực. Vui lòng kiểm tra lại email.");
      return;
    }

    // Validation
    if (password.length < 8 || password.length > 30) {
      setError("Mật khẩu phải dài từ 8 đến 30 ký tự.");
      return;
    }

    if (confirmPassword.length < 8 || confirmPassword.length > 30) {
      setError("Xác nhận mật khẩu phải dài từ 8 đến 30 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.");
      setPassword("");
      setConfirmPassword("");

      // Tự chuyển sang login sau vài giây
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6 text-black-600">
          Đặt Lại Mật Khẩu
        </h1>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p className="text-green-600 text-sm mb-4 text-center bg-green-50 p-2 rounded border border-green-200">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full text-white py-2 rounded-md transition ${
              loading || !token
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <div className="flex justify-center items-center mt-4 text-sm">
          <span className="text-gray-600 mr-1">Quay lại?</span>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-blue-600 hover:underline font-semibold"
          >
            Đăng nhập
          </button>
        </div>

      </div>
    </div>
  );
}
