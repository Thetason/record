import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // 관리자 권한 체크
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 필터 조건 설정
    let where: any = {}
    
    if (status !== 'all') {
      if (status === 'flagged') {
        // 신고된 리뷰 (신고가 1건 이상)
        where = {
          reports: {
            some: {
              status: 'pending'
            }
          }
        }
      } else {
        where.verificationStatus = status
      }
    }

    // 리뷰 조회
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              plan: true
            }
          },
          _count: {
            select: {
              reports: true
            }
          }
        },
        orderBy: [
          // 신고된 리뷰 우선
          {
            reports: {
              _count: 'desc'
            }
          },
          // 대기중인 리뷰 우선
          {
            verificationStatus: 'asc'
          },
          // 최신순
          {
            createdAt: 'desc'
          }
        ],
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    // 품질 점수 계산
    const reviewsWithScore = reviews.map(review => {
      let qualityScore = review.qualityScore
      
      if (!qualityScore) {
        // 품질 점수 자동 계산
        qualityScore = 50 // 기본 점수
        
        // 리뷰 길이
        if (review.content.length > 200) qualityScore += 20
        else if (review.content.length > 100) qualityScore += 10
        
        // 이미지 포함
        if (review.imageUrl) qualityScore += 20
        
        // 평점이 극단적이지 않음
        if (review.rating >= 2 && review.rating <= 4) qualityScore += 10
        
        qualityScore = Math.min(qualityScore, 100)
      }

      return {
        ...review,
        qualityScore
      }
    })

    return NextResponse.json(reviewsWithScore)
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}