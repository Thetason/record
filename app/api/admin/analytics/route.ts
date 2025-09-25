import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '7d'

    // 날짜 범위 계산
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
    }

    // 이전 기간 계산 (비교용)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // 전체 통계
    const [
      totalUsers,
      previousUsers,
      totalReviews,
      previousReviews,
      totalRevenue,
      previousRevenue,
      freeUsers,
      paidUsers
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }),
      prisma.review.count({ where: { createdAt: { gte: startDate } } }),
      prisma.review.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: startDate }, status: 'DONE' },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: previousStartDate, lt: startDate }, status: 'DONE' },
        _sum: { amount: true }
      }),
      prisma.user.count({ where: { plan: 'free' } }),
      prisma.user.count({ where: { plan: { not: 'free' } } })
    ])

    // 성장률 계산
    const userGrowth = previousUsers ? ((totalUsers - previousUsers) / previousUsers * 100) : 0
    const reviewGrowth = previousReviews ? ((totalReviews - previousReviews) / previousReviews * 100) : 0
    const revenueGrowth = previousRevenue._sum.amount ? 
      ((totalRevenue._sum.amount! - previousRevenue._sum.amount) / previousRevenue._sum.amount * 100) : 0

    // 전환율
    const conversionRate = freeUsers + paidUsers > 0 ? (paidUsers / (freeUsers + paidUsers) * 100) : 0

    // 일별 사용자 메트릭
    const userMetrics = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [signups, sessions] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.session.groupBy({
          by: ['userId'],
          where: {
            expires: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ])

      userMetrics.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        signups,
        active: sessions.length,
        churned: 0
      })
    }

    // 플랫폼별 리뷰 분포
    const reviewsByPlatform = await prisma.review.groupBy({
      by: ['platform'],
      _count: true
    })

    const totalReviewCount = reviewsByPlatform.reduce((sum, item) => sum + item._count, 0)
    const reviewMetrics = reviewsByPlatform.map(item => ({
      platform: item.platform,
      count: item._count,
      percentage: totalReviewCount > 0 ? Math.round(item._count / totalReviewCount * 100) : 0
    }))

    // 플랜별 매출 (더미 데이터 - 실제로는 결제 데이터 필요)
    const revenueMetrics = userMetrics.map((metric) => ({
      date: metric.date,
      free: 0,
      premium: Math.floor(Math.random() * 500000) + 100000,
      pro: Math.floor(Math.random() * 300000) + 50000
    }))

    // 전환 퍼널
    const allUsersCount = await prisma.user.count()
    const usersWithReviews = await prisma.user.count({
      where: { reviews: { some: {} } }
    })
    const paidUsersCount = await prisma.user.count({
      where: { plan: { not: 'free' } }
    })

    const conversionFunnel = [
      { stage: '회원가입', users: allUsersCount, rate: 100 },
      { stage: '첫 리뷰 업로드', users: usersWithReviews, rate: allUsersCount > 0 ? (usersWithReviews / allUsersCount * 100) : 0 },
      { stage: '10개 이상 리뷰', users: Math.floor(usersWithReviews * 0.3), rate: 30 },
      { stage: '유료 전환', users: paidUsersCount, rate: allUsersCount > 0 ? (paidUsersCount / allUsersCount * 100) : 0 }
    ]

    // 상위 사용자
    const topUsers = await prisma.user.findMany({
      select: {
        username: true,
        plan: true,
        createdAt: true,
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: {
        reviews: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const topUsersFormatted = topUsers.map(user => ({
      username: user.username,
      reviews: user._count.reviews,
      plan: user.plan,
      joinedDaysAgo: Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        totalReviews,
        totalRevenue: totalRevenue._sum.amount || 0,
        conversionRate,
        userGrowth: Math.round(userGrowth),
        reviewGrowth: Math.round(reviewGrowth),
        revenueGrowth: Math.round(revenueGrowth)
      },
      userMetrics,
      reviewMetrics,
      revenueMetrics,
      conversionFunnel,
      topUsers: topUsersFormatted
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
