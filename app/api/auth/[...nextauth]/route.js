// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) throw new Error('No user found');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Invalid password');

        // THÊM building & block & _id
        return { 
          id: user._id.toString(),
          _id: user._id.toString(),      // ← thêm
          name: user.name, 
          email: user.email, 
          role: user.role,

          building: user.building,       // ← thêm
          block: user.block              // ← thêm
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
    
        // Lấy building/block từ DB
        const dbUser = await User.findById(user.id);
        token.building = dbUser.building;
        token.block = dbUser.block;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.building = token.building;
        session.user.block = token.block;
      }
      return session;
    },

    redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  pages: {
    signIn: '/',
  },

  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
