import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/lib/auth'
import {
  buildLemonCheckoutHref,
  type LemonBillingPeriod,
  type LemonPlanId,
} from '@/lib/lemonsqueezy'

function normalizePlan(plan: unknown): LemonPlanId | null {
  if (plan === 'premium') return 'premium'
  if (plan === 'pro' || plan === 'business') return 'pro'
  return null
}

function normalizePeriod(period: unknown): LemonBillingPeriod {
  return period === 'yearly' ? 'yearly' : 'monthly'
}

// POST /api/checkout - Lemon Squeezy checkout URL 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = normalizePlan(body.plan)
    const period = normalizePeriod(body.period)

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const checkoutUrl = buildLemonCheckoutHref({
      plan,
      period,
      email: session.user.email,
      userId: session.user.id,
    })

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Lemon checkout URL is not configured for this plan and billing period.' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      provider: 'lemonsqueezy',
      checkoutUrl,
    })
  } catch (error) {
    console.error('Lemon checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
