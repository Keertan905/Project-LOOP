import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      workspaceId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    workspaceId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    workspaceId: string;
  }
}