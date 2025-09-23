import { loadTossPayments } from '@tosspayments/payment-sdk'
import { PLANS, PlanType, getPlanPrice, getYearlySavings } from '@/lib/plan-limits'

// 토스페이먼츠 클라이언트 키 (테스트용)
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

// 토스페이먼츠 시크릿 키 (서버 사이드용)
export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'

export type BillingPeriod = 'monthly' | 'yearly'
export type PaidPlanId = Exclude<PlanType, 'free'>

const PAID_PLAN_IDS: PaidPlanId[] = ['premium', 'pro']
const BILLING_PERIODS: BillingPeriod[] = ['monthly', 'yearly']

// 결제 플랜 정보 (UI 및 결제 공통 사용)
type PaymentPlanConfig = {
  id: PaidPlanId
  name: string
  price: Record<BillingPeriod, number>
  features: string[]
}

export const PAYMENT_PLANS: Record<PaidPlanId, PaymentPlanConfig> = PAID_PLAN_IDS.reduce((acc, plan) => {
  acc[plan] = {
    id: plan,
    name: PLANS[plan].name,
    price: {
      monthly: getPlanPrice(plan, 'monthly'),
      yearly: getPlanPrice(plan, 'yearly')
    },
    features: PLANS[plan].marketingHighlights,
  }
  return acc
}, {} as Record<PaidPlanId, PaymentPlanConfig>)

// 구독 상품 정보 (토스 결제 금액 검증용)
export type ProductId = `${PaidPlanId}_${BillingPeriod}`

type SubscriptionProduct = {
  id: ProductId
  name: string
  amount: number
  currency: 'KRW'
  plan: PaidPlanId
  period: BillingPeriod
  features: string[]
  savings: number
}

export const SUBSCRIPTION_PRODUCTS: Record<ProductId, SubscriptionProduct> = Object.fromEntries(
  PAID_PLAN_IDS.flatMap((plan) =>
    BILLING_PERIODS.map((period) => {
      const id = `${plan}_${period}` as ProductId
      const amount = getPlanPrice(plan, period)
      const savings = period === 'yearly' ? getYearlySavings(plan) : 0
      return [
        id,
        {
          id,
          name: `${PLANS[plan].name} ${period === 'monthly' ? '월간' : '연간'} 구독`,
          amount,
          currency: 'KRW',
          plan,
          period,
          features: PLANS[plan].marketingHighlights,
          savings,
        }
      ]
    })
  )
) as Record<ProductId, SubscriptionProduct>

// 토스페이먼츠 클라이언트 초기화
export async function initTossPayments() {
  try {
    return await loadTossPayments(CLIENT_KEY)
  } catch (error) {
    console.error('토스페이먼츠 초기화 실패:', error)
    throw error
  }
}

// 주문 ID 생성 (고유해야 함)
export function generateOrderId() {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 결제 요청 데이터 생성
export function createPaymentData(plan: PaidPlanId, period: BillingPeriod, user: { name?: string | null; email?: string | null }) {
  const selectedPlan = PAYMENT_PLANS[plan]
  if (!selectedPlan) {
    throw new Error('유효하지 않은 플랜입니다')
  }

  const amount = selectedPlan.price[period]
  const orderId = generateOrderId()
  const orderName = `${selectedPlan.name} ${period === 'monthly' ? '월간' : '연간'} 구독`

  return {
    amount,
    orderId,
    orderName,
    customerName: user.name ?? '고객',
    customerEmail: user.email ?? '',
    successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/payments/success`,
    failUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/payments/fail`,
  }
}

// 결제 검증 (서버 사이드)
export async function verifyPayment(paymentKey: string, orderId: string, amount: number) {
  const url = `https://api.tosspayments.com/v1/payments/${paymentKey}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('결제 검증 실패')
    }

    const payment = await response.json()

    // 결제 정보 검증
    if (payment.orderId !== orderId || payment.totalAmount !== amount) {
      throw new Error('결제 정보가 일치하지 않습니다')
    }

    return payment
  } catch (error) {
    console.error('결제 검증 오류:', error)
    throw error
  }
}

// 결제 승인 (서버 사이드)
export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const url = 'https://api.tosspayments.com/v1/payments/confirm'
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '결제 승인 실패')
    }

    return await response.json()
  } catch (error) {
    console.error('결제 승인 오류:', error)
    throw error
  }
}

// 결제 취소 (서버 사이드)
export async function cancelPayment(paymentKey: string, cancelReason: string) {
  const url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '결제 취소 실패')
    }

    return await response.json()
  } catch (error) {
    console.error('결제 취소 오류:', error)
    throw error
  }
}
