import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { PLANS } from '@/lib/plan-limits'
import { prisma } from '@/lib/prisma'

type LemonEventName =
  | 'order_created'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_expired'
  | 'subscription_payment_failed'
  | 'subscription_payment_success'
  | 'subscription_resumed'
  | 'subscription_unpaused'
  | 'subscription_paused'
  | 'order_refunded'

type LemonPlan = 'free' | 'premium' | 'pro'
type LemonPeriod = 'monthly' | 'yearly'

type LemonSqueezyEvent = {
  meta?: {
    event_name?: LemonEventName
    custom_data?: {
      user_id?: string
      user_email?: string
      plan?: string
      period?: string
    }
  }
  data?: {
    id?: string
    attributes?: {
      status?: string
      user_email?: string
      user_name?: string
      product_name?: string
      variant_name?: string
      first_order_item?: {
        product_id?: number
        variant_id?: number
      }
      renews_at?: string
      ends_at?: string
      customer_id?: number
      order_id?: number
      total?: number
      subtotal?: number
      tax?: number
    }
  }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  const signatureBuffer = Buffer.from(signature)
  const digestBuffer = Buffer.from(digest)

  if (signatureBuffer.length !== digestBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer)
}

function parseVariantId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizePlan(value: unknown): LemonPlan | null {
  if (value === 'premium') return 'premium'
  if (value === 'pro' || value === 'business') return 'pro'
  if (value === 'free') return 'free'

  if (typeof value !== 'string') return null

  const normalized = value.toLowerCase()
  if (normalized.includes('premium') || normalized.includes('프리미엄')) return 'premium'
  if (
    normalized.includes('pro') ||
    normalized.includes('business') ||
    normalized.includes('비즈니스')
  ) {
    return 'pro'
  }
  if (normalized.includes('free') || normalized.includes('프리')) return 'free'
  return null
}

function normalizePeriod(value: unknown): LemonPeriod | null {
  if (value === 'monthly' || value === 'month') return 'monthly'
  if (value === 'yearly' || value === 'annual' || value === 'year') return 'yearly'

  if (typeof value !== 'string') return null

  const normalized = value.toLowerCase()
  if (normalized.includes('year') || normalized.includes('annual') || normalized.includes('연간')) {
    return 'yearly'
  }
  if (normalized.includes('month') || normalized.includes('월간')) {
    return 'monthly'
  }
  return null
}

function inferPlanAndPeriod(event: LemonSqueezyEvent): { plan: LemonPlan; period: LemonPeriod } {
  const variantId = event.data?.attributes?.first_order_item?.variant_id ?? null
  const variantName = event.data?.attributes?.variant_name || ''
  const productName = event.data?.attributes?.product_name || ''
  const customData = event.meta?.custom_data

  const variantMap = {
    premiumMonthly: parseVariantId(process.env.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID),
    premiumYearly: parseVariantId(process.env.LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID),
    proMonthly: parseVariantId(process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID),
    proYearly: parseVariantId(process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID),
  }

  if (variantId && variantId === variantMap.premiumMonthly) {
    return { plan: 'premium', period: 'monthly' }
  }
  if (variantId && variantId === variantMap.premiumYearly) {
    return { plan: 'premium', period: 'yearly' }
  }
  if (variantId && variantId === variantMap.proMonthly) {
    return { plan: 'pro', period: 'monthly' }
  }
  if (variantId && variantId === variantMap.proYearly) {
    return { plan: 'pro', period: 'yearly' }
  }

  const planFromMetadata = normalizePlan(customData?.plan)
  const periodFromMetadata = normalizePeriod(customData?.period)

  const inferredPlan =
    planFromMetadata ||
    normalizePlan(variantName) ||
    normalizePlan(productName) ||
    'free'

  const inferredPeriod =
    periodFromMetadata ||
    normalizePeriod(variantName) ||
    normalizePeriod(productName) ||
    'monthly'

  return {
    plan: inferredPlan,
    period: inferredPeriod,
  }
}

function nextBillingCycle(period: LemonPeriod, renewsAt?: string, endsAt?: string) {
  const candidate = renewsAt || endsAt
  if (candidate) {
    const date = new Date(candidate)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  const fallback = new Date()
  if (period === 'yearly') {
    fallback.setFullYear(fallback.getFullYear() + 1)
  } else {
    fallback.setMonth(fallback.getMonth() + 1)
  }
  return fallback
}

async function findTargetUser(event: LemonSqueezyEvent) {
  const userId = event.meta?.custom_data?.user_id
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })
    if (user) return user
  }

  const userEmail = event.data?.attributes?.user_email || event.meta?.custom_data?.user_email
  if (!userEmail) return null

  return prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true },
  })
}

