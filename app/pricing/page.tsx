'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'
import { Check, Loader2, ShieldCheck, Sparkles, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PUBLIC_PLAN_ORDER,
  PLANS,
  PlanType,
  formatCurrency,
  getPlanPrice,
  getYearlySavings,
} from '@/lib/plan-limits'
import { buildLemonCheckoutHref, type LemonPlanId } from '@/lib/lemonsqueezy'
import type { LaunchOfferSnapshot } from '@/lib/launch-offer-config'

type BillingPeriod = 'monthly' | 'yearly'

// Lemon Squeezy checkout is USD-based; keep it opt-in and default to the
// concierge flow until a KRW payment provider is wired up.
const LEMON_CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_MODE === 'lemon'

const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: '월간 구독',
  yearly: '연간 구독',
}

const PUBLIC_PLAN_COPY: Record<(typeof PUBLIC_PLAN_ORDER)[number], {
  title: string
  subtitle: string
  cta: string
  accent?: 'default' | 'highlight'
  bullets: string[]
}> = {
  free: {
    title: '무료로 퍼뜨리는 시작 플랜',
    subtitle: '처음 링크를 열고, 실제로 고객에게 보내보는 단계입니다.',
    cta: '무료로 시작하기',
    accent: 'default',
    bullets: [
      '공개 신뢰 포트폴리오 1개',
      '대표 후기 3개 + 기본 후기 운영',
      '후기 요청 링크와 기본 공유',
    ],
  },
  premium: {
    title: '실제로 보내는 영업용 플랜',
    subtitle: '고객에게 보내는 링크를 더 선명하게 운영하는 단계입니다.',
    cta: '프로 시작하기',
    accent: 'highlight',
    bullets: [
      '워터마크 제거와 프로필 테마 조정',
      '후기·포트폴리오 운영 확대',
      '데이터 내보내기와 기본 분석',
      '우선 이메일 지원',
    ],
  },
}

