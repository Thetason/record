import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRemainingReviews, PLANS } from '@/lib/plan-limits'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        planExpiry: true,
        reviewLimit: true,
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 플랜 만료 체크
    const isExpired = user.planExpiry && new Date(user.planExpiry) < new Date()
    const currentPlan = isExpired ? 'free' : user.plan
    
    if (isExpired && user.plan !== 'free') {
      // 만료된 경우 free로 다운그레이드
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          plan: 'free',
          planExpiry: null,
          reviewLimit: 50
        }
      })
    }

    const plan = currentPlan as keyof typeof PLANS
    const remainingReviews = getRemainingReviews(user._count.reviews, plan)

    return NextResponse.json({
      plan: currentPlan,
      planName: PLANS[plan].name,
      planExpiry: user.planExpiry,
      isExpired,
      reviewCount: user._count.reviews,
      reviewLimit: PLANS[plan].reviewLimit === -1 ? 'unlimited' : PLANS[plan].reviewLimit,
      remainingReviews,
      features: PLANS[plan].features
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { error: '구독 정보 확인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}