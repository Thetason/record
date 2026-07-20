import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const REVIEW_DEBUG = process.env.NODE_ENV !== 'production' && process.env.REVIEW_DEBUG === 'true'

// GET /api/reviews - 사용자의 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Prisma.ReviewWhereInput = {
      userId: session.user.id,
      ...(platform && platform !== 'all' && { platform }),
      ...(search && {
        OR: [
          { business: { contains: search } },
          { content: { contains: search } },
          { author: { contains: search } }
        ]
      })
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { featuredAt: 'asc' },
          { reviewDate: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reviews - 새 리뷰 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 플랜 리뷰 제한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, reviewLimit: true, _count: { select: { reviews: true } } }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const reviewCount = user._count.reviews
    const reviewLimit = user.reviewLimit
    const userPlan = user.plan as 'free' | 'premium' | 'pro'

    // 무제한(-1)이 아닌 경우 한도 체크
    if (reviewLimit !== -1 && reviewCount >= reviewLimit) {
      let upgradeMessage = ''
      let upgradePlan = ''
      
      if (userPlan === 'free') {
        upgradeMessage = '프리 플랜은 최대 20개의 리뷰만 등록할 수 있습니다. 프리미엄 플랜으로 업그레이드하면 월 100개까지 등록 가능합니다.'
        upgradePlan = 'premium'
      } else if (userPlan === 'premium') {
        upgradeMessage = '프리미엄 플랜은 월 100개의 리뷰를 등록할 수 있습니다. 비즈니스 플랜으로 업그레이드하면 무제한 등록이 가능합니다.'
        upgradePlan = 'pro'
      }
      
      return NextResponse.json({ 
        error: 'Review limit reached', 
        message: upgradeMessage,
        reviewCount,
        limit: reviewLimit,
        currentPlan: userPlan,
        upgradePlan
      }, { status: 403 })
    }

    const body = await request.json()
    if (REVIEW_DEBUG) {
      console.log('review create request meta:', {
        userId: session.user.id,
        hasPlatform: Boolean(body.platform),
        hasBusiness: Boolean(body.business),
        contentLength: typeof body.content === 'string' ? body.content.length : 0,
        hasOriginalUrl: Boolean(body.originalUrl),
      })
    }
    
    const { platform, business, content, author, rating, reviewDate, imageUrl, originalUrl, verifiedBy, isPublic } = body
    const normalizedPlatform = typeof platform === 'string' ? platform.trim().toLowerCase() : ''
    const isDirectReview = normalizedPlatform === 're:cord'

    // 입력 검증
    const missingFields = []
    if (!platform) missingFields.push('platform')
    if (!business) missingFields.push('business')
    if (!content) missingFields.push('content')
    if (!author) missingFields.push('author')
    if (!reviewDate) missingFields.push('reviewDate')

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: `다음 필드가 필요합니다: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 })
    }

    // 날짜 검증
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({
        error: 'Invalid date',
        message: '올바른 날짜 형식이 아닙니다.'
      }, { status: 400 })
    }

    // 미래 날짜 방지
    if (parsedDate > new Date()) {
      return NextResponse.json({
        error: 'Invalid date',
        message: '리뷰 작성일은 오늘 이후일 수 없습니다.'
      }, { status: 400 })
    }

    // 컨텐츠 길이 검증
    if (content.length < 10) {
      return NextResponse.json({
        error: 'Invalid content',
        message: '리뷰 내용은 최소 10자 이상이어야 합니다.'
      }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({
        error: 'Invalid content', 
        message: '리뷰 내용은 최대 2000자까지만 가능합니다.'
      }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        platform,
        business,
        content,
        author,
        rating: rating ? parseInt(rating) : null,
        reviewDate: parsedDate,
        imageUrl,
        originalUrl,
        verifiedBy: verifiedBy ?? (isDirectReview ? 'request' : 'owner_import'),
        isVerified: false,
        verificationStatus: isDirectReview ? 'pending' : 'approved',
        verificationNote: isDirectReview
          ? 'Created as a direct review and waiting for owner approval.'
          : 'Imported by the owner into the private vault.',
        // Private Vault 기본값: 명시적으로 true를 보낸 경우만 공개
        isPublic: isDirectReview ? false : isPublic === true,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    if (REVIEW_DEBUG) {
      console.log('review created:', {
        reviewId: review.id,
        userId: session.user.id,
        platform: review.platform,
        verificationStatus: review.verificationStatus,
        isPublic: review.isPublic,
      })
    }
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('review create failed:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : '리뷰 생성 중 오류가 발생했습니다.')
        : '리뷰 생성 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    }, { status: 500 })
  }
}
