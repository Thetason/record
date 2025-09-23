'use client'

import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'

import {
  PLAN_ORDER,
  PLANS,
  PRICING_FEATURE_MATRIX,
  formatCurrency,
  getFeatureValue,
  getPlanPrice,
  getYearlySavings,
  hasFeature,
} from '@/lib/plan-limits'

export default function PricingGuidePage() {
  const planIds = PLAN_ORDER

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container max-w-6xl mx-auto px-4 space-y-12">
        <header className="space-y-4">
          <Link href="/pricing" className="inline-flex items-center text-sm text-[#FF6B35] hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> 가격 페이지로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">요금제 안내</h1>
          <p className="text-gray-600">
            Re:cord의 요금제 구성과 기능 차이를 한눈에 확인하세요. 모든 정보는 최신 코드 설정과 연결되어 있어 운영 환경과 동일하게 유지됩니다.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">플랜 구성 개요</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {planIds.map((planId) => {
              const plan = PLANS[planId]
              const monthly = getPlanPrice(planId, 'monthly')
              const yearly = getPlanPrice(planId, 'yearly')
              const savings = getYearlySavings(planId)

              return (
                <div key={planId} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    {plan.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-[#FF6B35] text-white rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <dl className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <dt>월간 요금</dt>
                      <dd>{monthly === 0 ? '무료' : `₩${formatCurrency(monthly)}`}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>연간 요금</dt>
                      <dd>
                        {yearly === 0 ? '무료' : `₩${formatCurrency(yearly)}`}
                        {savings > 0 && (
                          <span className="ml-2 text-xs text-green-600">(₩{formatCurrency(savings)} 절약)</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>추천 대상</dt>
                      <dd className="text-right text-gray-500 max-w-[60%]">{plan.bestFor}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">주요 혜택</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.marketingHighlights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    <strong>지원 범위:</strong> {plan.supportLevel}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">기능 비교표</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">기능</th>
                  {planIds.map((planId) => (
                    <th key={planId} className="px-4 py-3 text-center font-medium text-gray-600">
                      {PLANS[planId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PRICING_FEATURE_MATRIX.map((feature) => (
                  <tr key={feature.label} className="bg-white">
                    <td className="px-4 py-3 text-gray-700 align-top">
                      <div className="font-medium text-gray-900">{feature.label}</div>
                      {feature.description && (
                        <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                      )}
                    </td>
                    {planIds.map((planId) => {
                      if (feature.key === 'reviewLimit') {
                        return (
                          <td key={planId} className="px-4 py-3 text-center text-gray-700">
                            {feature.format ? feature.format(planId) : '포함'}
                          </td>
                        )
                      }

                      if (feature.key === 'teamMembers') {
                        const seats = getFeatureValue(planId, 'teamMembers') as number
                        const text = feature.format ? feature.format(planId) : `${seats}명`
                        return (
                          <td key={planId} className="px-4 py-3 text-center">
                            {seats > 0 ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Check className="w-4 h-4" /> {text}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-400">
                                <X className="w-4 h-4" /> {text}
                              </span>
                            )}
                          </td>
                        )
                      }

                      const included = hasFeature(planId, feature.key as keyof typeof PLANS.free.features)
                      return (
                        <td key={planId} className="px-4 py-3 text-center">
                          {included ? (
                            <Check className="w-5 h-5 inline text-green-600" />
                          ) : (
                            <X className="w-5 h-5 inline text-gray-400" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            * 커스텀 도메인, API 액세스, 커스텀 CSS 등은 프로 플랜에서 제공됩니다. 프리미엄 플랜은 맞춤형 위젯과 워터마크 제거, 우선 지원을 포함합니다.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">결제 및 변경 정책</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">결제 주기</h3>
              <ul className="space-y-1">
                <li>월간 결제는 매월 같은 날 토스페이먼츠를 통해 자동 청구됩니다.</li>
                <li>연간 결제는 월 요금 대비 약 20% 할인된 금액으로 일괄 청구됩니다.</li>
                <li>결제 실패 시 알림 이메일이 발송되며 최대 3회 재시도합니다.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">플랜 변경</h3>
              <ul className="space-y-1">
                <li>상위 플랜 업그레이드는 결제 완료 후 즉시 적용됩니다.</li>
                <li>하위 플랜 전환은 현재 구독 기간 종료 후 자동 반영됩니다.</li>
                <li>만료 시 무료 플랜으로 전환되며, 기존 리뷰 데이터는 그대로 유지됩니다.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">청구서 및 증빙</h3>
              <ul className="space-y-1">
                <li>모든 결제 영수증은 자동으로 이메일로 발송됩니다.</li>
                <li>세금계산서 발급이 필요한 경우 support@record.kr 로 접수해 주세요.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">환불 정책</h3>
              <ul className="space-y-1">
                <li>결제 후 7일 이내 사용 이력이 없으면 전액 환불 가능합니다.</li>
                <li>서비스 사용 중 환불은 이용 일수에 따라 일할 계산되어 처리됩니다.</li>
                <li>환불 요청은 토스페이먼츠 정책에 따라 영업일 기준 3~5일이 소요됩니다.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="border-t pt-6 text-sm text-gray-600 space-y-2">
          <p>요금제 관련 문의: <a className="underline" href="mailto:support@record.kr">support@record.kr</a></p>
          <p>본 안내 페이지는 `lib/plan-limits.ts`의 설정을 기준으로 자동 생성되어 운영 환경과 항상 일치합니다.</p>
        </footer>
      </div>
    </div>
  )
}
