import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      username: string
      role?: string
    }
  }

  interface User extends DefaultUser {
    id: string
    username: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    role?: string
  }
}
