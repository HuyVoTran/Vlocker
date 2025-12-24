import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectDB();
          // Chuẩn hóa email để đảm bảo tính nhất quán (giống lúc đăng ký)
          const user = await User.findOne({ email: email.trim().toLowerCase() });

          if (!user) return null; // Không tìm thấy người dùng

          // Nếu người dùng không có mật khẩu, có thể họ đã đăng ký qua Google.
          // Trong trường hợp này, không cho phép đăng nhập bằng mật khẩu.
          if (!user.password) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) return null; // Mật khẩu không khớp

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
    signIn: "/auth/login", // Trang đăng nhập của bạn
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        console.log("Google-SignIn: Bắt đầu xử lý đăng nhập Google cho email:", profile?.email);
        // Đối với đăng nhập Google, đối tượng profile là rất quan trọng.
        if (!profile?.email) {
          console.error("Google-SignIn-Error: Không tìm thấy email trong hồ sơ.", profile);
          // Chặn đăng nhập nếu Google không cung cấp email.
          return false;
        }

        try {
          await connectDB();
          const normalizedEmail = profile.email.toLowerCase();
          const existingUser = await User.findOne({ email: normalizedEmail });

          if (existingUser) {
            // Người dùng đã tồn tại.
            // Nếu họ không có mật khẩu, nghĩa là họ đã đăng ký qua Google trước đó.
            // Trong trường hợp này, việc cập nhật tên và ảnh của họ từ Google là hợp lý.
            if (!existingUser.password) {
              existingUser.name = profile.name;
              existingUser.image = profile.picture;
              await existingUser.save();
              console.log("Google-SignIn: Đã cập nhật tên/ảnh cho người dùng Google hiện tại.");
            }

            // Quan trọng: Ghi đè các thuộc tính trên đối tượng `user` của NextAuth bằng dữ liệu từ DB.
            // Điều này đảm bảo dữ liệu nhất quán và ngăn NextAuth ghi đè các trường quan trọng.
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.name = existingUser.name; // **FIX**: Luôn sử dụng tên từ DB, không phải từ Google.
            user.image = existingUser.image || profile.picture; // Sử dụng ảnh từ DB, hoặc ảnh Google nếu chưa có.
            user.building = existingUser.building;
            user.block = existingUser.block;
            user.isProfileComplete = existingUser.isProfileComplete;
          } else {
            // Nếu là người dùng mới, tạo tài khoản và đánh dấu profile là chưa hoàn chỉnh.
            // Trường 'name' là bắt buộc theo schema.
            if (!profile.name) {
              console.error("Google-SignIn-Error: Không tìm thấy tên trong hồ sơ.", profile);
              return false;
            }

            console.log("Google-SignIn: Tạo người dùng mới.");
            const newUser = await User.create({
              email: normalizedEmail,
              name: profile.name,
              image: profile.picture,
              role: "resident",
              username: normalizedEmail.split('@')[0],
              isProfileComplete: false, // Quan trọng: Đánh dấu profile chưa hoàn tất.
            });

            user.id = newUser._id.toString();
            user.role = newUser.role;
            user.isProfileComplete = newUser.isProfileComplete;
          }
        } catch (error) {
          console.error("Lỗi trong Google signIn callback: ", error);
          return false; // Chặn đăng nhập nếu có bất kỳ lỗi nào.
        }
      }
      // Cho phép đăng nhập với các provider khác (credentials) hoặc khi Google auth thành công
      return true; // Cho phép đăng nhập với các provider khác (credentials)
    },
    /**
     * Callback `jwt` được gọi mỗi khi một JSON Web Token được tạo ra (ví dụ: sau khi đăng nhập)
     * hoặc được cập nhật.
     * @param {object} token - Đối tượng token.
     * @param {object} user - Đối tượng người dùng từ database (chỉ có sẵn khi đăng nhập lần đầu).
     * @returns {object} Token đã được cập nhật.
     */
    async jwt({ token, user, trigger, session: sessionData }) {
      // Khi người dùng đăng nhập thành công, đối tượng `user` sẽ có sẵn.
      // Chúng ta thêm `id` và `role` từ `user` vào `token`.
      if (user) {
        token.id = user.id || user._id.toString();
        token.role = user.role;
        token.building = user.building;
        token.block = user.block;
        token.isProfileComplete = user.isProfileComplete;
      }

      // Khi session được cập nhật từ client (ví dụ: sau khi hoàn tất hồ sơ)
      if (trigger === "update" && sessionData) {
        return { ...token, ...sessionData };
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
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.building = token.building;
        session.user.block = token.block;
        session.user.isProfileComplete = token.isProfileComplete;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };