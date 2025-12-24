import "next-auth";
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

/**
 * Mở rộng module "next-auth"
 *
 * Cho phép chúng ta thêm các thuộc tính tùy chỉnh vào đối tượng `Session` và `User`
 * để có thể truy cập chúng trong ứng dụng một cách an toàn về kiểu.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "resident" | "manager";
      building?: string;
      block?: string;
      isProfileComplete?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isProfileComplete?: boolean;
    role?: "resident" | "manager";
    building?: string;
    block?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "resident" | "manager";
    isProfileComplete?: boolean;
    building?: string;
    block?: string;
  }
}