"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Check, X, Crown, Rocket, Loader2 } from 'lucide-react'

import {
  PLANS,
  PLAN_ORDER,
  PlanType,
  PRICING_FEATURE_MATRIX,
  formatCurrency,
  getFeatureValue,
  getPlanPrice,
  getYearlySavings,
  hasFeature,
} from '@/lib/plan-limits'
import { SUBSCRIPTION_PRODUCTS } from '@/lib/tosspayments'
import type { BillingPeriod, PaidPlanId, ProductId } from '@/lib/tosspayments'

const PAID_PLAN_ICONS: Partial<Record<PaidPlanId, JSX.Element>> = {
  premium: <Crown className="w-5 h-5" />,
  pro: <Rocket className="w-5 h-5" />,
}

type FeatureItem = {
  label: string
  included: boolean
}

export default function UpgradePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<PaidPlanId | null>(null)

  useEffect(() => {
    fetch('/api/subscription/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.plan && (PLAN_ORDER as readonly string[]).includes(data.plan)) {
          setCurrentPlan(data.plan as PlanType)
        }
      })
  }, [])

  const featureMatrixByPlan = useMemo(() => {
    const map = new Map<PlanType, FeatureItem[]>()
    PLAN_ORDER.forEach((planId) => {
      const items: FeatureItem[] = PRICING_FEATURE_MATRIX.map((feature) => {
        if (feature.key === 'reviewLimit') {
          return {
            label: feature.format ? feature.format(planId) : feature.label,
            included: true,
          }
        }

        if (feature.key === 'teamMembers') {
          const seats = getFeatureValue(planId, 'teamMembers') as number
          return {
            label: feature.format ? feature.format(planId) : feature.label,
            included: seats > 0,
          }
        }

        const included = hasFeature(planId, feature.key as keyof typeof PLANS.free.features)
        return {
          label: feature.format ? feature.format(planId) : feature.label,
          included,
        }
      })
      map.set(planId, items)
    })
    return map
  }, [])

  const handleUpgrade = async (plan: PaidPlanId) => {
    if (!session) {
      router.push('/login')
      return
    }

    setLoadingPlan(plan)
    const productId = `${plan}_${billingPeriod}` as ProductId

    try {
      const product = SUBSCRIPTION_PRODUCTS[productId]

      if (!product) {
        throw new Error('지원하지 않는 상품입니다.')
      }

      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
      )

      await tossPayments.requestPayment('카드', {
        amount: product.amount,
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderName: product.name,
        customerName: session.user?.name || '고객',
        customerEmail: session.user?.email || '',
        successUrl: `${window.location.origin}/api/payments/success`,
        failUrl: `${window.location.origin}/api/payments/fail`,
      })
    } catch (error) {
      console.error('Payment error:', error)
      alert('결제 중 오류가 발생했습니다')
    } finally {
      setLoadingPlan(null)
    }
  }

  const plansToRender: PlanType[] = ['free', 'premium', 'pro']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">더 많은 기능으로 리뷰를 관리하세요</h1>
          <p className="text-gray-600 text-lg mb-8">
            Re:cord 프리미엄 플랜으로 업그레이드하고 리뷰를 자산으로 만드세요
          </p>

          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
            {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                className={`px-4 py-2 rounded-md transition-colors ${
                  billingPeriod === period
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setBillingPeriod(period)}
              >
                {period === 'monthly' ? '월간 결제' : '연간 결제'}
                {period === 'yearly' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    약 20% 할인
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plansToRender.map((planId) => {
            const plan = PLANS[planId]
            const features = featureMatrixByPlan.get(planId) || []
            const isCurrent = currentPlan === planId
            const isPaidPlan = planId !== 'free'
            const isPremium = planId === 'premium'
            const amount = getPlanPrice(planId, billingPeriod)
            const formattedAmount = amount === 0 ? '무료' : `₩${formatCurrency(amount)}`
            const amountSuffix = amount === 0 ? '' : billingPeriod === 'monthly' ? '/월' : '/년'
            const loading = loadingPlan === planId

            return (
              <div
                key={planId}
                className={`bg-white rounded-lg shadow-lg p-8 relative transition ${
                  isPremium ? 'ring-2 ring-[#FF6B35]' : ''
                } ${isCurrent ? 'opacity-75' : ''}`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm">
                      인기
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                      현재 플랜
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {PAID_PLAN_ICONS[planId as PaidPlanId] ?? null}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <div className="text-3xl font-bold text-[#FF6B35]">
                    {formattedAmount}
                    {amountSuffix && <span className="text-sm text-gray-600 font-normal">{amountSuffix}</span>}
                  </div>
                  {billingPeriod === 'yearly' && amount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      월 환산 ₩{formatCurrency(Math.round(getPlanPrice(planId, 'yearly') / 12))}
                      {getYearlySavings(planId) > 0 && ` • ₩${formatCurrency(getYearlySavings(planId))} 절약`}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400'}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {isPaidPlan && !isCurrent && (
                  <button
                    onClick={() => handleUpgrade(planId as PaidPlanId)}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      isPremium
                        ? 'bg-[#FF6B35] hover:bg-[#E55A2B] text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    } disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> 처리 중...
                      </>
                    ) : (
                      '업그레이드'
                    )}
                  </button>
                )}

                {isCurrent && (
                  <div className="text-center text-gray-500">현재 사용 중인 플랜입니다.</div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center text-gray-600 space-y-2 text-sm">
          <p>모든 유료 플랜은 즉시 적용되며 만료일까지 기능을 이용할 수 있습니다.</p>
          <p>궁금한 점은 <a className="underline" href="mailto:support@record.kr">support@record.kr</a> 로 문의해 주세요.</p>
        </div>
      </div>
    </div>
  )
}
