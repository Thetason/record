import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    // 관리자 권한 체크
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 통계 데이터 수집
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [
      totalUsers,
      totalReviews,
      pendingReports,
      newUsersToday,
      activeUsersLastWeek,
      monthlyPayments
    ] = await Promise.all([
      // 전체 사용자 수
      prisma.user.count(),
      
      // 전체 리뷰 수
      prisma.review.count(),
      
      // 대기 중인 신고
      prisma.report.count({
        where: { status: 'pending' }
      }),
      
      // 오늘 가입한 사용자
      prisma.user.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      
      // 최근 7일 활성 사용자 (로그인 기준)
      prisma.session.groupBy({
        by: ['userId'],
        where: {
          expires: { gte: lastWeek }
        }
      }),
      
      // 이번 달 결제 총액
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: lastMonth },
          status: 'DONE'
        },
        _sum: {
          amount: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalReviews,
      totalReports: pendingReports,
      newUsersToday,
      activeUsers: activeUsersLastWeek.length,
      monthlyRevenue: monthlyPayments._sum.amount || 0
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}