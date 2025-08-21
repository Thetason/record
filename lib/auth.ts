import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 NextAuth authorize 시작:", { 
          username: credentials?.username,
          hasPassword: !!credentials?.password 
        })

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ 인증 실패: 아이디 또는 비밀번호 누락")
          return null
        }

        try {
          console.log("🔍 사용자 조회 중:", credentials.username)
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username
            }
          })

          console.log("👤 사용자 조회 결과:", {
            found: !!user,
            hasPassword: !!user?.password,
            username: user?.username,
            id: user?.id
          })

          if (!user || !user.password) {
            console.log("❌ 인증 실패: 사용자를 찾을 수 없거나 비밀번호가 없음")
            return null
          }

          console.log("🔐 비밀번호 검증 중...")
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("🔑 비밀번호 검증 결과:", { 
            isValid: isPasswordValid,
            inputPassword: credentials.password.substring(0, 3) + "***",
            hashedPassword: user.password.substring(0, 10) + "..."
          })

          if (!isPasswordValid) {
            console.log("❌ 인증 실패: 비밀번호 불일치")
            return null
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role
          }

          console.log("✅ 인증 성공:", returnUser)
          return returnUser
        } catch (error) {
          console.error("💥 Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🎫 JWT callback 시작:", { 
        hasUser: !!user, 
        tokenUsername: token.username,
        userId: user?.id 
      })

      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = (user as any).username
        token.role = (user as any).role
        console.log("👤 JWT에 사용자 정보 추가:", {
          id: token.id,
          username: token.username,
          role: token.role
        })
      }
      
      // DB에서 최신 role 정보 가져오기
      if (token.username) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { username: token.username as string },
            select: { role: true, email: true }
          })
          if (dbUser) {
            token.role = dbUser.role
            token.email = dbUser.email
            console.log("🔄 DB에서 최신 정보 업데이트:", {
              role: token.role,
              email: token.email
            })
          }
        } catch (error) {
          console.error("❌ JWT DB 조회 오류:", error)
        }
      }
      
      console.log("🎫 JWT callback 완료:", {
        id: token.id,
        username: token.username,
        role: token.role
      })
      return token
    },
    async session({ session, token }) {
      console.log("📱 Session callback 시작:", {
        sessionUser: !!session?.user,
        tokenId: token.id,
        tokenUsername: token.username
      })

      if (session?.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        
        console.log("📱 Session 정보 설정:", {
          id: session.user.id,
          username: session.user.username,
          role: session.user.role
        })
      }
      
      console.log("📱 Session callback 완료")
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
}