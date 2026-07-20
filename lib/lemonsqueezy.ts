export type LemonPlanId = 'premium' | 'pro'
export type LemonBillingPeriod = 'monthly' | 'yearly'

const DEFAULT_MONTHLY_CHECKOUT_URLS: Record<LemonPlanId, string> = {
  premium: 'https://record.lemonsqueezy.com/buy/ca2785bc-3695-42a6-8da0-d7b8732dda45?media=0&desc=0',
  pro: 'https://record.lemonsqueezy.com/buy/8fe70d24-78d7-41e8-ad40-86f7afa1e71b?media=0&desc=0',
}

const CHECKOUT_URLS: Record<LemonPlanId, Record<LemonBillingPeriod, string | undefined>> = {
  premium: {
    monthly:
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_CHECKOUT_URL ||
      DEFAULT_MONTHLY_CHECKOUT_URLS.premium,
    yearly: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_YEARLY_CHECKOUT_URL,
  },
  pro: {
    monthly:
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_CHECKOUT_URL ||
      DEFAULT_MONTHLY_CHECKOUT_URLS.pro,
    yearly: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_CHECKOUT_URL,
  },
}

export function getLemonCheckoutUrl(plan: LemonPlanId, period: LemonBillingPeriod) {
  return CHECKOUT_URLS[plan][period] || null
}

export function buildLemonCheckoutHref(input: {
  plan: LemonPlanId
  period: LemonBillingPeriod
  email?: string | null
  userId?: string | null
}) {
  const baseUrl = getLemonCheckoutUrl(input.plan, input.period)
  if (!baseUrl) {
    return null
  }

  const url = new URL(baseUrl)
  if (input.email) {
    url.searchParams.set('checkout[email]', input.email)
    url.searchParams.set('checkout[custom][user_email]', input.email)
  }
  if (input.userId) {
    url.searchParams.set('checkout[custom][user_id]', input.userId)
  }
  url.searchParams.set('checkout[custom][plan]', input.plan)
  url.searchParams.set('checkout[custom][period]', input.period)

  return url.toString()
}