async function persistPaymentEvent(input: {
  userId: string
  eventId: string
  orderId: string
  amount: number
  status: string
  plan: LemonPlan
  period: LemonPeriod
  billingCycle: Date
}) {
  if (input.plan === 'free') {
    return
  }

  await prisma.payment.upsert({
    where: { paymentId: `ls_${input.eventId}` },
    update: {
      orderId: input.orderId,
      amount: input.amount,
      method: 'lemonsqueezy',
      status: input.status,
      plan: input.plan,
      period: input.period,
      billingCycle: input.billingCycle,
    },
    create: {
      userId: input.userId,
      paymentId: `ls_${input.eventId}`,
      orderId: input.orderId,
      amount: input.amount,
      method: 'lemonsqueezy',
      status: input.status,
      plan: input.plan,
      period: input.period,
      billingCycle: input.billingCycle,
    },
  })
}

async function logPaymentActivity(input: {
  userId: string
  userEmail: string
  eventName: string
  plan: LemonPlan
  period: LemonPeriod
  productName?: string
  variantName?: string
  amount: number
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        userEmail: input.userEmail,
        action: input.eventName,
        category: 'payment',
        details: {
          event: input.eventName,
          plan: input.plan,
          period: input.period,
          product: input.productName,
          variant: input.variantName,
          amount: input.amount,
        },
      },
    })
  } catch (error) {
    console.warn('Failed to write payment activity log', error)
  }
}

async function notifyPaymentFailure(userId: string, plan: LemonPlan) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: 'in_app',
        category: 'payment_failed',
        title: '결제 실패 알림',
        content: `${plan} 플랜 결제가 실패했습니다. 결제 수단을 확인해주세요.`,
      },
    })
  } catch (error) {
    console.warn('Failed to create payment failure notification', error)
  }
}

async function notifyPaymentSuccess(userId: string, plan: LemonPlan, renewsAt?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: 'in_app',
        category: 'payment_success',
        title: '결제 완료',
        content: `${plan} 플랜이 갱신되었습니다.${renewsAt ? ` 다음 결제일은 ${new Date(renewsAt).toLocaleDateString('ko-KR')}입니다.` : ''}`,
      },
    })
  } catch (error) {
    console.warn('Failed to create payment success notification', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || ''
    const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET

    if (signingSecret) {
      if (!signature || !verifySignature(rawBody, signature, signingSecret)) {
        console.error('❌ Invalid LemonSqueezy signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody) as LemonSqueezyEvent
    const eventName = event.meta?.event_name
    const eventId = event.data?.id
    const attributes = event.data?.attributes

    if (!eventName || !eventId || !attributes) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    const user = await findTargetUser(event)
    if (!user) {
      console.error('❌ Lemon webhook user not found', {
        eventName,
        userEmail: attributes.user_email,
        customUserId: event.meta?.custom_data?.user_id,
      })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { plan, period } = inferPlanAndPeriod(event)
    const amount = Number(attributes.total || 0)
    const orderId = String(attributes.order_id || `ls_order_${eventId}`)
    const billingCycle = nextBillingCycle(period, attributes.renews_at, attributes.ends_at)

    switch (eventName) {
      case 'order_created':
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_unpaused':
      case 'subscription_payment_success':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan,
            reviewLimit: PLANS[plan].reviewLimit,
            planExpiry: billingCycle,
          },
        })

        await persistPaymentEvent({
          userId: user.id,
          eventId,
          orderId,
          amount,
          status: attributes.status || 'paid',
          plan,
          period,
          billingCycle,
        })

        if (eventName === 'subscription_payment_success') {
          await notifyPaymentSuccess(user.id, plan, attributes.renews_at)
        }
        break

      case 'subscription_payment_failed':
        await notifyPaymentFailure(user.id, plan)
        break

      case 'order_refunded':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'free',
            reviewLimit: PLANS.free.reviewLimit,
            planExpiry: null,
          },
        })

        await prisma.payment.updateMany({
          where: {
            userId: user.id,
            OR: [
              { orderId },
              { paymentId: `ls_${eventId}` },
            ],
          },
          data: { status: 'refunded' },
        })
        break

      case 'subscription_cancelled':
      case 'subscription_expired':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'free',
            reviewLimit: PLANS.free.reviewLimit,
            planExpiry: null,
          },
        })

        await prisma.payment.updateMany({
          where: { userId: user.id, orderId },
          data: { status: eventName },
        })
        break

      case 'subscription_paused':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            planExpiry: attributes.ends_at ? new Date(attributes.ends_at) : null,
          },
        })
        break

      default:
        console.log(`ℹ️ Unhandled LemonSqueezy event: ${eventName}`)
    }

    await logPaymentActivity({
      userId: user.id,
      userEmail: user.email,
      eventName,
      plan,
      period,
      productName: attributes.product_name,
      variantName: attributes.variant_name,
      amount,
    })

    return NextResponse.json({
      success: true,
      message: `Processed ${eventName}`,
    })
  } catch (error) {
    console.error('❌ Lemon webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'LemonSqueezy webhook endpoint is ready',
    url: '/api/webhooks/lemonsqueezy',
  })
}

