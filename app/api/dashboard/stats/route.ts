import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { checkUserPlan, PLAN_LIMITS } from '@/lib/subscription'

// GET /api/dashboard/stats - 대시보드 통계 조회
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // 모든 리뷰 가져오기
    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { reviewDate: 'desc' }
    })

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 기본 통계
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? parseFloat((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0
    const platforms = new Set(reviews.map(review => review.platform)).size

    // 월별 통계
    const thisMonthReviews = reviews.filter(review => 
      new Date(review.reviewDate) >= thisMonth
    ).length
    
    const lastMonthReviews = reviews.filter(review => {
      const reviewDate = new Date(review.reviewDate)
      return reviewDate >= lastMonth && reviewDate < thisMonth
    }).length

    // 주별 통계
    const thisWeekReviews = reviews.filter(review => 
      new Date(review.reviewDate) >= thisWeek
    ).length

    // 평점 분포
    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    }

    // 플랫폼별 통계
    const platformStats = reviews.reduce((acc, review) => {
      if (!acc[review.platform]) {
        acc[review.platform] = {
          count: 0,
          totalRating: 0,
          averageRating: 0
        }
      }
      acc[review.platform].count++
      acc[review.platform].totalRating += review.rating
      acc[review.platform].averageRating = parseFloat(
        (acc[review.platform].totalRating / acc[review.platform].count).toFixed(1)
      )
      return acc
    }, {} as Record<string, { count: number; totalRating: number; averageRating: number }>)

    // 사용자 정보 및 플랜 정보
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileViews: true,
        createdAt: true,
        plan: true,
        planExpiry: true,
        reviewLimit: true
      }
    })
    
    // 플랜 확인 (만료 체크 포함)
    const currentPlan = await checkUserPlan(userId)

    // 월별 리뷰 트렌드 (최근 6개월)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const count = reviews.filter(review => {
        const reviewDate = new Date(review.reviewDate)
        return reviewDate >= month && reviewDate < nextMonth
      }).length
      
      monthlyTrend.push({
        month: month.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        count
      })
    }

    const stats = {
      overview: {
        totalReviews,
        averageRating,
        platforms,
        thisMonth: thisMonthReviews,
        profileViews: user?.profileViews || 0
      },
      subscription: {
        plan: currentPlan,
        planExpiry: user?.planExpiry,
        reviewLimit: user?.reviewLimit || PLAN_LIMITS.free.reviews,
        reviewsUsed: totalReviews,
        reviewsRemaining: user?.reviewLimit === -1 
          ? 'unlimited' 
          : Math.max(0, (user?.reviewLimit || PLAN_LIMITS.free.reviews) - totalReviews)
      },
      trends: {
        thisWeekReviews,
        thisMonthReviews,
        lastMonthReviews,
        monthlyChange: lastMonthReviews > 0 
          ? Math.round(((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100)
          : thisMonthReviews > 0 ? 100 : 0,
        monthlyTrend
      },
      distribution: {
        ratings: ratingDistribution,
        platforms: platformStats
      },
      recent: {
        reviews: reviews.slice(0, 5).map(review => ({
          id: review.id,
          platform: review.platform,
          business: review.business,
          rating: review.rating,
          content: review.content.slice(0, 100) + (review.content.length > 100 ? '...' : ''),
          author: review.author,
          reviewDate: review.reviewDate,
          createdAt: review.createdAt
        }))
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}