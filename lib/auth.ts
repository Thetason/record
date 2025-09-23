import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
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
    // OAuth 제공자는 환경변수가 있을 때만 활성화
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    ] : []),
    
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET ? [
      KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    ] : []),
    
    // 기존 이메일/패스워드 로그인
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 NextAuth authorize 시작:", { 
          username: credentials?.username,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
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
          
          // bcrypt compare 전에 salt rounds 확인
          const saltRounds = user.password.startsWith('$2a$') ? 
            parseInt(user.password.split('$')[2]) : 
            user.password.startsWith('$2b$') ? 
            parseInt(user.password.split('$')[2]) : 10
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("🔑 비밀번호 검증 결과:", { 
            isValid: isPasswordValid,
            inputPassword: credentials.password.substring(0, 3) + "***",
            hashedPassword: user.password.substring(0, 10) + "...",
            saltRounds
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
    async signIn({ user, account, profile }) {
      // OAuth 로그인 시 username 자동 생성
      if (account?.provider !== "credentials") {
        const email = user.email!
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })
        
        if (!existingUser) {
          // 새 사용자인 경우 username 생성
          const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5)
          await prisma.user.create({
            data: {
              email,
              username,
              name: user.name || username,
              avatar: user.image?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U',
              plan: 'free',
              reviewLimit: 50
            }
          })
        }
      }
      return true
    },
    
    async jwt({ token, user, account }) {
      console.log("🎫 JWT callback 시작:", { 
        hasUser: !!user, 
        tokenUsername: token.username,
        userId: user?.id,
        provider: account?.provider
      })

      if (user) {
        token.id = user.id
        token.email = user.email
        
        // OAuth 로그인인 경우 DB에서 username 가져오기
        if (account?.provider !== "credentials") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { username: true, role: true }
          })
          token.username = dbUser?.username
          token.role = dbUser?.role || 'user'
        } else {
          token.username = (user as any).username
          token.role = (user as any).role
        }
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
            select: { id: true, role: true, email: true }
          })
          if (dbUser) {
            let effectiveRole = dbUser.role

            // 슈퍼 관리자가 없는 경우 현재 사용자를 승격해 접근 차단을 방지
            if (effectiveRole !== 'super_admin') {
              const existingSuperAdmin = await prisma.user.findFirst({
                where: {
                  role: 'super_admin',
                  NOT: { id: dbUser.id }
                },
                select: { id: true }
              })

              if (!existingSuperAdmin) {
                const promoted = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { role: 'super_admin' },
                  select: { role: true }
                })
                effectiveRole = promoted.role
                console.log('🚀 자동 슈퍼 관리자 승격:', {
                  username: token.username,
                  role: effectiveRole
                })
              }
            }

            token.role = effectiveRole
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
