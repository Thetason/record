import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface AuthUser {
  id: string
  email: string | null
  name: string | null
  username: string | null
  role: string | null
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev_secret_key_for_local_development_only",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("=== 로그인 시도 ===")
        console.log("Username:", credentials?.username)
        console.log("Password provided:", !!credentials?.password)
        
        if (!credentials?.username || !credentials?.password) {
          console.log("❌ 크레덴셜 누락")
          throw new Error("아이디와 비밀번호를 입력해주세요")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          })

          if (!user) {
            console.log("❌ 사용자 없음:", credentials.username)
            throw new Error("아이디 또는 비밀번호가 올바르지 않습니다")
          }

          if (!user.password) {
            console.log("❌ 비밀번호 없음")
            throw new Error("비밀번호가 설정되지 않았습니다")
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log("비밀번호 검증:", isValid ? "✅" : "❌")

          if (!isValid) {
            throw new Error("아이디 또는 비밀번호가 올바르지 않습니다")
          }

          console.log("✅ 로그인 성공:", user.username)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "로그인 실패"
          console.log("❌ 인증 오류:", message)
          throw new Error(message)
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser
        return {
          ...token,
          id: authUser.id,
          email: authUser.email ?? token.email,
          username: authUser.username ?? '',
          role: authUser.role ?? 'user'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = typeof token.id === 'string' ? token.id : session.user.id
        session.user.username = typeof token.username === 'string' ? token.username : session.user.username
        if (typeof token.role === 'string') {
          ;(session.user as { role?: string }).role = token.role
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  debug: process.env.NODE_ENV === "development"
}
