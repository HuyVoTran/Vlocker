"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <>
      {/* Navigation */}
      <header className="border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <h1 className="text-black font-light">VLocker</h1>
            </Link>
            <div className="flex gap-3">
              {status === "loading" ? (
                <Button className="bg-[#1e1e1e]" disabled aria-busy="true" />
              ) : status === "authenticated" ? (
                <Button className="bg-[#1e1e1e]" onClick={() => router.push(`/${session?.user?.role || 'resident'}/dashboard`)}>
                  Dashboard
                </Button>
              ) : (
                <Button className="bg-[#1e1e1e]" onClick={() => router.push("/auth/login")}>
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-white font-light">VLocker</h1>
              </div>
              <p className="text-sm">
                Giải pháp tủ thông minh cho chung cư hiện đại
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li>Tủ thông minh</li>
                <li>Ứng dụng di động</li>
                <li>Hệ thống quản lý</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/AboutUs" className="hover:text-white">Về chúng tôi</Link></li>
                <li><Link href="/TermsofService" className="hover:text-white">Điều khoản sử dụng</Link></li>
                <li><Link href="/PrivacyPolicy" className="hover:text-white">Chính sách bảo mật</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>Hotline: 1900-xxxx</li>
                <li>Email: support@vlocker.vn</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 VLocker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}