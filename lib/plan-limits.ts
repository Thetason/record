// 플랜별 기능, 가격, 마케팅 정보의 단일 소스

export const PLAN_ORDER = ['free', 'premium', 'pro'] as const

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
    name: '프리 플랜',
    description: '개인 사용자를 위한 기본 플랜',
    highlight: '기본 리뷰 관리 기능을 비용 부담 없이 경험해 보세요.',
    reviewLimit: 20,
    pricing: {
      monthly: 0,
      yearlyDiscountPercent: 0,
    },
    supportLevel: '기본 이메일 지원',
    bestFor: '리뷰를 처음 정리해 보는 개인 사용자',
    marketingHighlights: [
      '리뷰 20개까지 저장',
      '공개 프로필 페이지 (Powered by Re:cord)',
      '플랫폼별 리뷰 관리와 기본 통계'
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
    name: '프리미엄 플랜',
    description: '전문가와 인플루언서를 위한 확장 플랜',
    badge: '인기',
    highlight: '브랜드 신뢰도를 높이는 고급 리뷰 운영 기능 제공',
    reviewLimit: 100,
    pricing: {
      monthly: 9900,
      yearlyDiscountPercent: 20,
    },
    supportLevel: '우선 이메일 지원',
    bestFor: '리뷰를 자산으로 활용하는 전문가 · 크리에이터',
    marketingHighlights: [
      '월 100개 리뷰 등록',
      '내 웹사이트에 리뷰 자동연동해서 바로 보여주기',
      '워터마크 제거 & 프로필 커스터마이징'
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
    name: '비즈니스 플랜',
    description: '전문 스튜디오와 에이전시를 위한 무제한 플랜',
    highlight: '무제한 리뷰와 브랜드 강화 기능으로 비즈니스를 확장하세요.',
    reviewLimit: -1,
    pricing: {
      monthly: 19900,
      yearlyDiscountPercent: 20,
    },
    supportLevel: '우선 지원 (24시간 내 응답)',
    bestFor: '무제한 리뷰와 브랜드 강화가 필요한 전문 스튜디오',
    marketingHighlights: [
      '리뷰 무제한 등록 & 자동 백업',
      '브랜드 로고 업로드 & 고급 테마 (10종)',
      'Business 배지 & 우선 지원'
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

  const discount = pricing.yearlyDiscountPercent ?? 0
  const yearlyBase = pricing.monthly * 12
  const discounted = Math.round(yearlyBase * (100 - discount) / 100)
  return discounted
}

export function getYearlySavings(plan: PlanType): number {
  const pricing = PLANS[plan].pricing
  if (!pricing.yearlyDiscountPercent || pricing.monthly === 0) return 0
  const yearlyBase = pricing.monthly * 12
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
    key: 'reviewLimit',
    label: '리뷰 등록 한도',
    type: 'limit',
    format: (plan) => {
      const limit = PLANS[plan].reviewLimit
      return limit === -1 ? '리뷰 무제한 등록' : `리뷰 ${limit}개까지 등록`
    }
  },
  {
    key: 'customTheme',
    label: '프로필 커스터마이징',
    type: 'boolean',
    description: '브랜드 색상, 테마, 레이아웃 변경'
  },
  {
    key: 'advancedAnalytics',
    label: '고급 통계 및 분석',
    type: 'boolean'
  },
  {
    key: 'customDomain',
    label: '커스텀 도메인 연결',
    type: 'boolean'
  },
  {
    key: 'apiAccess',
    label: 'API 액세스',
    type: 'boolean'
  },
  {
    key: 'removeWatermark',
    label: 'Re:cord 워터마크 제거',
    type: 'boolean'
  },
  {
    key: 'exportData',
    label: '데이터 내보내기 (CSV)',
    type: 'boolean'
  },
  {
    key: 'prioritySupport',
    label: '우선 고객 지원',
    type: 'boolean'
  },
  {
    key: 'customCss',
    label: '커스텀 CSS',
    type: 'boolean'
  },
  {
    key: 'teamMembers',
    label: '팀 멤버 초대 좌석',
    type: 'count',
    format: (plan) => {
      const seats = PLANS[plan].features.teamMembers
      return seats > 0 ? `팀 멤버 초대 (최대 ${seats}명)` : '개별 사용자 전용'
    }
  }
]
