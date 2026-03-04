import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  deriveCreationRightsStatus,
  normalizeRightsStatus,
  normalizeSourceType,
  REVIEW_MASKING_STATUSES,
  REVIEW_RIGHTS_STATUSES
} from '@/lib/review-policy'

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
          { business: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { author: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      })
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { reviewDate: 'desc' },
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
    console.log('🔵 POST /api/reviews 시작')
    
    const session = await getServerSession(authOptions)
    console.log('🔐 세션 확인:', session ? `User ID: ${session.user?.id}` : '세션 없음')
    
    if (!session?.user?.id) {
      console.log('❌ 인증 실패')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 플랜 리뷰 제한 확인
    console.log('📊 리뷰 쿼터 확인 중...')
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
      console.log(`⚠️ 리뷰 제한 도달: ${reviewCount}/${reviewLimit}`)
      
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
    console.log('📦 요청 본문:', JSON.stringify(body, null, 2))
    
    const {
      platform,
      business,
      content,
      author,
      rating,
      reviewDate,
      imageUrl,
      originalUrl,
      verifiedBy,
      sourceType,
      rightsStatus,
      isPublic,
      publicSnippet
    } = body

    // 입력 검증
    const missingFields = []
    if (!platform) missingFields.push('platform')
    if (!business) missingFields.push('business')
    if (!content) missingFields.push('content')
    if (!author) missingFields.push('author')
    if (!reviewDate) missingFields.push('reviewDate')

    if (missingFields.length > 0) {
      console.log('❌ 필수 필드 누락:', missingFields)
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: `다음 필드가 필요합니다: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 })
    }

    // 날짜 검증
    console.log('📅 날짜 파싱 중:', reviewDate)
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      console.log('❌ 잘못된 날짜 형식')
      return NextResponse.json({
        error: 'Invalid date',
        message: '올바른 날짜 형식이 아닙니다.'
      }, { status: 400 })
    }

    // 미래 날짜 방지
    if (parsedDate > new Date()) {
      console.log('❌ 미래 날짜')
      return NextResponse.json({
        error: 'Invalid date',
        message: '리뷰 작성일은 오늘 이후일 수 없습니다.'
      }, { status: 400 })
    }

    // 컨텐츠 길이 검증
    if (content.length < 10) {
      console.log(`❌ 내용 너무 짧음: ${content.length}자`)
      return NextResponse.json({
        error: 'Invalid content',
        message: '리뷰 내용은 최소 10자 이상이어야 합니다.'
      }, { status: 400 })
    }

    if (content.length > 2000) {
      console.log(`❌ 내용 너무 김: ${content.length}자`)
      return NextResponse.json({
        error: 'Invalid content', 
        message: '리뷰 내용은 최대 2000자까지만 가능합니다.'
      }, { status: 400 })
    }

    const normalizedSourceType = normalizeSourceType(sourceType)
    let normalizedRightsStatus = deriveCreationRightsStatus(normalizedSourceType)
    if (rightsStatus !== undefined) {
      const parsed = normalizeRightsStatus(rightsStatus, REVIEW_RIGHTS_STATUSES.IMPORTED_PRIVATE)
      if (parsed !== rightsStatus) {
        return NextResponse.json({
          error: 'Invalid rightsStatus',
          message: '허용되지 않는 권리 상태입니다.'
        }, { status: 400 })
      }
      normalizedRightsStatus = parsed
    }

    const canExposePublic =
      normalizedRightsStatus === REVIEW_RIGHTS_STATUSES.CONSENTED_PUBLIC ||
      normalizedRightsStatus === REVIEW_RIGHTS_STATUSES.PLATFORM_SNIPPET

    console.log('💾 Prisma 리뷰 생성 시작...')
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
        verifiedBy,
        isVerified: verifiedBy ? true : false,
        sourceType: normalizedSourceType,
        rightsStatus: normalizedRightsStatus,
        maskingStatus: REVIEW_MASKING_STATUSES.UNKNOWN,
        isPublic: Boolean(isPublic) && canExposePublic,
        publicSnippet: typeof publicSnippet === 'string' ? publicSnippet.trim() : undefined,
        sourceEvidence: {
          uploader: session.user.id,
          importedAt: new Date().toISOString(),
          originalUrl: originalUrl || null,
          hasImage: Boolean(imageUrl)
        },
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

    console.log('✅ 리뷰 생성 성공:', review.id)
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('🔥 리뷰 생성 중 에러 발생:')
    console.error('에러 타입:', error?.constructor?.name)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('전체 에러 객체:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : '리뷰 생성 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    }, { status: 500 })
  }
}
