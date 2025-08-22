// 플랜별 기능 제한 설정

export const PLANS = {
  free: {
    name: '무료',
    reviewLimit: 50,
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
    name: '프리미엄',
    price: 9900,
    reviewLimit: -1, // 무제한
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
    name: '프로',
    price: 19900,
    reviewLimit: -1, // 무제한
    features: {
      basicProfile: true,
      basicStats: true,
      customTheme: true,
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
      removeWatermark: true,
      customCss: true,
      exportData: true,
      teamMembers: 5,
    }
  }
} as const

export type PlanType = keyof typeof PLANS

export function canAddReview(currentReviewCount: number, plan: PlanType): boolean {
  const limit = PLANS[plan].reviewLimit
  if (limit === -1) return true // 무제한
  return currentReviewCount < limit
}

export function getRemainingReviews(currentReviewCount: number, plan: PlanType): number | 'unlimited' {
  const limit = PLANS[plan].reviewLimit
  if (limit === -1) return 'unlimited'
  return Math.max(0, limit - currentReviewCount)
}

export function hasFeature(plan: PlanType, feature: keyof typeof PLANS.free.features): boolean {
  return PLANS[plan].features[feature]
}

export function isPremiumFeature(feature: keyof typeof PLANS.free.features): boolean {
  return !PLANS.free.features[feature]
}