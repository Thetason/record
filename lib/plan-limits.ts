// 플랜별 기능, 가격, 마케팅 정보의 단일 소스

export const PLAN_ORDER = ['free', 'premium', 'pro'] as const
export const PUBLIC_PLAN_ORDER = ['free', 'premium'] as const

export type PlanType = typeof PLAN_ORDER[number]

type PlanFeatureFlags = {
  basicProfile: boolean
  basicStats: boolean
  customTheme: boolean
  customDomain: boolean
  advancedAnalytics: boolean
  apiAccess: boolean
  prioritySupport: boolean
  removeWatermark: boolean
  customCss: boolean
  exportData: boolean
  teamMembers: number
}

type PlanPricing = {
  monthly: number
  yearly?: number
  yearlyDiscountPercent?: number
}

type PlanDefinition = {
  id: PlanType
  name: string
  description: string
  badge?: string
  highlight: string
  reviewLimit: number
  pricing: PlanPricing
  supportLevel: string
  bestFor: string
  marketingHighlights: string[]
  features: PlanFeatureFlags
}

export const PLANS: Record<PlanType, PlanDefinition> = {
  free: {
    id: 'free',
    name: '무료',
    description: '처음 링크를 열어보는 개인 전문가용',
    highlight: '처음엔 무료로 링크를 열고, 실제로 보내보기 시작하면 됩니다.',
    reviewLimit: 20,
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    supportLevel: '이메일 지원 · 2~3영업일',
    bestFor: '샵 이동, 독립, 소개 전 신뢰가 필요한 개인 전문가',
    marketingHighlights: [
      '공개 신뢰 포트폴리오 1개',
      '대표 후기 3개 + 기본 후기 운영',
      '후기 요청 링크와 기본 공유'
    ],
    features: {
      basicProfile: true,
      basicStats: true,
      customTheme: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
      removeWatermark: false,
      customCss: false,
      exportData: false,
      teamMembers: 0,
    }
  },
  premium: {
    id: 'premium',
    name: '프로',
    description: '실제 고객에게 보내는 링크를 운영하는 플랜',
    badge: '가장 추천',
    highlight: '신뢰를 모아두는 수준을 넘어, 실제 상담과 문의로 이어지게 운영하는 단계입니다.',
    reviewLimit: 100,
    pricing: {
      monthly: 9900,
      yearly: 99000,
    },
    supportLevel: '우선 이메일 지원 · 24~48시간',
    bestFor: '고객에게 실제로 보내는 링크를 꾸준히 운영하려는 개인 전문가',
    marketingHighlights: [
      '공개 후기와 포트폴리오 운영 확대',
      '워터마크 제거와 프로필 테마 조정',
      '데이터 내보내기와 기본 분석'
    ],
    features: {
      basicProfile: true,
      basicStats: true,
      customTheme: true,
      customDomain: false,
      advancedAnalytics: true,
      apiAccess: false,
      prioritySupport: true,
      removeWatermark: true,
      customCss: false,
      exportData: true,
      teamMembers: 0,
    }
  },
  pro: {
    id: 'pro',
    name: '운영 베타',
    description: '스튜디오, 지점, 여러 채널 운영이 필요한 헤비유저용',
    highlight: '여러 링크 흐름과 운영 우선순위가 필요한 사용자에게만 별도로 열리는 베타 플랜입니다.',
    reviewLimit: -1,
    pricing: {
      monthly: 19900,
      yearly: 199000,
    },
    supportLevel: '예약형 우선 지원',
    bestFor: '여러 채널, 지점, 관리자 흐름이 필요한 스튜디오/팀',
    marketingHighlights: [
      '후기 운영 규모 확장',
      '우선 반영과 운영 베타 지원',
      '팀/스튜디오 문의형 운영'
    ],
    features: {
      basicProfile: true,
      basicStats: true,
      customTheme: true,
      customDomain: false,
      advancedAnalytics: true,
      apiAccess: false,
      prioritySupport: true,
      removeWatermark: true,
      customCss: false,
      exportData: true,
      teamMembers: 0,
    }
  }
}