const SETUP_SERVICES = [
  {
    name: '기본 세팅',
    price: 79000,
    description: '첫 링크를 빠르게 여는 1회성 도움',
    bullets: [
      '기존 후기 정리',
      '대표 리뷰 3개 큐레이션',
      '프로필 세팅과 포트폴리오 정리',
    ],
  },
  {
    name: '빠른 세팅 / 대량 이전',
    price: 149000,
    description: '후기가 많거나 바로 공개해야 하는 경우',
    bullets: [
      '대량 후기 이전',
      '카톡 소개 문구 정리',
      '긴급 오픈 우선 대응',
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)
  const [launchOffer, setLaunchOffer] = useState<LaunchOfferSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadLaunchOffer = async () => {
      try {
        const response = await fetch('/api/launch-offer', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json() as LaunchOfferSnapshot
        if (!cancelled) {
          setLaunchOffer(data)
        }
      } catch (error) {
        console.error('Failed to load launch offer:', error)
      }
    }

    void loadLaunchOffer()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSelectPlan = async (planId: (typeof PUBLIC_PLAN_ORDER)[number]) => {
    setLoadingPlan(planId)

    if (!session) {
      router.push('/login')
      setLoadingPlan(null)
      return
    }

    if (planId === 'free') {
      router.push('/dashboard')
      setLoadingPlan(null)
      return
    }

    // Beta default: Korean customers pay via concierge (manual) flow.
    // Lemon Squeezy charges in USD, so it stays behind an explicit env flag.
    if (LEMON_CHECKOUT_ENABLED) {
      const checkoutUrl = buildLemonCheckoutHref({
        plan: planId as LemonPlanId,
        period: billingPeriod,
        email: session.user?.email,
        userId: session.user?.id,
      })

      if (checkoutUrl) {
        window.location.href = checkoutUrl
        return
      }
    }

    router.push(`/migration-request?from=pricing&plan=${planId}&period=${billingPeriod}`)
    setLoadingPlan(null)
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#F6F7F9] py-16 pt-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-white p-8 shadow-md md:p-12">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#FF6B35]">가격 안내</p>
                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                  무료는 배포를 만들고, 프로는 전환을 운영합니다
                </h1>
                <p className="max-w-2xl text-gray-600">
                  Re:cord는 얼마나 많이 저장하느냐보다, 얼마나 빨리 신뢰를 만들고 얼마나 잘 문의로 이어지게 하느냐에 맞춰 설계되었습니다.
                  먼저 무료로 링크를 열고, 실제로 고객에게 보내기 시작하면 프로로 확장하세요.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setBillingPeriod(period)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      billingPeriod === period
                        ? 'border-[#FF6B35] bg-[#FF6B35]/10 font-semibold text-[#FF6B35]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {BILLING_LABELS[period]}
                    {period === 'yearly' && (
                      <span className="ml-2 inline-flex items-center text-xs text-green-600">2개월 정도 절약</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {launchOffer?.active && (
              <div className="mb-8 rounded-3xl border border-[#FFD9CF] bg-[#FFF4EF] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#FF6B35]">오픈 기념 혜택</p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      첫 {launchOffer.maxUsers}명은 프로 {launchOffer.trialMonths}개월 무료
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      남은 {launchOffer.remaining}자리 · 기존 플랫폼 리뷰는 스크린샷으로 최대 {launchOffer.ocrImportLimit}개까지 빠르게 가져와 첫 링크를 열 수 있습니다.
                    </p>
                  </div>
                  <Link href={session ? '/dashboard/bulk-upload' : '/signup'}>
                    <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                      {session ? '혜택으로 리뷰 옮기기' : '혜택으로 시작하기'}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {PUBLIC_PLAN_ORDER.map((planId) => {
                const plan = PLANS[planId]
                const copy = PUBLIC_PLAN_COPY[planId]
                const isFree = planId === 'free'
                const isLoading = loadingPlan === planId
                const amount = getPlanPrice(planId, billingPeriod)
                const monthlyAmount = getPlanPrice(planId, 'monthly')
                const yearlyAmount = getPlanPrice(planId, 'yearly')
                const savings = getYearlySavings(planId)
                const checkoutReady =
                  isFree || !LEMON_CHECKOUT_ENABLED
                    ? true
                    : Boolean(
                        buildLemonCheckoutHref({
                          plan: planId as LemonPlanId,
                          period: billingPeriod,
                          email: session?.user?.email,
                          userId: session?.user?.id,
                        })
                      )

                return (
                  <Card
                    key={planId}
                    className={`flex flex-col justify-between border-2 ${
                      copy.accent === 'highlight'
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5 shadow-lg'
                        : 'border-transparent bg-gray-50'
                    }`}
                  >
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-500">{copy.title}</div>
                        {plan.badge && (
                          <Badge className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]">
                            {plan.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed text-gray-600">
                        {copy.subtitle}
                      </CardDescription>

                      <div className="mt-6 space-y-1">
                        {amount === 0 ? (
                          <p className="text-4xl font-bold text-gray-900">무료</p>
                        ) : (
                          <p className="text-4xl font-bold text-gray-900">
                            ₩{formatCurrency(amount)}
                            <span className="ml-1 text-base font-medium text-gray-500">
                              {billingPeriod === 'monthly' ? '/월' : '/년'}
                            </span>
                          </p>
                        )}
                        {!isFree && billingPeriod === 'yearly' && (
                          <p className="text-xs text-green-600">
                            월 환산 ₩{formatCurrency(Math.round(yearlyAmount / 12))} · 연간 ₩{formatCurrency(yearlyAmount)}
                            {savings > 0 && ` (₩${formatCurrency(savings)} 절약)`}
                          </p>
                        )}
                        {!isFree && billingPeriod === 'monthly' && (
                          <p className="text-xs text-gray-500">
                            연간 ₩{formatCurrency(yearlyAmount)}로 더 가볍게 시작할 수 있습니다.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 rounded-2xl border border-gray-100 bg-white/70 p-4 text-sm text-gray-700">
                        <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                          <ShieldCheck className="h-4 w-4 text-[#FF6B35]" />
                          {plan.highlight}
                        </div>
                        <p className="text-xs text-gray-500">{plan.bestFor}</p>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {copy.bullets.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {!isFree && (
                        <div className="mt-5 rounded-2xl bg-white/70 p-4 text-xs text-gray-600">
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Sparkles className="h-4 w-4 text-[#FF6B35]" />
                            프로에서 달라지는 점
                          </div>
                          <p className="mt-2">
                            무료로 링크를 퍼뜨리고, 프로로 넘어가면 브랜딩 제거와 운영 확장으로 실제 영업용 링크가 됩니다.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-gray-100 px-3 py-1">브랜딩 제거</span>
                            <span className="rounded-full bg-gray-100 px-3 py-1">프로필 테마</span>
                            <span className="rounded-full bg-gray-100 px-3 py-1">기본 분석</span>
                            <span className="rounded-full bg-gray-100 px-3 py-1">우선 지원</span>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex-col items-start pt-0">
                      <Button
                        variant={copy.accent === 'highlight' ? 'default' : 'outline'}
                        className={`w-full ${
                          copy.accent === 'highlight'
                            ? 'bg-[#FF6B35] hover:bg-[#E55A2B]'
                            : 'border-gray-300 text-gray-800'
                        }`}
                        onClick={() => handleSelectPlan(planId)}
                        disabled={isLoading || !checkoutReady}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> 처리 중...
                          </span>
                        ) : (
                          copy.cta
                        )}
                      </Button>

                      {!isFree && !checkoutReady && (
                        <p className="mt-3 text-xs text-amber-700">
                          현재 선택한 결제 주기의 Lemon 링크가 아직 설정되지 않았습니다.
                        </p>
                      )}

                      {!isFree ? (
                        <div className="mt-4 w-full border-t border-gray-100 pt-4 text-xs text-gray-500">
                          월간 ₩{formatCurrency(monthlyAmount)} · 연간 ₩{formatCurrency(yearlyAmount)}
                        </div>
                      ) : (
                        <div className="mt-4 w-full border-t border-gray-100 pt-4 text-xs text-gray-500">
                          무료로 시작해도 실제 링크를 보내볼 수 있습니다.
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <Card className="border border-[#FF6B35]/20 bg-[#FFF7F3]">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2 text-[#FF6B35]">
                    <Wrench className="h-5 w-5" />
                    <span className="text-sm font-semibold">리뷰 옮겨드림</span>
                  </div>
                  <CardTitle>초기 세팅이 귀찮다면, 우리가 먼저 열어드립니다</CardTitle>
                  <CardDescription>
                    지금 Re:cord에서 가장 중요한 건 기능을 많이 쓰는 게 아니라, 고객에게 보낼 링크를 빨리 여는 일입니다.
                    기존 플랫폼 리뷰를 정리하고 대표 후기와 포트폴리오까지 함께 세팅해드립니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {SETUP_SERVICES.map((service) => (
                    <div key={service.name} className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm">
                      <div className="text-sm font-semibold text-gray-500">{service.name}</div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">₩{formatCurrency(service.price)}</div>
                      <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-700">
                        {service.bullets.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                    <Link href="/migration-request?from=pricing-migration">
                      리뷰 옮겨드림 신청하기
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border border-gray-200 bg-gray-50">
                <CardHeader>
                  <Badge variant="outline" className="w-fit border-gray-300 text-gray-600">
                    운영 베타
                  </Badge>
                  <CardTitle>스튜디오/팀 운영이 필요하신가요?</CardTitle>
                  <CardDescription>
                    지점, 매니저, 여러 문의 채널처럼 더 무거운 운영 흐름은 공개 플랜이 아니라 베타로 먼저 열고 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>월 19,900원부터 시작하는 숨김 플랜으로 별도 안내합니다.</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                      <span>여러 채널·담당자 운영</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                      <span>우선 반영과 운영 베타 지원</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                      <span>필요한 기능이 생기면 맞춤으로 열기</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start gap-3">
                  <Button asChild variant="outline" className="border-gray-300">
                    <Link href="/migration-request?from=pricing-beta">
                      운영 베타 문의하기
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500">
                    아직은 공개 가격표보다, 실제 사용 패턴이 맞는지 함께 보는 단계입니다.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="mt-12 space-y-10">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>요금제와 이용정책, 이 기준으로 운영합니다</CardTitle>
                <CardDescription>
                  Re:cord는 저장량보다 신뢰, 공유, 문의 연결을 중심으로 과금합니다. 검증은 팔지 않고, 데이터는 묶어두지 않습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">검증은 판매하지 않습니다</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>원문 링크 있음 / 직접 받은 후기 / 이미지 증빙 / 검토 완료는 서로 다른 의미로 표시합니다.</li>
                    <li>돈을 낸다고 검증 배지가 생기지 않습니다.</li>
                    <li>허위 후기, 사칭, 무단 이미지 업로드는 검토 후 비공개 또는 제한할 수 있습니다.</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">내 데이터는 내가 가져갈 수 있어야 합니다</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>후기, 이미지, 프로필 데이터는 내보내기를 지원합니다.</li>
                    <li>유료 해지 후에도 기본 데이터는 바로 사라지지 않습니다.</li>
                    <li>후기 요청 기능은 플랜별 사용량 차등을 두고, 스팸성 사용은 제한합니다.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="justify-between text-sm text-gray-600">
                <span>더 자세한 정책과 변경/해지 기준은 안내 페이지에서 확인할 수 있습니다.</span>
                <Link href="/pricing/guide" className="font-medium text-[#FF6B35] hover:underline">
                  요금제·이용정책 자세히 보기
                </Link>
              </CardFooter>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>자주 묻는 질문</CardTitle>
                <CardDescription>런칭 초기에 가장 많이 묻는 질문만 먼저 정리했습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-6 text-sm text-gray-600">
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">무료로도 실제 링크를 보낼 수 있나요?</dt>
                    <dd>
                      네. 무료 플랜도 공개 링크를 열고 실제로 고객에게 보내볼 수 있어야 합니다. 대신 Re:cord 브랜딩이 표시되고,
                      운영 규모와 커스터마이징이 제한됩니다.
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">프로는 언제 결제할 만한가요?</dt>
                    <dd>
                      고객에게 보내는 링크를 더 선명하게 운영하고 싶을 때입니다. 브랜딩 제거, 프로필 테마, 더 넓은 후기 운영,
                      데이터 내보내기와 기본 분석이 필요한 시점부터 가치가 생깁니다.
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">리뷰 옮겨드림은 어떤 사람에게 맞나요?</dt>
                    <dd>
                      이미 네이버, 당근, 크몽, 숨고 등에 리뷰가 많은데 세팅이 귀찮거나 빠르게 열고 싶은 사람에게 맞습니다.
                      처음 링크를 여는 속도를 사는 서비스라고 보면 됩니다.
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">연간 결제는 어떻게 되나요?</dt>
                    <dd>
                      프로는 월 9,900원, 연 99,000원으로 운영합니다. 한 번에 결제하고 현금 흐름을 아끼고 싶은 사용자에게 맞습니다.
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
