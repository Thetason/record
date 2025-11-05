import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// 레몬스퀴즈 서명 검증
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// 레몬스퀴즈 이벤트 타입
type LemonSqueezyEvent = {
  meta: {
    event_name: string
    custom_data?: {
      user_id?: string
      user_email?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: {
      status: string
      user_email: string
      user_name: string
      product_name: string
      variant_name: string
      first_order_item: {
        product_id: number
        variant_id: number
      }
      renews_at?: string
      ends_at?: string
      customer_id: number
      order_id: number
      total: number
      subtotal: number
      tax: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 읽기
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || ''
    
    // 2. 서명 검증 (프로덕션에서는 필수)
    const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET
    if (signingSecret && signature) {
      const isValid = verifySignature(rawBody, signature, signingSecret)
      if (!isValid) {
        console.error('❌ Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // 3. JSON 파싱
    const event: LemonSqueezyEvent = JSON.parse(rawBody)
    const eventName = event.meta.event_name
    const { attributes } = event.data

    console.log('🍋 레몬스퀴즈 웹훅 수신:', eventName)
    console.log('📧 사용자 이메일:', attributes.user_email)
    console.log('📦 제품:', attributes.product_name)

    // 4. 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: attributes.user_email }
    })

    if (!user) {
      console.error('❌ 사용자를 찾을 수 없음:', attributes.user_email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 5. 플랜 결정 (제품명 기반)
    const productName = attributes.product_name.toLowerCase()
    let plan: string = 'free'
    
    if (productName.includes('premium') || productName.includes('프리미엄')) {
      plan = 'premium'
    } else if (productName.includes('pro') || productName.includes('business') || productName.includes('비즈니스')) {
      plan = 'pro'
    }

    // 6. 이벤트별 처리
    switch (eventName) {
      case 'order_created':
      case 'subscription_created':
        // 구독 시작 - 플랜 업그레이드
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan,
            reviewLimit: plan === 'premium' ? 100 : -1,
            planExpiry: attributes.renews_at ? new Date(attributes.renews_at) : null
          }
        })

        // 결제 기록 저장
        await prisma.payment.create({
          data: {
            userId: user.id,
            paymentId: `ls_${event.data.id}`,
            orderId: String(attributes.order_id),
            amount: attributes.total,
            method: 'lemonsqueezy',
            status: 'DONE',
            plan,
            period: 'monthly',
            billingCycle: attributes.renews_at ? new Date(attributes.renews_at) : new Date()
          }
        })

        console.log(`✅ ${user.email} → ${plan} 플랜 업그레이드 완료`)
        break

      case 'subscription_updated':
        // 구독 업데이트 (플랜 변경 등)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan,
            reviewLimit: plan === 'premium' ? 100 : -1,
            planExpiry: attributes.renews_at ? new Date(attributes.renews_at) : null
          }
        })
        console.log(`✅ ${user.email} 플랜 업데이트: ${plan}`)
        break

      case 'order_refunded':
        // 환불 처리 - 무료 플랜으로 다운그레이드
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'free',
            reviewLimit: 50,
            planExpiry: null
          }
        })
        
        // 결제 상태 업데이트
        await prisma.payment.updateMany({
          where: { 
            userId: user.id,
            orderId: String(attributes.order_id)
          },
          data: { status: 'CANCELED' }
        })
        
        console.log(`✅ ${user.email} 환불 처리 완료 → 무료 플랜`)
        break

      case 'subscription_cancelled':
      case 'subscription_expired':
        // 구독 취소/만료 - 무료 플랜으로 다운그레이드
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'free',
            reviewLimit: 50,
            planExpiry: null
          }
        })
        console.log(`✅ ${user.email} → 무료 플랜으로 다운그레이드`)
        break

      case 'subscription_payment_failed':
        // 결제 실패 - 사용자에게 알림 (플랜 유지)
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'in_app',
            category: 'payment_failed',
            title: '결제 실패 알림',
            content: `${plan} 플랜 결제가 실패했습니다. 카드 정보를 확인해주세요.`
          }
        })
        console.log(`⚠️ ${user.email} 결제 실패 알림 전송`)
        break

      case 'subscription_payment_success':
        // 결제 성공 - 다음 결제일 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: {
            planExpiry: attributes.renews_at ? new Date(attributes.renews_at) : null
          }
        })
        
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'in_app',
            category: 'payment_success',
            title: '결제 완료',
            content: `${plan} 플랜이 갱신되었습니다. 다음 결제일은 ${attributes.renews_at ? new Date(attributes.renews_at).toLocaleDateString('ko-KR') : '미정'}입니다.`
          }
        })
        console.log(`✅ ${user.email} 결제 성공 → 갱신 완료`)
        break

      case 'subscription_resumed':
      case 'subscription_unpaused':
        // 구독 재개
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan,
            reviewLimit: plan === 'premium' ? 100 : -1,
            planExpiry: attributes.renews_at ? new Date(attributes.renews_at) : null
          }
        })
        console.log(`✅ ${user.email} 구독 재개: ${plan}`)
        break

      case 'subscription_paused':
        // 구독 일시정지 - 플랜은 유지하되 만료일만 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: {
            planExpiry: attributes.ends_at ? new Date(attributes.ends_at) : null
          }
        })
        console.log(`✅ ${user.email} 구독 일시정지`)
        break

      default:
        console.log(`ℹ️  처리하지 않는 이벤트: ${eventName}`)
    }

    // 7. 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: eventName,
        category: 'payment',
        details: {
          event: eventName,
          plan,
          product: attributes.product_name,
          amount: attributes.total
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `이벤트 처리 완료: ${eventName}` 
    })

  } catch (error) {
    console.error('❌ 웹훅 처리 오류:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET 요청 (웹훅 테스트용)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'LemonSqueezy webhook endpoint is ready',
    url: '/api/webhooks/lemonsqueezy'
  })
}
