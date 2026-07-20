import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/lib/auth'
import { apiLimits, getIP, rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import {
  buildLemonCheckoutHref,
  type LemonBillingPeriod,
  type LemonPlanId,
} from '@/lib/lemonsqueezy'

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 })

function normalizePlan(input: unknown): LemonPlanId | null {
  if (input === 'premium') return 'premium'
  if (input === 'pro' || input === 'business') return 'pro'

  if (typeof input === 'string') {
    if (input.includes('premium')) return 'premium'
    if (input.includes('pro') || input.includes('business')) return 'pro'
  }

  return null
}

function normalizePeriod(input: unknown): LemonBillingPeriod {
  if (input === 'yearly') return 'yearly'
  if (typeof input === 'string' && input.includes('yearly')) return 'yearly'
  return 'monthly'
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getIP(req) || 'unknown'
    try {
      await limiter.check(req, apiLimits.payment, `checkout_${clientIp}`)
    } catch {
      return rateLimitResponse()
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await req.json()
    const plan = normalizePlan(body.plan ?? body.planId)
    const period = normalizePeriod(body.period ?? body.planId)

    if (!plan) {
      return NextResponse.json({ error: '유효하지 않은 결제 요청입니다.' }, { status: 400 })
    }

    const checkoutUrl = buildLemonCheckoutHref({
      plan,
      period,
      email: session.user.email,
      userId: session.user.id,
    })

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: '이 결제 주기의 Lemon checkout 링크가 아직 설정되지 않았습니다.' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      provider: 'lemonsqueezy',
      checkoutUrl,
    })
  } catch (error) {
    console.error('Lemon checkout error:', error)
    return NextResponse.json({ error: '결제 세션 생성에 실패했습니다.' }, { status: 500 })
  }
}
