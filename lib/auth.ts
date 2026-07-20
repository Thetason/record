import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { Adapter } from "next-auth/adapters"
import { getLaunchOfferCreateData } from "@/lib/launch-offer"

interface ExtendedUser {
  username?: string | null
  role?: string | null
}

const USERNAME_MAX_LENGTH = 20
const AUTH_DEBUG_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.AUTH_DEBUG === 'true'

function authDebug(message: string, metadata?: unknown) {
  if (!AUTH_DEBUG_ENABLED) {
    return
  }

  if (metadata) {
    console.log(message, metadata)
    return
  }

  console.log(message)
}

function extractUserMeta(candidate: unknown): ExtendedUser {
  if (!candidate || typeof candidate !== 'object') {
    return {}
  }
  const source = candidate as { username?: unknown; role?: unknown }
  return {
    username: typeof source.username === 'string' ? source.username : undefined,
    role: typeof source.role === 'string' ? source.role : undefined
  }
}

async function findAvailableUsername(base: string): Promise<string> {
  const sanitizedBase = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/-{2,}/g, '-')
    .slice(0, USERNAME_MAX_LENGTH)
    || 'user'

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? '' : `_${Math.random().toString(36).slice(2, 6)}`
    const candidate = `${sanitizedBase}${suffix}`.slice(0, USERNAME_MAX_LENGTH)
    const existing = await prisma.user.findUnique({ where: { username: candidate } })
    if (!existing) {
      return candidate
    }
  }

  const timestampSuffix = Date.now().toString(36).slice(-6)
  const prefix = sanitizedBase.slice(0, Math.max(1, USERNAME_MAX_LENGTH - timestampSuffix.length))
  return `${prefix}${timestampSuffix}`.slice(0, USERNAME_MAX_LENGTH)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [
    // OAuth 제공자는 환경변수가 있을 때만 활성화
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                scope: 'profile_nickname profile_image account_email',
              },
            },
            profile(profile, _tokens) {
              void _tokens
              const account = (profile as Record<string, unknown>).kakao_account as Record<string, unknown> | undefined
              const properties = (profile as Record<string, unknown>).properties as Record<string, unknown> | undefined

              const profileId = profile && typeof profile === 'object' && 'id' in profile ? String((profile as { id?: unknown }).id ?? '') : ''
              const email = (account?.email as string | undefined) ?? `${profileId || Date.now()}@kakao.local`
              const nickname =
                (properties?.nickname as string | undefined) ||
                (account?.profile && typeof account.profile === 'object'
                  ? ((account.profile as Record<string, unknown>).nickname as string | undefined)
                  : undefined)
              const image =
                (properties?.profile_image as string | undefined) ||
                (account?.profile && typeof account.profile === 'object'
                  ? ((account.profile as Record<string, unknown>).profile_image_url as string | undefined)
                  : undefined)

              return {
                id: profileId || `kakao-${Date.now()}`,
                name: nickname ?? `카카오사용자_${profile?.id ?? ''}`,
                email,
                username: (nickname || profileId || 'kakao_user').toString().slice(0, USERNAME_MAX_LENGTH),
                image: image ?? undefined,
              }
            },
          }),
        ]
      : []),
    
    // 기존 이메일/패스워드 로그인
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        authDebug("🔐 NextAuth authorize 시작:", { 
          username: credentials?.username,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })

        if (!credentials?.username || !credentials?.password) {
          authDebug("❌ 인증 실패: 아이디 또는 비밀번호 누락")
          return null
        }

        try {
          authDebug("🔍 사용자 조회 중:", credentials.username)
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username
            }
          })

          authDebug("👤 사용자 조회 결과:", {
            found: !!user,
            hasPassword: !!user?.password,
            username: user?.username,
            id: user?.id
          })

          if (!user || !user.password) {
            authDebug("❌ 인증 실패: 사용자를 찾을 수 없거나 비밀번호가 없음")
            return null
          }

          authDebug("🔐 비밀번호 검증 중...")

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          authDebug("🔑 비밀번호 검증 결과:", {
            isValid: isPasswordValid
            // 보안상 비밀번호 관련 정보는 로깅하지 않음
          })

          if (!isPasswordValid) {
            authDebug("❌ 인증 실패: 비밀번호 불일치")
            return null
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role
          }

          authDebug("✅ 인증 성공:", returnUser)
          return returnUser
        } catch (error) {
          console.error("💥 Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        authDebug('🔐 SignIn callback started:', {
          provider: account?.provider,
          email: user.email,
          name: user.name
        })

        // OAuth 로그인 시 username 자동 생성
        if (account?.provider !== "credentials") {
          const email = user.email

          if (!email) {
            console.error('❌ OAuth provider did not return an email address', {
              provider: account?.provider,
            })
            return '/login?error=oauth_missing_email'
          }

          const existingUser = await prisma.user.findUnique({
            where: { email }
          })
          authDebug('👤 Existing user check:', {
            found: !!existingUser,
            username: existingUser?.username
          })

          let username = existingUser?.username

          if (!username) {
            const base = email.split('@')[0] || 'user'
            username = await findAvailableUsername(base)
            authDebug('✨ Generated new username:', username)
          }

          const nameToUse = user.name || existingUser?.name || username
          const avatar = user.image ?? existingUser?.avatar ?? null

          authDebug('💾 Upserting user:', {
            email,
            username,
            nameToUse,
            hasAvatar: !!avatar
          })

          const launchOffer = existingUser ? null : await getLaunchOfferCreateData(prisma)

          await prisma.user.upsert({
            where: { email },
            update: {
              name: nameToUse,
              username,
              avatar,
            },
            create: {
              email,
              username,
              name: nameToUse,
              avatar,
              // Production DB still has a NOT NULL password column in some baselines.
              // Empty string keeps credentials login disabled because authorize() rejects falsy passwords.
              password: '',
              ...(launchOffer?.createData ?? {
                plan: 'free',
                reviewLimit: 20,
                planExpiry: null,
                launchOfferClaimedAt: null,
              }),
            },
          })

          authDebug('✅ User upserted successfully')
        }

        authDebug('✅ SignIn callback completed successfully')
        return true
      } catch (error) {
        console.error('💥 SignIn callback error:', error)
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          user: { email: user.email, name: user.name },
          provider: account?.provider
        })
        // 에러 발생 시에도 로그인 허용 (이미 생성된 사용자일 수 있음)
        return true
      }
    },
    
    async jwt({ token, user, account }) {
      authDebug("🎫 JWT callback 시작:", { 
        hasUser: !!user, 
        tokenUsername: token.username,
        userId: user?.id,
        provider: account?.provider
      })

      if (user) {
        if (typeof user.id === 'string') {
          token.id = user.id
        }
        if (typeof user.email === 'string') {
          token.email = user.email
        }

        // OAuth 로그인인 경우 DB에서 username 가져오기
        if (account?.provider !== "credentials" && typeof user.email === 'string') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { username: true, role: true, plan: true }
          })
          token.username = dbUser?.username || token.username || 'user'
          token.role = dbUser?.role || 'user'
          token.plan = dbUser?.plan || 'free'
        } else {
          const meta = extractUserMeta(user)
          token.username = meta.username || token.username || 'user'
          token.role = meta.role ?? 'user'
          // Credentials 로그인 시에도 plan 정보 가져오기
          if (meta.username) {
            const dbUser = await prisma.user.findUnique({
              where: { username: meta.username },
              select: { plan: true }
            })
            token.plan = dbUser?.plan || 'free'
          } else {
            token.plan = token.plan || 'free'
          }
        }
        authDebug("👤 JWT에 사용자 정보 추가:", {
          id: token.id,
          username: token.username,
          role: token.role,
          plan: token.plan
        })
      }
      
      // DB에서 최신 role 정보 가져오기
      if (token.username) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { username: token.username as string },
            select: { id: true, role: true, email: true, plan: true }
          })
          if (dbUser) {
            token.role = dbUser.role
            token.email = dbUser.email
            token.plan = dbUser.plan || 'free'
            authDebug("🔄 DB에서 최신 정보 업데이트:", {
              role: token.role,
              email: token.email,
              plan: token.plan
            })
          }
        } catch (error) {
          console.error("❌ JWT DB 조회 오류:", error)
        }
      }
      
      authDebug("🎫 JWT callback 완료:", {
        id: token.id,
        username: token.username,
        role: token.role
      })
      return token
    },
    async session({ session, token }) {
      authDebug("📱 Session callback 시작:", {
        sessionUser: !!session?.user,
        tokenId: token.id,
        tokenUsername: token.username
      })

      if (session?.user) {
        if (typeof token.id === 'string') {
          session.user.id = token.id
        }
        if (typeof token.username === 'string') {
          session.user.username = token.username
        }
        if (typeof token.role === 'string') {
          session.user.role = token.role
        }
        if (typeof token.plan === 'string') {
          session.user.plan = token.plan
        }

        authDebug("📱 Session 정보 설정:", {
          id: session.user.id,
          username: session.user.username,
          role: session.user.role,
          plan: session.user.plan
        })
      }
      
      authDebug("📱 Session callback 완료")
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
}
