'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check, X, Loader2, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PLAN_ORDER,
  PLANS,
  PRICING_FEATURE_MATRIX,
  PlanType,
  formatCurrency,
  getFeatureValue,
  getPlanPrice,
  getYearlySavings,
  hasFeature,
} from '@/lib/plan-limits'
import type { ProductId } from '@/lib/tosspayments'

type BillingPeriod = 'monthly' | 'yearly'

type FeatureItem = {
  label: string
  included: boolean
  description?: string
}

const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: '월간 결제',
  yearly: '연간 결제',
}

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)

  const featureMatrixByPlan = useMemo(() => {
    const map = new Map<PlanType, FeatureItem[]>()
    PLAN_ORDER.forEach((planId) => {
      const items: FeatureItem[] = PRICING_FEATURE_MATRIX.map((feature) => {
        if (feature.key === 'reviewLimit') {
          return {
            label: feature.format ? feature.format(planId) : feature.label,
            included: true,
            description: feature.description,
          }
        }

        if (feature.key === 'teamMembers') {
          const seats = getFeatureValue(planId, 'teamMembers') as number
          return {
            label: feature.format ? feature.format(planId) : feature.label,
            included: seats > 0,
            description: feature.description,
          }
        }

        const included = hasFeature(planId, feature.key as keyof typeof PLANS.free.features)
        return {
          label: feature.format ? feature.format(planId) : feature.label,
          included,
          description: feature.description,
        }
      })
      map.set(planId, items)
    })
    return map
  }, [])

  const handleSelectPlan = async (planId: PlanType) => {
    if (!session) {
      router.push('/login')
      return
    }

    if (planId === 'free') {
      router.push('/dashboard')
      return
    }

    setLoadingPlan(planId)
    try {
      const productId = `${planId}_${billingPeriod}` as ProductId
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: productId, period: billingPeriod })
      })

      const data = await res.json()

      if (data.success) {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          router.push(`/payment/process?id=${data.subscriptionId}&status=demo`)
        }
      } else {
        alert(data.error || '결제 요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const renderPriceBlock = (planId: PlanType) => {
    const monthlyAmount = getPlanPrice(planId, 'monthly')
    const yearlyAmount = getPlanPrice(planId, 'yearly')
    const primaryAmount = billingPeriod === 'monthly' ? monthlyAmount : yearlyAmount
    const primaryLabel = billingPeriod === 'monthly' ? '/월' : '/년'
    const yearlySavings = getYearlySavings(planId)

    if (primaryAmount === 0) {
      return (
        <div className="mt-4">
          <span className="text-4xl font-bold">무료</span>
        </div>
      )
    }

    return (
      <div className="mt-4 space-y-1">
        <div>
          <span className="text-4xl font-bold">₩{formatCurrency(primaryAmount)}</span>
          <span className="ml-1 text-gray-600">{primaryLabel}</span>
        </div>
        {billingPeriod === 'yearly' && (
          <p className="text-sm text-green-600">
            월 ₩{formatCurrency(Math.round(yearlyAmount / 12))} • 연간 결제 시 ₩{formatCurrency(yearlyAmount)}
            {yearlySavings > 0 && ` (₩${formatCurrency(yearlySavings)} 절약)`}
          </p>
        )}
        {billingPeriod === 'monthly' && yearlySavings > 0 && (
          <p className="text-sm text-gray-500">
            연간 결제 시 ₩{formatCurrency(yearlyAmount)} (약 {PLANS[planId].pricing.yearlyDiscountPercent}% 절약)
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">합리적인 가격으로 시작하세요</h1>
          <p className="text-xl text-gray-600 mb-8">
            리뷰 관리의 새로운 기준, Re:cord와 함께하세요
          </p>

          <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-lg">
            {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-4 py-2 rounded-md transition-all ${
                  billingPeriod === period ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-600'
                }`}
              >
                {BILLING_LABELS[period]}
                {period === 'yearly' && (
                  <Badge className="ml-2" variant="secondary">20% 할인</Badge>
                )}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            연간 결제는 월별 요금 대비 자동으로 할인 적용됩니다. 청구는 토스페이먼츠를 통해 안전하게 처리됩니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId]
            const features = featureMatrixByPlan.get(planId) || []
            const isFree = planId === 'free'
            const isLoading = loadingPlan === planId

            return (
              <Card
                key={planId}
                className={`relative flex flex-col ${plan.badge ? 'border-blue-500 shadow-xl scale-105' : ''}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {plan.badge}
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-center text-sm text-gray-600">
                    {plan.description}
                  </CardDescription>
                  {renderPriceBlock(planId)}
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    {plan.highlight}
                  </p>
                  {plan.marketingHighlights.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {plan.marketingHighlights.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <span className={feature.included ? '' : 'text-gray-400'}>
                            {feature.label}
                          </span>
                          {feature.description && (
                            <p className="text-xs text-gray-400">{feature.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
                    <p><strong>추천 대상:</strong> {plan.bestFor}</p>
                    <p><strong>지원 범위:</strong> {plan.supportLevel}</p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={isFree ? 'outline' : 'default'}
                    className="w-full"
                    onClick={() => handleSelectPlan(planId)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        처리 중...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isFree ? '무료로 시작하기' : `${plan.name} 신청하기`}
                        {!isFree && <ArrowRight className="w-4 h-4" />}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="space-y-10">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>요금제 핵심 비교</CardTitle>
              <CardDescription>
                주요 유료 플랜의 혜택을 한눈에 정리했습니다. 자세한 플랜 안내는 아래 링크에서 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <PlanSummary planId="premium" billingPeriod={billingPeriod} />
                <PlanSummary planId="pro" billingPeriod={billingPeriod} />
              </div>
            </CardContent>
            <CardFooter className="justify-between text-sm text-gray-600">
              <span>요금제 상세 정책과 변경/환불 절차는 안내 페이지에서 확인할 수 있습니다.</span>
              <Link href="/pricing/guide" className="text-[#FF6B35] hover:underline font-medium">
                요금제 안내 전체 보기
              </Link>
            </CardFooter>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>자주 묻는 요금 관련 질문</CardTitle>
              <CardDescription>요금제 변경과 결제에 대한 핵심 답변을 모았습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-6 text-sm text-gray-600">
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">연간 결제는 어떤 혜택이 있나요?</dt>
                  <dd>
                    연간 결제를 선택하면 월 요금 대비 약 20% 할인된 금액으로 청구됩니다. 프리미엄은 연 ₩
                    {formatCurrency(getPlanPrice('premium', 'yearly'))} (월 환산 ₩
                    {formatCurrency(Math.round(getPlanPrice('premium', 'yearly') / 12))}), 프로는 연 ₩
                    {formatCurrency(getPlanPrice('pro', 'yearly'))}입니다.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">플랜을 언제든 변경할 수 있나요?</dt>
                  <dd>
                    네. 관리자 센터 &gt; 결제 관리에서 상위 플랜으로 즉시 업그레이드할 수 있으며, 만료 시점에는 자동으로 새 플랜이 적용됩니다. 하향 조정은 만료일 이후 무료 플랜으로 자동 전환됩니다.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">결제가 실패하거나 환불이 필요한 경우 어떻게 하나요?</dt>
                  <dd>
                    결제 실패 시 카드사 또는 토스페이먼츠 오류 메시지를 확인하고 다시 시도해주세요. 환불이 필요한 경우 support@record.kr 로 결제 정보와 사유를 보내주시면 1영업일 내 안내드리겠습니다.
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PlanSummary({ planId, billingPeriod }: { planId: Exclude<PlanType, 'free'>; billingPeriod: BillingPeriod }) {
  const plan = PLANS[planId]
  const monthlyAmount = getPlanPrice(planId, 'monthly')
  const yearlyAmount = getPlanPrice(planId, 'yearly')
  const savings = getYearlySavings(planId)

  return (
    <div className="rounded-lg border border-gray-200 p-5 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
        {plan.badge && <Badge variant="outline" className="text-xs">{plan.badge}</Badge>}
      </div>
      <p className="text-sm text-gray-500 mb-4">{plan.bestFor}</p>
      <ul className="space-y-2 text-sm text-gray-600">
        {plan.marketingHighlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>월 ₩{formatCurrency(monthlyAmount)}</p>
        <p>
          연 ₩{formatCurrency(yearlyAmount)}
          {savings > 0 && ` (₩${formatCurrency(savings)} 절약)`}
        </p>
        {billingPeriod === 'yearly' && (
          <p className="text-xs text-green-600">현재 연간 결제를 선택했습니다.</p>
        )}
      </div>
    </div>
  )
}
