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
      // Thêm tùy chọn này để tăng thời gian chờ
      httpOptions: {
        timeout: 10000, // Tăng lên 10 giây (mặc định là 3500ms)
      },
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
          // Trả về một plain object thay vì Mongoose document để đảm bảo tính nhất quán
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            building: user.building,
            block: user.block,
            isProfileComplete: user.isProfileComplete,
            image: user.image,
            hasPassword: true, // User with credentials always has a password
          };
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
            const updates = {};
            let needsUpdate = false;

            // Nếu họ không có mật khẩu, nghĩa là họ đã đăng ký qua Google trước đó.
            // Trong trường hợp này, việc cập nhật tên và ảnh của họ từ Google là hợp lý.
            if (!existingUser.password) {
              if (existingUser.name !== profile.name) updates.name = profile.name;
              if (existingUser.image !== profile.picture) updates.image = profile.picture;
            }

            // Nếu hồ sơ chưa hoàn tất nhưng đã có thông tin địa chỉ (building, block),
            // tự động đánh dấu là đã hoàn tất để người dùng không bị hỏi lại.
            if (!existingUser.isProfileComplete && existingUser.building && existingUser.block) {
              updates.isProfileComplete = true;
              console.log("Google-SignIn: Sẽ tự động đánh dấu hồ sơ là hoàn tất vì đã có địa chỉ.");
            }

            // Nếu có bất kỳ thay đổi nào, thực hiện một lần cập nhật duy nhất
            if (Object.keys(updates).length > 0) {
              await User.findByIdAndUpdate(existingUser._id, { $set: updates });
              console.log("Google-SignIn: Đã cập nhật thông tin người dùng trong DB.", updates);
            }

            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.name = updates.name || existingUser.name;
            user.image = updates.image || existingUser.image || profile.picture;
            user.building = existingUser.building;
            user.block = existingUser.block;
            user.isProfileComplete = updates.isProfileComplete || existingUser.isProfileComplete;
            user.hasPassword = !!existingUser.password; // Check if password exists
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
            user.name = newUser.name; // Thêm tên người dùng vào đối tượng user
            user.image = newUser.image; // Thêm ảnh người dùng vào đối tượng user
            user.isProfileComplete = newUser.isProfileComplete;
            user.hasPassword = false; // New Google user has no password
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
        // user object từ authorize hoặc signIn callback đã được chuẩn hóa
        // và luôn có thuộc tính 'id'
        token.id = user.id;
        token.role = user.role;
        token.name = user.name; // Thêm tên người dùng vào token
        token.isProfileComplete = user.isProfileComplete;
        token.hasPassword = user.hasPassword;
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
      // Ghi đè session.user để chỉ chứa các trường cần thiết cho client,
      // lấy dữ liệu từ token đã được xử lý bởi callback `jwt`.
      if (token && session.user) {
        session.user = {
          id: token.id,
          role: token.role,
          name: token.name, // Thêm tên người dùng vào session
          isProfileComplete: token.isProfileComplete,
          hasPassword: token.hasPassword,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };