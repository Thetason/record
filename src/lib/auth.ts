import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { Adapter } from "next-auth/adapters"

const getUsername = (user: unknown): string | undefined => {
  if (!user || typeof user !== 'object') {
    return undefined
  }
  const candidate = user as { username?: unknown }
  return typeof candidate.username === 'string' ? candidate.username : undefined
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = getUsername(user)
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        if (typeof token.id === 'string') {
          session.user.id = token.id
        }
        if (typeof token.username === 'string') {
          session.user.username = token.username
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
}
