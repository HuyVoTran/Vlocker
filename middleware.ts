import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  // Hàm này sẽ được gọi khi callback `authorized` trả về `true`.
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Token đã được kiểm tra tồn tại bởi callback `authorized`.
    if (token) {
      // Kiểu của token giờ đã được bổ sung từ `types/next-auth.d.ts`.
      const userRole = token.role; 

      // Chặn Quản lý (manager) truy cập vào các trang của Dân cư (resident)
      if (userRole === "manager" && pathname.startsWith("/resident")) {
        // Chuyển hướng về trang dashboard của quản lý.
        return NextResponse.redirect(new URL("/manager/dashboard", req.url));
      }

      // Chặn Dân cư (resident) truy cập vào các trang của Quản lý (manager)
      if (userRole === "resident" && pathname.startsWith("/manager")) {
        // Chuyển hướng về trang dashboard của dân cư.
        return NextResponse.redirect(new URL("/resident/dashboard", req.url));
      }
    }

    // Nếu không rơi vào các trường hợp trên, cho phép request tiếp tục.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Callback này quyết định một người dùng có được "ủy quyền" hay không.
      // Nếu trả về `true`, hàm middleware bên trên sẽ được thực thi.
      // Nếu `false`, người dùng sẽ bị chuyển hướng đến trang `signIn`.
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Sửa lại đường dẫn đến trang đăng nhập cho chính xác.
      signIn: "/auth/login",
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