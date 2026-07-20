import { NextRequest, NextResponse } from 'next/server'
import { confirmPayment } from '@/lib/tosspayments'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plan-limits'

function inferPlan(orderName: string, amount: number): 'premium' | 'pro' {
  const normalized = orderName.toLowerCase()
  if (normalized.includes('pro') || normalized.includes('비즈니스') || normalized.includes('business')) {
    return 'pro'
  }
  if (amount >= 400000) {
    return 'pro'
  }
  return 'premium'
}

function inferPeriod(orderName: string, amount: number): 'monthly' | 'yearly' {
  const normalized = orderName.toLowerCase()
  if (normalized.includes('yearly') || normalized.includes('연간')) {
    return 'yearly'
  }
  if (amount >= 200000) {
    return 'yearly'
  }
  return 'monthly'
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(new URL('/payment/fail?error=missing_params', req.url))
    }

    // 결제 승인
    const payment = await confirmPayment(paymentKey, orderId, Number(amount))

    const orderParts = orderId.split('_')
    const encodedUserId = orderParts.length >= 5 ? orderParts[2] : null
    const encodedPlan = orderParts.length >= 5 ? orderParts[3] : null
    const encodedPeriod = orderParts.length >= 5 ? orderParts[4] : null

    const plan = encodedPlan === 'pro' || encodedPlan === 'premium'
      ? encodedPlan
      : inferPlan(typeof payment.orderName === 'string' ? payment.orderName : '', Number(amount))

    const period = encodedPeriod === 'monthly' || encodedPeriod === 'yearly'
      ? encodedPeriod
      : inferPeriod(typeof payment.orderName === 'string' ? payment.orderName : '', Number(amount))

    const userId = encodedUserId || (typeof payment.customerKey === 'string' ? payment.customerKey : null)

    if (!userId) {
      return NextResponse.redirect(new URL('/payment/fail?error=missing_user', req.url))
    }

    // 사용자 플랜 업데이트
    const planExpiry = period === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiry,
        reviewLimit: PLANS[plan].reviewLimit
      }
    })

    const paymentId = typeof payment.paymentKey === 'string' ? payment.paymentKey : paymentKey
    const billingCycle = new Date(planExpiry)

    // 결제 기록 저장/업데이트
    await prisma.payment.upsert({
      where: { paymentId },
      update: {
        orderId,
        amount: Number(amount),
        status: typeof payment.status === 'string' ? payment.status : 'DONE',
        method: typeof payment.method === 'string' ? payment.method : 'card',
        plan,
        period,
        billingCycle,
      },
      create: {
        userId,
        orderId,
        paymentId,
        amount: Number(amount),
        status: typeof payment.status === 'string' ? payment.status : 'DONE',
        plan,
        period,
        method: typeof payment.method === 'string' ? payment.method : 'card',
        billingCycle,
      }
    })

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/payment/success', req.url))
  } catch (error) {
    console.error('결제 승인 오류:', error)
    return NextResponse.redirect(new URL('/payment/fail?error=payment_confirm_failed', req.url))
  }
}
