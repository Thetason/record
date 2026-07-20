import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SAFE_REVIEW_SELECT = {
  id: true,
  platform: true,
  business: true,
  content: true,
  author: true,
  reviewDate: true,
  isVerified: true,
  isPublic: true,
  isFeatured: true,
  featuredAt: true,
  verificationStatus: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true
} as const

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  name: true,
  profession: true,
  experience: true,
  bio: true,
  location: true,
  website: true,
  phone: true,
  avatar: true,
  portfolioImages: true,
  careerTimeline: true,
  role: true,
  isPublic: true,
  theme: true,
  layout: true,
  bgImage: true,
  bgColor: true,
  accentColor: true,
  introVideo: true,
  customCss: true,
  plan: true,
  planExpiry: true,
  reviewLimit: true,
  profileViews: true,
  createdAt: true,
  updatedAt: true
} as const

function normalizePortfolioImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6)
  }

  if (typeof value === 'string') {
    try {
      return normalizePortfolioImages(JSON.parse(value))
    } catch {
      return []
    }
  }

  return []
}

type CareerEntryInput = {
  period: string
  title: string
  detail: string
}

function normalizeCareerTimeline(value: unknown): CareerEntryInput[] {
  if (Array.isArray(value)) {
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

  if (typeof value === 'string') {
    try {
      return normalizeCareerTimeline(JSON.parse(value))
    } catch {
      return []
    }
  }

  return []
}

// GET /api/users/me - 현재 사용자 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        ...SAFE_USER_SELECT,
        reviews: {
          orderBy: [
            { isFeatured: 'desc' },
            { featuredAt: 'asc' },
            { reviewDate: 'desc' }
          ],
          take: 5,
          select: SAFE_REVIEW_SELECT
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 통계 계산
    const allReviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      select: {
        platform: true,
        reviewDate: true,
        isFeatured: true
      }
    })

    const stats = {
      totalReviews: allReviews.length,
      featuredReviews: allReviews.filter(review => review.isFeatured).length,
      platforms: new Set(allReviews.map(review => review.platform)).size,
      thisMonth: allReviews.filter(review => {
        const reviewDate = new Date(review.reviewDate)
        const now = new Date()
        return reviewDate.getMonth() === now.getMonth() && reviewDate.getFullYear() === now.getFullYear()
      }).length
    }

    return NextResponse.json({
      ...user,
      portfolioImages: normalizePortfolioImages(user.portfolioImages),
      careerTimeline: normalizeCareerTimeline(user.careerTimeline),
      stats
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/me - 현재 사용자 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, username, profession, experience, bio, location, website, phone, avatar, isPublic,
      theme, layout, bgImage, bgColor, accentColor, introVideo, customCss, portfolioImages, careerTimeline
    } = body
    const safePortfolioImages = normalizePortfolioImages(portfolioImages)
    const safeCareerTimeline = normalizeCareerTimeline(careerTimeline)

    // 사용자명 중복 확인 (본인 제외)
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(profession !== undefined && { profession }),
        ...(experience !== undefined && { experience }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(portfolioImages !== undefined && { portfolioImages: JSON.stringify(safePortfolioImages) }),
        ...(careerTimeline !== undefined && { careerTimeline: JSON.stringify(safeCareerTimeline) }),
        ...(isPublic !== undefined && { isPublic }),
        ...(theme !== undefined && { theme }),
        ...(layout !== undefined && { layout }),
        ...(bgImage !== undefined && { bgImage }),
        ...(bgColor !== undefined && { bgColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(introVideo !== undefined && { introVideo }),
        ...(customCss !== undefined && { customCss })
      },
      select: SAFE_USER_SELECT
    })

    return NextResponse.json({
      ...updatedUser,
      portfolioImages: normalizePortfolioImages(updatedUser.portfolioImages),
      careerTimeline: normalizeCareerTimeline(updatedUser.careerTimeline)
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
