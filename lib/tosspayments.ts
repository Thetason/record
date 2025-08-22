// 토스페이먼츠 결제 설정
import { v4 as uuidv4 } from 'uuid'

// 테스트 키 (프로덕션에서는 환경 변수로 교체)
export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'

export const SUBSCRIPTION_PRODUCTS = {
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Re:cord 프리미엄 월간',
    amount: 9900,
    period: 'monthly',
    plan: 'premium',
    description: '리뷰 무제한, 고급 통계, 워터마크 제거'
  },
  premium_yearly: {
    id: 'premium_yearly', 
    name: 'Re:cord 프리미엄 연간',
    amount: 99000, // 2개월 할인
    period: 'yearly',
    plan: 'premium',
    description: '리뷰 무제한, 고급 통계, 워터마크 제거 (17% 할인)'
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Re:cord 프로 월간',
    amount: 19900,
    period: 'monthly',
    plan: 'pro',
    description: '프리미엄 + 커스텀 도메인, API, 팀 협업'
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Re:cord 프로 연간',
    amount: 199000, // 2개월 할인
    period: 'yearly', 
    plan: 'pro',
    description: '프리미엄 + 커스텀 도메인, API, 팀 협업 (17% 할인)'
  }
} as const

export type ProductId = keyof typeof SUBSCRIPTION_PRODUCTS

export function generateOrderId(): string {
  return `order_${Date.now()}_${uuidv4().slice(0, 8)}`
}

export async function verifyPayment(paymentKey: string, orderId: string, amount: number) {
  const basicToken = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')
  
  try {
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || '결제 검증 실패')
    }

    return data
  } catch (error) {
    console.error('Payment verification error:', error)
    throw error
  }
}

export async function cancelPayment(paymentKey: string, cancelReason: string) {
  const basicToken = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')
  
  try {
    const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || '결제 취소 실패')
    }

    return data
  } catch (error) {
    console.error('Payment cancellation error:', error)
    throw error
  }
}