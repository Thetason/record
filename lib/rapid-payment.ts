// Rapid Payment Integration
// 래피드 결제 서비스 연동을 위한 유틸리티

interface RapidConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  isProduction: boolean;
}

interface PaymentRequest {
  orderId: string;
  amount: number;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

interface SubscriptionRequest {
  planId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  description: string;
}

// Rapid 결제 클래스
export class RapidPayment {
  private config: RapidConfig;
  private baseUrl: string;

  constructor(config: Partial<RapidConfig> = {}) {
    this.config = {
      merchantId: process.env.RAPID_MERCHANT_ID || '',
      apiKey: process.env.RAPID_API_KEY || '',
      secretKey: process.env.RAPID_SECRET_KEY || '',
      isProduction: process.env.NODE_ENV === 'production',
      ...config
    };

    this.baseUrl = this.config.isProduction
      ? 'https://api.rapidpay.kr'
      : 'https://sandbox-api.rapidpay.kr';
  }

  // 결제 요청 생성
  async createPayment(request: PaymentRequest): Promise<any> {
    try {
      const payload = {
        merchant_id: this.config.merchantId,
        order_id: request.orderId,
        amount: request.amount,
        product_name: request.productName,
        customer_name: request.customerName,
        customer_email: request.customerEmail,
        customer_phone: request.customerPhone,
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        webhook_url: request.webhookUrl,
        metadata: request.metadata,
        timestamp: Date.now(),
      };

      // 서명 생성
      const signature = this.generateSignature(payload);

      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Payment creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Rapid payment error:', error);
      throw error;
    }
  }

  // 구독 생성
  async createSubscription(request: SubscriptionRequest): Promise<any> {
    try {
      const payload = {
        merchant_id: this.config.merchantId,
        plan_id: request.planId,
        customer_id: request.customerId,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        amount: request.amount,
        currency: request.currency || 'KRW',
        interval: request.interval,
        description: request.description,
        timestamp: Date.now(),
      };

      const signature = this.generateSignature(payload);

      const response = await fetch(`${this.baseUrl}/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Subscription creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Rapid subscription error:', error);
      throw error;
    }
  }

  // 구독 취소
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/subscriptions/${subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Subscription cancellation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Rapid cancellation error:', error);
      throw error;
    }
  }

  // 결제 상태 확인
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v1/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Payment status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Rapid status check error:', error);
      throw error;
    }
  }

  // 서명 생성 (HMAC-SHA256)
  private generateSignature(payload: any): string {
    const crypto = require('crypto');
    const message = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', this.config.secretKey);
    hmac.update(message);
    return hmac.digest('hex');
  }

  // Webhook 검증
  verifyWebhook(signature: string, payload: any): boolean {
    const expectedSignature = this.generateSignature(payload);
    return signature === expectedSignature;
  }
}

// 결제 플랜 정의
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      '리뷰 50개까지',
      '기본 프로필',
      '기본 통계',
    ],
  },
  premium: {
    id: 'premium_monthly',
    name: 'Premium',
    price: 9900,
    interval: 'monthly' as const,
    features: [
      '리뷰 무제한',
      '프로필 커스터마이징',
      '고급 통계',
      '우선 고객지원',
      'QR코드 생성',
      '워터마크 제거',
    ],
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'Premium (연간)',
    price: 95040, // 20% 할인
    interval: 'yearly' as const,
    features: [
      '리뷰 무제한',
      '프로필 커스터마이징',
      '고급 통계',
      '우선 고객지원',
      'QR코드 생성',
      '워터마크 제거',
      '연간 20% 할인',
    ],
  },
  pro: {
    id: 'pro_monthly',
    name: 'Pro',
    price: 29900,
    interval: 'monthly' as const,
    features: [
      'Premium 모든 기능',
      'AI 리뷰 분석',
      '맞춤 도메인',
      'API 액세스',
      '전담 매니저',
      '브랜딩 제거',
    ],
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro (연간)',
    price: 287040, // 20% 할인
    interval: 'yearly' as const,
    features: [
      'Premium 모든 기능',
      'AI 리뷰 분석',
      '맞춤 도메인',
      'API 액세스',
      '전담 매니저',
      '브랜딩 제거',
      '연간 20% 할인',
    ],
  },
};

// 결제 유틸리티 함수들
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// 데모 모드 (실제 결제 없이 테스트)
export class MockRapidPayment extends RapidPayment {
  async createPayment(request: PaymentRequest): Promise<any> {
    console.log('Mock payment created:', request);
    return {
      success: true,
      payment_id: `MOCK-${Date.now()}`,
      payment_url: `/payment/mock?orderId=${request.orderId}`,
      amount: request.amount,
      status: 'pending',
    };
  }

  async createSubscription(request: SubscriptionRequest): Promise<any> {
    console.log('Mock subscription created:', request);
    return {
      success: true,
      subscription_id: `SUB-MOCK-${Date.now()}`,
      status: 'active',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    console.log('Mock subscription cancelled:', subscriptionId);
    return {
      success: true,
      subscription_id: subscriptionId,
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    };
  }
}

// Export 기본 인스턴스
const rapidPayment = process.env.RAPID_API_KEY 
  ? new RapidPayment()
  : new MockRapidPayment();

export default rapidPayment;