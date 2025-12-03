// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodbClient'; 
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error('No user found');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Invalid password');

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

  session: { strategy: 'jwt' },

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
    redirect({ url, baseUrl }) {
      // Mặc định redirect sau login: landing page hoặc dashboard chung
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  pages: {
    signIn: '/', // hoặc '/auth/login' nếu bạn có trang login riêng
  },

  debug: true, // bật debug để kiểm tra khi dev
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };