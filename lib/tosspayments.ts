import { loadTossPayments } from '@tosspayments/payment-sdk'

// 토스페이먼츠 클라이언트 키 (테스트용)
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

// 토스페이먼츠 시크릿 키 (서버 사이드용)
export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'

// 결제 플랜 정보
export const PAYMENT_PLANS = {
  premium: {
    id: 'premium',
    name: '프리미엄',
    price: {
      monthly: 9900,
      yearly: 99000
    },
    features: [
      '리뷰 무제한 등록',
      '고급 통계 분석',
      '맞춤형 리뷰 위젯',
      '우선 고객 지원',
      'CSV 대량 업로드'
    ]
  },
  pro: {
    id: 'pro', 
    name: '프로',
    price: {
      monthly: 19900,
      yearly: 199000
    },
    features: [
      '프리미엄 모든 기능',
      'API 액세스',
      '브랜드 제거',
      '커스텀 도메인',
      '전담 매니저 지원',
      '맞춤형 디자인'
    ]
  }
}

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
export function createPaymentData(plan: string, period: 'monthly' | 'yearly', user: any) {
  const selectedPlan = PAYMENT_PLANS[plan as keyof typeof PAYMENT_PLANS]
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
    customerName: user.name,
    customerEmail: user.email,
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