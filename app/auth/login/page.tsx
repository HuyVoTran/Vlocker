"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.role) {
      if (session.user.role === "resident") router.push("/resident-dashboard");
      else if (session.user.role === "manager") router.push("/manager-dashboard");
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (!res?.ok) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra tài khoản / mật khẩu.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-black-600">Đăng Nhập</h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="username"
            placeholder="Tài khoản"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-black-700 transition"
          >
            Đăng Nhập
          </button>
        </form>

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-black-600 hover:underline"
          >
            Đăng Ký
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/forgot-password")}
            className="text-gray-500 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>
    </div>
  );
}
