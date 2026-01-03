"use client";

import { useState, useEffect, FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleIcon from "@/components/ui/GoogleIcon"; // Sửa đường dẫn import

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Chuyển hướng sau khi đăng nhập
  useEffect(() => {
    const verifyAndRedirect = async () => {
      if (status === "authenticated") {
        // Nếu session nói profile đã hoàn tất, chuyển hướng ngay
        if (session.user?.isProfileComplete) {
          const role = session.user?.role;
          router.push(role === 'manager' ? '/manager/dashboard' : '/resident/dashboard');
          return;
        }

        // Nếu session nói profile chưa hoàn tất, gọi API để xác minh lại.
        // Điều này xử lý trường hợp người dùng đã có địa chỉ trong DB
        // nhưng cờ isProfileComplete chưa được cập nhật trong session.
        try {
          const res = await fetch('/api/auth/complete-profile'); // GET request
          if (!res.ok) {
            throw new Error(`API call failed with status: ${res.status}`);
          }
          const data = await res.json();

          if (data.isProfileComplete) {
            // API xác nhận profile đã hoàn tất (hoặc vừa tự động hoàn tất).
            // Cập nhật session phía client và chuyển hướng đến dashboard.
            await update({ isProfileComplete: true });
            const role = session.user?.role;
            router.push(role === 'manager' ? '/manager/dashboard' : '/resident/dashboard');
          } else {
            // API xác nhận profile thực sự chưa hoàn tất.
            router.push("/auth/complete-profile");
          }
        } catch (apiError) {
          console.error("Lỗi khi xác minh hồ sơ:", apiError);
          // Nếu có lỗi, an toàn nhất là đưa họ đến trang hoàn tất hồ sơ.
          router.push("/auth/complete-profile");
        }
      }
    };

    verifyAndRedirect();
  }, [session, status, router, update]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      // useEffect sẽ xử lý việc chuyển hướng
    } catch (error) {
      console.error(error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await signIn("google", { redirect: false });

      if (res?.error) {
        // NextAuth trả về lỗi nếu callback signIn phía server trả về false
        setError("Đăng nhập với Google thất bại. Vui lòng thử lại sau.");
        console.error("Lỗi đăng nhập Google từ NextAuth:", res.error);
      }
      // Nếu res.ok là true, hook useSession sẽ cập nhật và useEffect sẽ xử lý việc chuyển hướng.
    } catch (err) {
      setError("Đã xảy ra lỗi không mong muốn khi đăng nhập Google.");
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 select-none">
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
            Đăng Nhập
          </h1>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400" />
          </div>

          <div>
            <label htmlFor="password" className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">Mật khẩu
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-sm text-indigo-600 hover:text-indigo-500">
                  Quên mật khẩu?
                </Link>
            </label>
            <input id="password" name="password" type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400" />
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
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs">
            HOẶC
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 mr-3" />
              Đăng nhập với Google
            </>
          )}
        </button>

        <div className="flex justify-center items-center mt-4 text-sm">
          <span className="text-gray-600 mr-1">Chưa có tài khoản?</span>
          <Link
            href="/auth/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );

}
