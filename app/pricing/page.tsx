'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PLAN_ORDER,
  PLANS,
  PlanType,
  formatCurrency,
  getPlanPrice,
  getYearlySavings,
} from '@/lib/plan-limits'
import type { ProductId } from '@/lib/tosspayments'

type BillingPeriod = 'monthly' | 'yearly'

const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: '월간 구독',
  yearly: '연간 구독',
}

const PLAN_COPY: Record<PlanType, {
  title: string
  subtitle: string
  emphasis?: string
  cta: string
  accent?: 'highlight' | 'default'
  bullets: string[]
}> = {
  free: {
    title: '무료 체험',
    subtitle: '가입 즉시 50개의 리뷰를 정리할 수 있는 기본 기능',
    emphasis: '무료 0원',
    cta: '무료로 시작하기',
    accent: 'default',
    bullets: [
      '리뷰 50개까지 저장',
      '기본 프로필 공개 페이지',
      '플랫폼별 리뷰 자동 분류',
    ],
  },
  premium: {
    title: '라이트',
    subtitle: '전문가와 크리에이터를 위한 브랜드 강화 기능',
    emphasis: '가장 인기 있는 선택',
    cta: '라이트 플랜 시작하기',
    accent: 'highlight',
    bullets: [
      '리뷰 무제한 등록 & 고급 통계',
      '프로필 커스터마이징 · 위젯 제공',
      '워터마크 제거와 우선 지원',
    ],
  },
  pro: {
    title: '비즈니스',
    subtitle: '팀 단위 협업과 고급 통합이 필요한 브랜드용',
    cta: '비즈니스 플랜 상담하기',
    accent: 'default',
    bullets: [
      'API · 커스텀 도메인 · 커스텀 CSS',
      '팀 멤버 초대 (최대 5명) · 데이터 내보내기',
      '전담 매니저와 우선 대응',
    ],
  },
}

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)

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

  return (
    <div className="min-h-screen bg-[#F6F7F9] py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-md p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#FF6B35]">가격 안내</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">다양한 플랜으로 Re:cord를 만나보세요</h1>
              <p className="text-gray-600 md:max-w-xl">
                무료로 가볍게 시작한 뒤, 브랜드 확장과 팀 협업이 필요해지는 시점에 맞춰 업그레이드하세요.
                모든 요금제는 언제든 변경할 수 있고, 연간 구독 시 자동으로 할인됩니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period)}
                  className={`px-4 py-2 text-sm rounded-full border transition ${
                    billingPeriod === period
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35] font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {BILLING_LABELS[period]}
                  {period === 'yearly' && (
                    <span className="ml-2 inline-flex items-center text-xs text-green-600">2개월 무료</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId]
              const copy = PLAN_COPY[planId]
              const isFree = planId === 'free'
              const isLoading = loadingPlan === planId
              const amount = getPlanPrice(planId, billingPeriod)
              const monthlyAmount = getPlanPrice(planId, 'monthly')
              const yearlyAmount = getPlanPrice(planId, 'yearly')
              const savings = getYearlySavings(planId)

              return (
                <Card
                  key={planId}
                  className={`flex flex-col justify-between border-2 ${
                    copy.accent === 'highlight'
                      ? 'border-[#FF6B35] shadow-lg bg-[#FF6B35]/5'
                      : 'border-transparent bg-gray-50'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-500">{copy.title}</div>
                      {copy.emphasis && (
                        <span className="text-xs font-medium text-[#FF6B35] bg-white/70 px-2 py-1 rounded-full">
                          {copy.emphasis}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{copy.subtitle}</p>

                    <div className="mt-6 space-y-1">
                      {amount === 0 ? (
                        <p className="text-4xl font-bold text-gray-900">무료</p>
                      ) : (
                        <p className="text-4xl font-bold text-gray-900">
                          ₩{formatCurrency(amount)}
                          <span className="text-base font-medium text-gray-500 ml-1">
                            {billingPeriod === 'monthly' ? '/월' : '/년'}
                          </span>
                        </p>
                      )}
                      {billingPeriod === 'yearly' && amount > 0 && (
                        <p className="text-xs text-green-600">
                          월 환산 ₩{formatCurrency(Math.round(yearlyAmount / 12))} · 연간 결제 시 ₩{formatCurrency(yearlyAmount)}
                          {savings > 0 && ` (₩${formatCurrency(savings)} 절약)`}
                        </p>
                      )}
                      {billingPeriod === 'monthly' && amount > 0 && (
                        <p className="text-xs text-gray-500">
                          연간 구독 시 ₩{formatCurrency(yearlyAmount)} (약 {plan.pricing.yearlyDiscountPercent}% 할인)
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {copy.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-0.5 text-[#FF6B35]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      variant={copy.accent === 'highlight' ? 'default' : 'outline'}
                      className={`w-full ${copy.accent === 'highlight' ? 'bg-[#FF6B35] hover:bg-[#E55A2B]' : 'border-gray-300 text-gray-800'}`}
                      onClick={() => handleSelectPlan(planId)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> 처리 중...
                        </span>
                      ) : (
                        copy.cta
                      )}
                    </Button>

                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                      {!isFree && (
                        <p>월 ₩{formatCurrency(monthlyAmount)} • 연간 ₩{formatCurrency(yearlyAmount)}</p>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-10 mt-12">
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
