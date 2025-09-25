import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAddReview, getUserReviewCount } from '@/lib/subscription'

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

    const where = {
      userId: session.user.id,
      ...(platform && platform !== 'all' && { platform }),
      ...(search && {
        OR: [
          { business: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } }
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 플랜 리뷰 제한 확인
    const canAdd = await canAddReview(session.user.id)
    if (!canAdd) {
      const reviewCount = await getUserReviewCount(session.user.id)
      return NextResponse.json({ 
        error: 'Review limit reached', 
        message: `무료 플랜은 최대 50개의 리뷰만 등록할 수 있습니다. 현재 ${reviewCount}개를 사용 중입니다.`,
        reviewCount,
        limit: 50
      }, { status: 403 })
    }

    const body = await request.json()
    const { platform, business, content, author, reviewDate, imageUrl, originalUrl, verifiedBy } = body

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
        reviewDate: parsedDate,
        imageUrl,
        originalUrl,
        verifiedBy,
        isVerified: verifiedBy ? true : false,
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
