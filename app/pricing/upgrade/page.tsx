"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Check, Crown, Loader2, ShieldCheck, Wrench } from 'lucide-react'

import {
  PLANS,
  PUBLIC_PLAN_ORDER,
  PlanType,
  PRICING_FEATURE_MATRIX,
  formatCurrency,
  getFeatureValue,
  getPlanPrice,
  getYearlySavings,
  hasFeature,
} from '@/lib/plan-limits'
import { buildLemonCheckoutHref, type LemonBillingPeriod, type LemonPlanId } from '@/lib/lemonsqueezy'

type BillingPeriod = LemonBillingPeriod
type PaidPlanId = LemonPlanId

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
        if (data.plan && ['free', 'premium', 'pro'].includes(data.plan)) {
          setCurrentPlan(data.plan as PlanType)
        }
      })
  }, [])

  const featureMatrixByPlan = useMemo(() => {
    const map = new Map<(typeof PUBLIC_PLAN_ORDER)[number], FeatureItem[]>()
    PUBLIC_PLAN_ORDER.forEach((planId) => {
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

    try {
      const checkoutUrl = buildLemonCheckoutHref({
        plan,
        period: billingPeriod,
        email: session.user?.email,
        userId: session.user?.id,
      })

      if (!checkoutUrl) {
        throw new Error('이 결제 링크는 아직 설정되지 않았습니다.')
      }

      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Payment error:', error)
      alert(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">내 링크를 실제 상담용으로 운영해보세요</h1>
          <p className="mb-8 text-lg text-gray-600">
            무료로 시작해도 충분히 보낼 수 있습니다. 프로는 더 선명하게 보이고, 더 꾸준히 운영하고, 더 쉽게 관리하고 싶은 순간에 선택하면 됩니다.
          </p>

          <div className="inline-flex items-center rounded-lg bg-white p-1 shadow-sm">
            {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                className={`rounded-md px-4 py-2 transition-colors ${
                  billingPeriod === period
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setBillingPeriod(period)}
              >
                {period === 'monthly' ? '월간 결제' : '연간 결제'}
                {period === 'yearly' && (
                  <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    2개월 정도 절약
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {PUBLIC_PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId]
            const features = featureMatrixByPlan.get(planId) || []
            const isCurrent = currentPlan === planId
            const isPremium = planId === 'premium'
            const amount = getPlanPrice(planId, billingPeriod)
            const formattedAmount = amount === 0 ? '무료' : `₩${formatCurrency(amount)}`
            const amountSuffix = amount === 0 ? '' : billingPeriod === 'monthly' ? '/월' : '/년'
            const loading = loadingPlan === planId
            const checkoutReady = planId === 'free'
              ? true
              : Boolean(
                  buildLemonCheckoutHref({
                    plan: planId as PaidPlanId,
                    period: billingPeriod,
                    email: session?.user?.email,
                    userId: session?.user?.id,
                  })
                )

            return (
              <div
                key={planId}
                className={`relative rounded-2xl bg-white p-8 shadow-lg transition ${
                  isPremium ? 'ring-2 ring-[#FF6B35]' : ''
                } ${isCurrent ? 'opacity-90' : ''}`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="rounded-full bg-[#FF6B35] px-4 py-1 text-sm text-white">
                      가장 추천
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <span className="rounded-full bg-green-500 px-4 py-1 text-sm text-white">
                      현재 플랜
                    </span>
                  </div>
                )}

                <div className="mb-6 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    {isPremium && <Crown className="h-5 w-5 text-[#FF6B35]" />}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <div className="text-3xl font-bold text-[#FF6B35]">
                    {formattedAmount}
                    {amountSuffix && <span className="text-sm font-normal text-gray-600">{amountSuffix}</span>}
                  </div>
                  {billingPeriod === 'yearly' && amount > 0 && (
                    <p className="mt-1 text-xs text-green-600">
                      연간 ₩{formatCurrency(getPlanPrice(planId, 'yearly'))}
                      {getYearlySavings(planId) > 0 && ` · ₩${formatCurrency(getYearlySavings(planId))} 절약`}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gray-500">{plan.highlight}</p>
                </div>

                <ul className="mb-8 space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {planId === 'premium' && !isCurrent && (
                  <button
                    onClick={() => handleUpgrade(planId as PaidPlanId)}
                    disabled={loading || !checkoutReady}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] py-3 font-medium text-white transition-colors hover:bg-[#E55A2B] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> 처리 중...
                      </>
                    ) : (
                      '프로로 업그레이드'
                    )}
                  </button>
                )}

                {planId === 'free' && !isCurrent && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full rounded-lg border border-gray-300 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-50"
                  >
                    무료로 계속 사용하기
                  </button>
                )}

                {planId === 'premium' && !checkoutReady && (
                  <p className="mt-3 text-center text-xs text-amber-700">
                    현재 선택한 결제 주기의 Lemon 링크가 아직 설정되지 않았습니다.
                  </p>
                )}

                {isCurrent && (
                  <div className="text-center text-gray-500">
                    현재 사용 중인 플랜입니다.
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {currentPlan === 'pro' && (
          <div className="mt-8 rounded-2xl border border-[#FF6B35]/20 bg-[#FFF7F3] p-6">
            <div className="flex items-center gap-2 text-[#FF6B35]">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold">현재 운영 베타를 사용 중입니다</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              현재 계정은 운영 베타 플랜으로 유지되고 있습니다. 여러 링크 흐름이나 스튜디오 운영이 필요한 경우 그대로 사용하되,
              세부 조정은 support@record.kr 로 문의해 주세요.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[#FF6B35]">
              <Wrench className="h-5 w-5" />
              <span className="font-semibold">리뷰 옮겨드림</span>
            </div>
            <p className="text-sm text-gray-600">
              링크는 빨리 열어야 하는데 세팅이 귀찮다면 1회성 세팅 서비스로 먼저 시작할 수 있습니다.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>기본 세팅 79,000원</li>
              <li>빠른 세팅 / 대량 이전 149,000원</li>
              <li>대표 후기 큐레이션과 프로필 정리 포함</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[#FF6B35]">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold">운영 베타 문의</span>
            </div>
            <p className="text-sm text-gray-600">
              지점/스튜디오/다채널 운영처럼 더 무거운 사용 패턴은 19,900원대 운영 베타로 별도 안내합니다.
            </p>
            <p className="mt-4 text-sm text-gray-700">필요하면 support@record.kr 또는 초기 세팅 문의에서 함께 맞춰드립니다.</p>
          </div>
        </div>

        <div className="mt-12 space-y-2 text-center text-sm text-gray-600">
          <p>무료는 배포를 만들고, 프로는 전환을 운영하고, 세팅 서비스는 첫 링크를 여는 속도를 높입니다.</p>
          <p>궁금한 점은 <a className="underline" href="mailto:support@record.kr">support@record.kr</a> 로 문의해 주세요.</p>
        </div>
      </div>
    </div>
  )
}
