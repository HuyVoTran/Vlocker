// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodbClient'; 
import { connectDB } from '@/lib/mongodb'; // Đảm bảo import đúng hàm connectDB (Mongoose)
import User from '@/models/User'; // Giả sử Model User của bạn
import bcrypt from 'bcryptjs';

export const authOptions = {
  // 1. Dùng MongoDB Adapter
  adapter: MongoDBAdapter(clientPromise),
  
  // 2. Cấu hình Providers (Email/Password)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      // Hàm này được gọi khi user submit form login
      async authorize(credentials) {
        // SỬA: Gọi đúng hàm kết nối Mongoose
        await connectDB(); 

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }
        
        // Trả về user object 
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      }
    })
  ],

  // 3. Dùng JWT để quản lý session
  session: {
    strategy: 'jwt',
  },

  // 4. Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role; 
      }
      return session;
    },
    // SỬA: Thêm tham số { url, baseUrl }
    redirect({ url, baseUrl }) { 
      // Logic chuyển hướng tạm thời (không phụ thuộc vào role)
      if (url === baseUrl) { 
        return `${baseUrl}/dashboard`; // Chuyển đến dashboard chung
      }
      return url;
    }
  },
  
  pages: {
    signIn: '/', 
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };