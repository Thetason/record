import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
async function handleCheckoutCompleted(data: any) {
  const { customer_email, metadata } = data

  if (!metadata?.userId || !metadata?.plan) {
    console.error('❌ Missing metadata in checkout')
    return
  }

  const planMap: Record<string, 'free' | 'premium' | 'pro'> = {
    premium: 'premium',
    business: 'pro'
  }

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      plan: planMap[metadata.plan] || 'free',
      subscriptionStatus: 'active'
    }
  })

  console.log(`✅ User ${metadata.userId} upgraded to ${metadata.plan}`)
}

// 구독 생성 처리
async function handleSubscriptionCreated(data: any) {
  const { customer_email, metadata, id } = data

  if (!metadata?.userId) return

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      subscriptionId: id,
      subscriptionStatus: 'active'
    }
  })

  console.log(`✅ Subscription ${id} created for user ${metadata.userId}`)
}

// 구독 업데이트 처리
async function handleSubscriptionUpdated(data: any) {
  const { id, status, metadata } = data

  if (!metadata?.userId) return

  const statusMap: Record<string, string> = {
    active: 'active',
    canceled: 'cancelled',
    incomplete: 'incomplete',
    past_due: 'past_due'
  }

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      subscriptionStatus: statusMap[status] || 'active'
    }
  })

  console.log(`✅ Subscription ${id} updated: ${status}`)
}

// 구독 취소 처리
async function handleSubscriptionCancelled(data: any) {
  const { metadata } = data

  if (!metadata?.userId) return

  await prisma.user.update({
    where: { id: metadata.userId },
    data: {
      plan: 'free',
      subscriptionStatus: 'cancelled'
    }
  })

  console.log(`✅ User ${metadata.userId} downgraded to free`)
}
