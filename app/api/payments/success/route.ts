import { NextRequest, NextResponse } from 'next/server'
import { confirmPayment } from '@/lib/tosspayments'
import { prisma } from '@/lib/prisma'

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

    // 주문 정보에서 사용자 ID와 플랜 정보 추출
    const [, , userId, plan, period] = orderId.split('_')

    // 사용자 플랜 업데이트
    const planExpiry = period === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiry,
        reviewLimit: plan === 'pro' ? -1 : 1000 // pro는 무제한, premium은 1000개
      }
    })

    // 결제 기록 저장
    await prisma.payment.create({
      data: {
        userId,
        orderId,
        paymentKey,
        amount: Number(amount),
        status: 'completed',
        plan,
        period,
        method: payment.method || 'card',
      }
    })

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/payment/success', req.url))
  } catch (error) {
    console.error('결제 승인 오류:', error)
    return NextResponse.redirect(new URL('/payment/fail?error=payment_confirm_failed', req.url))
  }
}
