import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User"; // Đảm bảo đường dẫn đến model User là chính xác
import { connectDB } from "@/lib/mongodb"; // Đảm bảo đường dẫn đến hàm connectDB là chính xác
import bcrypt from "bcryptjs";

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

          if (!user) {
            return null; // Không tìm thấy người dùng
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null; // Sai mật khẩu
          }

          // Trả về đối tượng user để callback 'jwt' có thể sử dụng
          return user;
        } catch (error) {
          console.log("Lỗi trong authorize callback: ", error);
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
    // Callback này được gọi mỗi khi JWT được tạo/cập nhật.
    async jwt({ token, user }) {
      // 'user' chỉ có sẵn trong lần gọi đầu tiên (khi đăng nhập).
      if (user) {
        token.id = user._id.toString(); // Thêm ID người dùng vào token
        token.role = user.role;       // Thêm vai trò người dùng vào token
      }
      return token;
    },
    // Callback này được gọi mỗi khi session được kiểm tra.
    async session({ session, token }) {
      // Lấy id và role từ token và thêm vào đối tượng session.user.
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };