import { PrismaClient } from './prisma-client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const demoPassword = 'Syb20201234!'
const defaultBaseUrl = process.env.PUBLIC_PROFILE_BASE_URL || 'https://www.recordyours.com'
const SYNC_PROFILE_OVERRIDES: Record<
  string,
  Partial<RemotePublicProfile>
> = {
  syb2020: {
    profession: '보컬트레이너',
    experience: '10년차',
    portfolioImages: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80'
    ],
    careerTimeline: [
      {
        period: '2016 - 2018',
        title: 'Foundation',
        detail: '발성과 기본기 지도 경험을 쌓으며 레슨의 방향성을 다진 시기입니다.'
      },
      {
        period: '2018 - 2021',
        title: 'Science of Voice',
        detail: '호흡, 공명, 발음 교정을 더 체계적으로 설명하고 지도하는 방식이 자리 잡았습니다.'
      },
      {
        period: '2021 - NOW',
        title: 'Practical Coaching',
        detail: '1:1 맞춤 피드백과 직접 받은 후기들이 쌓이며 신뢰 포트폴리오가 만들어진 단계입니다.'
      }
    ]
  }
}

type RemotePublicReview = {
  id: string
  platform: string
  business: string
  content: string
  author: string
  reviewDate: string
  isFeatured?: boolean
  verified?: boolean
  verifiedAt?: string | null
  verifiedBy?: string | null
  originalUrl?: string | null
  imageUrl?: string | null
}

type RemotePublicProfile = {
  id: string
  username: string
  name: string
  isPublic?: boolean
  profession?: string
  experience?: string
  bio?: string
  avatar?: string
  location?: string
  phone?: string
  portfolioImages?: string[]
  careerTimeline?: Array<{
    period?: string
    title?: string
    detail?: string
  }>
  socialLinks?: {
    website?: string
  }
  plan?: 'free' | 'premium' | 'pro'
  theme?: string
  layout?: string
  bgImage?: string | null
  bgColor?: string
  accentColor?: string
  introVideo?: string | null
  customCss?: string | null
  reviews?: RemotePublicReview[]
}

function assertSafeSyncTarget() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ''

  const looksLikeDevTarget =
    databaseUrl.includes('dev.db') ||
    databaseUrl.includes('smoke.db') ||
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1')

  if (process.env.NODE_ENV === 'production') {
    throw new Error('프로덕션 환경에서는 공개 프로필 동기화를 실행할 수 없습니다.')
  }

  if (process.env.PUBLIC_PROFILE_SYNC_CONFIRM !== 'YES') {
    throw new Error('PUBLIC_PROFILE_SYNC_CONFIRM=YES 가 필요합니다.')
  }

  if (!looksLikeDevTarget) {
    throw new Error(`안전하지 않은 데이터베이스 대상입니다: ${databaseUrl || 'missing DATABASE_URL'}`)
  }
}

function planToReviewLimit(plan: string | null | undefined) {
  switch (plan) {
    case 'pro':
      return -1
    case 'premium':
      return 100
    default:
      return 20
  }
}

function normalizePortfolioImages(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)
}

function normalizeCareerTimeline(
  value: unknown
): Array<{ period: string; title: string; detail: string }> {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      period: typeof item.period === 'string' ? item.period.trim() : '',
      title: typeof item.title === 'string' ? item.title.trim() : '',
      detail: typeof item.detail === 'string' ? item.detail.trim() : '',
    }))
    .filter((item) => item.period && item.title && item.detail)
    .slice(0, 6)
}

async function fetchPublicProfile(username: string): Promise<RemotePublicProfile> {
  const response = await fetch(
    `${defaultBaseUrl.replace(/\/$/, '')}/api/profile/${encodeURIComponent(username)}?increment=false`,
    { headers: { accept: 'application/json' } }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`공개 프로필 조회 실패 (${response.status}): ${body.slice(0, 300)}`)
  }

  const payload = await response.json() as { profile?: RemotePublicProfile }
  if (!payload.profile) {
    throw new Error('공개 프로필 응답에 profile 이 없습니다.')
  }

  return {
    ...payload.profile,
    ...(SYNC_PROFILE_OVERRIDES[username] ?? {})
  }
}

