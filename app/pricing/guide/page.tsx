'use client'

import Link from 'next/link'
import { ArrowLeft, Check, ShieldCheck, Wrench } from 'lucide-react'

import {
  PLANS,
  PUBLIC_PLAN_ORDER,
  PRICING_FEATURE_MATRIX,
  getFeatureValue,
  hasFeature,
} from '@/lib/plan-limits'
import { SETUP_PACKAGE, formatWon } from '@/lib/setup-package'

export default function PricingGuidePage() {
  const publicPlans = PUBLIC_PLAN_ORDER

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto max-w-6xl space-y-12 px-4">
        <header className="space-y-4">
          <Link href="/pricing" className="inline-flex items-center text-sm text-[#FF6B35] hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" /> 가격 페이지로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">요금제·이용정책 안내</h1>
          <p className="max-w-3xl text-gray-600">
            Re:cord는 리뷰를 얼마나 많이 저장하느냐보다, 얼마나 빨리 신뢰를 만들고 얼마나 잘 문의로 이어지게 하느냐에 맞춰 설계됩니다.
            링크는 무료로 직접 만들 수 있고, 맡기고 싶다면 세팅 패키지를 한 번 결제하면 됩니다.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#FF6B35]" />
            <h2 className="text-2xl font-semibold text-gray-900">판매 상품은 하나입니다</h2>
          </div>
          <div className="rounded-2xl border border-[#FF6B35]/20 bg-[#FFF7F3] p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-semibold text-gray-900">{SETUP_PACKAGE.name}</h3>
              <div className="text-2xl font-bold text-gray-900">{formatWon(SETUP_PACKAGE.price)} <span className="text-sm font-medium text-gray-500">1회</span></div>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">{SETUP_PACKAGE.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {SETUP_PACKAGE.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              월 구독과 자동 결제는 없습니다. 프로 {SETUP_PACKAGE.includedProMonths}개월이 끝나면 무료 플랜으로 돌아가고, 후기와 링크는 그대로 유지됩니다.
              직접 만들고 싶다면 무료로 시작할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">무료와 프로의 차이</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">기준</th>
                  {publicPlans.map((planId) => (
                    <th key={planId} className="px-4 py-3 text-center font-medium text-gray-600">
                      {PLANS[planId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {PRICING_FEATURE_MATRIX.map((feature) => (
                  <tr key={feature.label}>
                    <td className="px-4 py-3 align-top text-gray-700">
                      <div className="font-medium text-gray-900">{feature.label}</div>
                      {feature.description && (
                        <p className="mt-1 text-xs text-gray-500">{feature.description}</p>
                      )}
                    </td>
                    {publicPlans.map((planId) => {
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
                          <td key={planId} className="px-4 py-3 text-center text-gray-700">
                            {text}
                          </td>
                        )
                      }

                      const included = hasFeature(planId, feature.key as keyof typeof PLANS.free.features)
                      return (
                        <td key={planId} className="px-4 py-3 text-center">
                          {included ? (
                            <Check className="inline h-5 w-5 text-green-600" />
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#FF6B35]" />
            <h2 className="text-2xl font-semibold text-gray-900">이용정책 핵심</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">검증은 판매하지 않습니다</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>원문 링크 있음, 직접 받은 후기, 이미지 증빙 있음, 검토 완료는 서로 다른 의미로 표시합니다.</li>
                <li>돈을 낸다고 검토 완료나 신뢰 배지가 생기지 않습니다.</li>
                <li>허위 후기, 사칭, 무단 이미지 업로드는 비공개 또는 제한할 수 있습니다.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">데이터 이동권을 열어둡니다</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>후기, 이미지, 프로필은 내보내기를 지원합니다.</li>
                <li>유료 해지 후에도 기본 데이터는 즉시 사라지지 않습니다.</li>
                <li>계정 삭제 요청 시 관련 법령과 운영 기준에 따라 보관 후 삭제합니다.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">환불과 해지는 복잡하지 않게</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>자동 결제가 없으니 따로 해지할 필요가 없습니다.</li>
                <li>세팅 작업을 시작하기 전에는 전액 환불합니다.</li>
                <li>세팅 작업을 시작한 뒤에는 진행 정도에 따라 환불이 제한될 수 있습니다.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">후기 요청은 스팸이 되지 않게</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>무료와 유료는 후기 요청 사용량이 다르게 운영됩니다.</li>
                <li>반복 신고, 무차별 요청, 스팸성 사용은 기능 제한 대상입니다.</li>
                <li>지원 응답 속도도 플랜과 세팅 서비스 여부에 따라 달라집니다.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="border-t pt-6 text-sm text-gray-600">
          <p>요금제나 운영 정책이 궁금하면 <a className="underline" href="mailto:support@record.kr">support@record.kr</a> 로 문의해 주세요.</p>
          <p className="mt-2">
            법적 효력을 갖는 약관과 개인정보처리방침은 별도 문서를 따르며, 이 페이지는 런칭 단계의 요금제·운영 원칙을 이해하기 쉽게 정리한 안내입니다.
          </p>
        </footer>
      </div>
    </div>
  )
}
