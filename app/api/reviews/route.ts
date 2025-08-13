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
    const { platform, business, rating, content, author, reviewDate, imageUrl } = body

    // 입력 검증
    if (!platform || !business || !rating || !content || !author || !reviewDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        platform,
        business,
        rating: parseInt(rating),
        content,
        author,
        reviewDate: new Date(reviewDate),
        imageUrl,
        userId: session.user.id
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}