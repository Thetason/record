import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { polar, POLAR_CONFIG } from '@/lib/polar'

// POST /api/checkout - Polar Checkout URL 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body // 'premium' or 'pro' (or 'business')

    if (!plan || !['premium', 'pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // 플랜 매핑 ('pro' → 'business')
    const polarPlan = plan === 'pro' ? 'business' : plan

    // Polar Checkout 생성
    const checkout = await polar.checkouts.custom.create({
      productPriceId: POLAR_CONFIG.products[polarPlan as 'premium' | 'business'],
      successUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&plan=${plan}`,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        plan: plan,
      }
    })

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id
    })
  } catch (error) {
    console.error('Polar checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
