// /types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "resident" | "manager";
      building?: string;
      block?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "resident" | "manager";
    building?: string;
    block?: string;
  }
}
