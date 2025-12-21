import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User"; // Đảm bảo đường dẫn đến model User là chính xác
import { connectDB } from "@/lib/mongodb"; // Đảm bảo đường dẫn đến hàm connectDB là chính xác
import bcrypt from "bcryptjs";

/*
 * =================================================================
 * CẤU HÌNH NEXTAUTH
 * =================================================================
 * File này định nghĩa các tùy chọn xác thực cho NextAuth, bao gồm:
 * - Providers: Cách người dùng đăng nhập (ở đây là dùng email/mật khẩu).
 * - Session: Chiến lược quản lý phiên làm việc (JWT).
 * - Callbacks: Tùy chỉnh token và session để thêm dữ liệu người dùng.
 * =================================================================
 */
/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectDB();
          const user = await User.findOne({ email });

          if (!user) return null; // Không tìm thấy người dùng

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) return null; // Sai mật khẩu

          // Nếu xác thực thành công, trả về đối tượng user để callback 'jwt' có thể sử dụng
          return user;
        } catch (error) {
          console.error("Lỗi trong authorize callback: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Trang đăng nhập của bạn
  },
  callbacks: {
    /**
     * Callback `jwt` được gọi mỗi khi một JSON Web Token được tạo ra (ví dụ: sau khi đăng nhập)
     * hoặc được cập nhật.
     * @param {object} token - Đối tượng token.
     * @param {object} user - Đối tượng người dùng từ database (chỉ có sẵn khi đăng nhập lần đầu).
     * @returns {object} Token đã được cập nhật.
     */
    async jwt({ token, user }) {
      // Khi người dùng đăng nhập thành công, đối tượng `user` sẽ có sẵn.
      // Chúng ta thêm `id` và `role` từ `user` vào `token`.
      if (user) {
        token.id = user._id.toString(); // Thêm ID người dùng vào token
        token.role = user.role; // Thêm vai trò người dùng vào token
        token.building = user.building; // Thêm tòa nhà
        token.block = user.block; // Thêm block
      }
      return token;
    },
    /**
     * Callback `session` được gọi mỗi khi phiên làm việc được truy cập từ client
     * (ví dụ: qua `useSession` hoặc `getSession`).
     * @param {object} session - Đối tượng session.
     * @param {object} token - Đối tượng token (đã được xử lý bởi callback `jwt`).
     * @returns {object} Đối tượng session đã được cập nhật.
     */
    async session({ session, token }) {
      // Lấy dữ liệu (id, role) từ `token` và gán vào `session.user`.
      // Điều này giúp client có thể truy cập thông tin người dùng mở rộng.
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.building = token.building;
        session.user.block = token.block;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };