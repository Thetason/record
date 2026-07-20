import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plan-limits'

type PolarMetadata = {
  userId?: string
  plan?: string
}

type PolarData = {
  metadata?: PolarMetadata
  status?: string
}

function normalizePlan(plan: unknown): 'free' | 'premium' | 'pro' {
  if (plan === 'business' || plan === 'pro') return 'pro'
  if (plan === 'premium') return 'premium'
  return 'free'
}

function nextPlanExpiry(status: string | undefined): Date | null {
  if (status === 'canceled' || status === 'cancelled') {
    return null
  }
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

// POST /api/webhooks/polar - Polar Webhook 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('📩 Polar Webhook received:', body.type)

    // Webhook 이벤트 타입별 처리
    switch (body.type) {
      case 'checkout.created':
      case 'order.created':
        // 결제 완료
        await handleCheckoutCompleted(body.data)
        break

      case 'subscription.created':
        // 구독 생성
        await handleSubscriptionCreated(body.data)
        break

      case 'subscription.updated':
        // 구독 업데이트
        await handleSubscriptionUpdated(body.data)
        break

      case 'subscription.cancelled':
        // 구독 취소
        await handleSubscriptionCancelled(body.data)
        break

      default:
        console.log(`⚠️ Unhandled event type: ${body.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('🔥 Polar webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// 결제 완료 처리
async function handleCheckoutCompleted(data: PolarData) {
  const { metadata } = data

  if (!metadata?.userId || !metadata?.plan) {
    console.error('❌ Missing metadata in checkout')
    return
  }

  const plan = normalizePlan(metadata.plan)
  const reviewLimit = PLANS[plan].reviewLimit
  const planExpiry = plan === 'free' ? null : nextPlanExpiry('active')

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      plan,
      reviewLimit,
      planExpiry,
    }
  })

  console.log(`✅ User ${metadata.userId} upgraded to ${metadata.plan}`)
}

// 구독 생성 처리
async function handleSubscriptionCreated(data: PolarData) {
  const { metadata, status } = data

  if (!metadata?.userId) return

  const plan = normalizePlan(metadata.plan)
  const reviewLimit = PLANS[plan].reviewLimit

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      plan,
      reviewLimit,
      planExpiry: nextPlanExpiry(status),
    }
  })

  console.log(`✅ Subscription created for user ${metadata.userId}`)
}

// 구독 업데이트 처리
async function handleSubscriptionUpdated(data: PolarData) {
  const { status, metadata } = data

  if (!metadata?.userId) return

  const plan = normalizePlan(metadata.plan)
  const reviewLimit = PLANS[plan].reviewLimit

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      plan,
      reviewLimit,
      planExpiry: nextPlanExpiry(status),
    }
  })

  console.log(`✅ Subscription updated: ${status}`)
}

// 구독 취소 처리
async function handleSubscriptionCancelled(data: PolarData) {
  const { metadata } = data

  if (!metadata?.userId) return

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      plan: 'free',
      reviewLimit: PLANS.free.reviewLimit,
      planExpiry: null,
    }
  })

  console.log(`✅ User ${metadata.userId} downgraded to free`)
}