export function getPlanPrice(plan: PlanType, period: 'monthly' | 'yearly'): number {
  const pricing = PLANS[plan].pricing
  if (pricing.monthly === 0) return 0
  if (period === 'monthly') return pricing.monthly
  if (typeof pricing.yearly === 'number') return pricing.yearly

  const discount = pricing.yearlyDiscountPercent ?? 0
  const yearlyBase = pricing.monthly * 12
  const discounted = Math.round(yearlyBase * (100 - discount) / 100)
  return discounted
}

export function getYearlySavings(plan: PlanType): number {
  const pricing = PLANS[plan].pricing
  if (pricing.monthly === 0) return 0
  const yearlyBase = pricing.monthly * 12
  if (typeof pricing.yearly === 'number') {
    return Math.max(0, yearlyBase - pricing.yearly)
  }
  if (!pricing.yearlyDiscountPercent) return 0
  return Math.round(yearlyBase * (pricing.yearlyDiscountPercent / 100))
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return '0'
  return amount.toLocaleString('ko-KR')
}

export function canAddReview(currentReviewCount: number, plan: PlanType): boolean {
  const limit = PLANS[plan].reviewLimit
  if (limit === -1) return true
  return currentReviewCount < limit
}

export function getRemainingReviews(currentReviewCount: number, plan: PlanType): number | 'unlimited' {
  const limit = PLANS[plan].reviewLimit
  if (limit === -1) return 'unlimited'
  return Math.max(0, limit - currentReviewCount)
}

export function hasFeature(plan: PlanType, feature: keyof PlanFeatureFlags): boolean {
  const value = PLANS[plan].features[feature]
  if (typeof value === 'number') {
    return value > 0
  }
  return Boolean(value)
}

export function getFeatureValue(plan: PlanType, feature: keyof PlanFeatureFlags): PlanFeatureFlags[typeof feature] {
  return PLANS[plan].features[feature]
}

export function isPremiumFeature(feature: keyof PlanFeatureFlags): boolean {
  return !Boolean(PLANS.free.features[feature])
}

export type PricingFeatureType = 'boolean' | 'limit' | 'count'

export const PRICING_FEATURE_MATRIX: Array<{
  key: keyof PlanFeatureFlags | 'reviewLimit'
  label: string
  type: PricingFeatureType
  description?: string
  format?: (plan: PlanType) => string
}> = [
  {
    key: 'basicProfile',
    label: '공개 신뢰 포트폴리오',
    type: 'boolean',
    description: '이름, 대표 후기, 포트폴리오, 문의 버튼이 담긴 공개 링크'
  },
  {
    key: 'reviewLimit',
    label: '후기 운영 규모',
    type: 'limit',
    format: (plan) => {
      if (plan === 'free') return '기본 운영용'
      if (plan === 'premium') return '더 넓은 후기 운영'
      return '헤비유저/팀 운영'
    }
  },
  {
    key: 'basicStats',
    label: '기본 공유·조회 확인',
    type: 'boolean',
    description: '공개 링크 운영에 필요한 기본 확인 기능'
  },
  {
    key: 'customTheme',
    label: '프로필 테마 조정',
    type: 'boolean',
    description: '브랜드 톤에 맞는 공개 프로필 스타일 조정'
  },
  {
    key: 'advancedAnalytics',
    label: '기본 분석',
    type: 'boolean'
  },
  {
    key: 'removeWatermark',
    label: 'Re:cord 워터마크 제거',
    type: 'boolean'
  },
  {
    key: 'exportData',
    label: '데이터 내보내기',
    type: 'boolean'
  },
  {
    key: 'prioritySupport',
    label: '우선 지원',
    type: 'boolean'
  },
  {
    key: 'teamMembers',
    label: '팀 운영 베타',
    type: 'count',
    format: (plan) => {
      const seats = PLANS[plan].features.teamMembers
      return seats > 0 ? `팀 멤버 초대 (최대 ${seats}명)` : '개별 사용자 운영'
    }
  }
]
