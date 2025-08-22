import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyPayment, SUBSCRIPTION_PRODUCTS, ProductId } from '@/lib/tosspayments'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { paymentKey, orderId, amount, productId } = await req.json()

    // 상품 검증
    const product = SUBSCRIPTION_PRODUCTS[productId as ProductId]
    if (!product) {
      return NextResponse.json({ error: '유효하지 않은 상품입니다' }, { status: 400 })
    }

    if (amount !== product.amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 })
    }

    // 토스페이먼츠 결제 검증
    const paymentData = await verifyPayment(paymentKey, orderId, amount)

    if (paymentData.status !== 'DONE') {
      return NextResponse.json({ error: '결제가 완료되지 않았습니다' }, { status: 400 })
    }

    // 플랜 만료일 계산
    const now = new Date()
    const expiryDate = new Date()
    
    if (product.period === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1)
    } else if (product.period === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 결제 정보 저장
      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          paymentId: paymentKey,
          orderId,
          amount,
          method: paymentData.method,
          status: paymentData.status,
          plan: product.plan,
          period: product.period,
          billingCycle: expiryDate
        }
      })

      // 사용자 플랜 업데이트
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          plan: product.plan,
          planExpiry: expiryDate,
          reviewLimit: -1 // 무제한
        }
      })

      return { payment, user }
    })

    return NextResponse.json({
      success: true,
      plan: result.user.plan,
      planExpiry: result.user.planExpiry,
      paymentId: result.payment.id,
      message: `${product.name} 구독이 완료되었습니다!`
    })

  } catch (error) {
    console.error('Subscription upgrade error:', error)
    return NextResponse.json(
      { error: '구독 업그레이드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}