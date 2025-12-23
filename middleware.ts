import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Định nghĩa một kiểu cho token để bao gồm thuộc tính `role`
// Bạn nên khai báo kiểu này trong file `next-auth.d.ts` để có được hỗ trợ tốt nhất từ TypeScript.
interface AugmentedToken {
  role?: "manager" | "resident" | null;
}

export const middleware = withAuth(
  // Tên hàm đã được đổi từ `middleware` thành `proxy` để tuân thủ quy ước mới của Next.js 16+
  function middleware(req: NextRequest & { nextauth: { token: AugmentedToken | null } }) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Nếu người dùng đã đăng nhập (có token)
    if (token) {
      const userRole = token.role;

      // Chặn Quản lý (manager) truy cập vào các trang của Dân cư (resident)
      if (userRole === "manager" && pathname.startsWith("/resident")) {
        // Chuyển hướng về trang dashboard chung hoặc trang chính của quản lý
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Chặn Dân cư (resident) truy cập vào các trang của Quản lý (manager)
      if (userRole === "resident" && pathname.startsWith("/manager")) {
        // Chuyển hướng về trang dashboard chung hoặc trang chính của dân cư
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // `withAuth` đã xử lý trường hợp chưa đăng nhập và chuyển hướng đến trang login.
    // Cho phép request tiếp tục.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Matcher để đảm bảo proxy này chỉ chạy trên các đường dẫn được chỉ định.
export const config = {
  matcher: [
    "/manager/:path*",
    "/resident/:path*",
    "/profile",
    "/history",
    "/report",
    "/contact",
    "/notifications"
  ],
};