async function upsertPublicProfile(profile: RemotePublicProfile) {
  const existingUser = await prisma.user.findUnique({
    where: { username: profile.username }
  })

  const email =
    existingUser?.email ||
    `${profile.username}@recordyours.local`

  const hashedPassword = existingUser?.password || await bcrypt.hash(demoPassword, 10)
  const plan = profile.plan || existingUser?.plan || 'free'
  const reviewLimit = planToReviewLimit(plan)
  const portfolioImages = normalizePortfolioImages(profile.portfolioImages)
  const careerTimeline = normalizeCareerTimeline(profile.careerTimeline)

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email,
          password: hashedPassword,
          name: profile.name,
          profession: profile.profession ?? existingUser.profession,
          experience: profile.experience ?? existingUser.experience,
          bio: profile.bio ?? existingUser.bio,
          location: profile.location ?? existingUser.location,
          website: profile.socialLinks?.website ?? existingUser.website,
          phone: profile.phone ?? existingUser.phone,
          avatar: profile.avatar ?? existingUser.avatar,
          isPublic: profile.isPublic ?? true,
          theme: profile.theme || existingUser.theme,
          layout: profile.layout || existingUser.layout,
          bgImage: profile.bgImage ?? existingUser.bgImage,
          bgColor: profile.bgColor || existingUser.bgColor,
          accentColor: profile.accentColor || existingUser.accentColor,
          portfolioImages: JSON.stringify(portfolioImages),
          careerTimeline: JSON.stringify(careerTimeline),
          introVideo: profile.introVideo ?? existingUser.introVideo,
          customCss: profile.customCss ?? existingUser.customCss,
          plan,
          reviewLimit
        }
      })
    : await prisma.user.create({
        data: {
          username: profile.username,
          email,
          password: hashedPassword,
          name: profile.name,
          profession: profile.profession ?? null,
          experience: profile.experience ?? null,
          bio: profile.bio ?? null,
          location: profile.location ?? null,
          website: profile.socialLinks?.website ?? null,
          phone: profile.phone ?? null,
          avatar: profile.avatar ?? null,
          isPublic: profile.isPublic ?? true,
          theme: profile.theme || 'default',
          layout: profile.layout || 'grid',
          bgImage: profile.bgImage ?? null,
          bgColor: profile.bgColor || '#ffffff',
          accentColor: profile.accentColor || '#FF6B35',
          portfolioImages: JSON.stringify(portfolioImages),
          careerTimeline: JSON.stringify(careerTimeline),
          introVideo: profile.introVideo ?? null,
          customCss: profile.customCss ?? null,
          plan,
          reviewLimit,
          role: 'user'
        }
      })

  await prisma.review.deleteMany({
    where: { userId: user.id }
  })

  const reviews = Array.isArray(profile.reviews) ? profile.reviews : []

  if (reviews.length > 0) {
    await prisma.review.createMany({
      data: reviews.map((review) => ({
        platform: review.platform,
        business: review.business || profile.profession || profile.name,
        content: review.content,
        author: review.author || '익명',
        rating: null,
        reviewDate: new Date(review.reviewDate),
        isVerified: Boolean(review.verified),
        isFeatured: review.isFeatured === true,
        featuredAt: review.isFeatured === true ? new Date(review.reviewDate) : null,
        isPublic: true,
        originalUrl: review.originalUrl ?? null,
        verifiedAt: review.verifiedAt ? new Date(review.verifiedAt) : null,
        verifiedBy: review.verifiedBy ?? 'public_profile_sync',
        verificationStatus: 'approved',
        verificationNote: `Synced from ${defaultBaseUrl} public profile.`,
        imageUrl: review.imageUrl ?? null,
        userId: user.id
      }))
    })
  }

  const imageReviewCount = reviews.filter((review) => Boolean(review.imageUrl)).length

  console.log(`✅ ${profile.username} 공개 프로필 동기화 완료`)
  console.log(`   리뷰 수: ${reviews.length}`)
  console.log(`   이미지 리뷰 수: ${imageReviewCount}`)
  console.log(`   페이지: ${defaultBaseUrl.replace(/\/$/, '')}/${profile.username}`)
}

async function main() {
  assertSafeSyncTarget()

  const usernames = process.argv.slice(2).map((value) => value.trim()).filter(Boolean)
  if (usernames.length === 0) {
    throw new Error('동기화할 username 을 하나 이상 전달해야 합니다. 예: tsx scripts/sync-public-profile.ts syb2020')
  }

  console.log(`🌐 공개 프로필 동기화 시작 (${defaultBaseUrl})\n`)

  for (const username of usernames) {
    console.log(`👤 ${username} 가져오는 중...`)
    const profile = await fetchPublicProfile(username)
    await upsertPublicProfile(profile)
    console.log()
  }
}

main()
  .catch((error) => {
    console.error('❌ 공개 프로필 동기화 실패:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
