import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Check, MessageCircle } from 'lucide-react'

import { LandingNav } from '@/components/landing/LandingNav'
import { Button } from '@/components/ui/button'
import { SETUP_PACKAGE, formatWon, getPaymentChannels } from '@/lib/setup-package'

export const metadata: Metadata = {
  title: '세팅 패키지 결제 안내 | Re:cord',
  description: `Re:cord ${SETUP_PACKAGE.name} ${formatWon(SETUP_PACKAGE.price)} 결제 방법 안내`,
}

const REQUEST_HREF = '/migration-request?from=pricing'
const SUPPORT_EMAIL = 'support@record.kr'

export default function PayPage() {
  const { bank, kakaoUrl } = getPaymentChannels()

  return (
    <>
      <LandingNav />
      <div className="min-h-screen bg-[#f2f4f6] py-16 pt-28">
        <div className="mx-auto max-w-2xl px-4">
          <Link href="/pricing" className="inline-flex items-center text-sm text-[#FF6B35] hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" /> 가격 안내로 돌아가기
          </Link>

          <div className="mt-4 rounded-3xl bg-white p-8 shadow-md md:p-10">
            <p className="text-sm font-semibold text-[#FF6B35]">결제 안내</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{SETUP_PACKAGE.name}</h1>
            <p className="mt-2 text-4xl font-bold text-gray-900">{formatWon(SETUP_PACKAGE.price)}</p>
            <p className="mt-1 text-sm text-gray-500">1회 결제 · 자동 결제 없음</p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {SETUP_PACKAGE.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <ol className="mt-10 space-y-6">
              <li className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">1. 신청서 남기기</p>
                <p className="mt-1 text-sm text-gray-600">
                  연락처와 지금 후기가 있는 곳을 알려주세요. 이미 남기셨다면 건너뛰셔도 됩니다.
                </p>
                <Button asChild variant="outline" className="mt-3 border-gray-300">
                  <Link href={REQUEST_HREF}>신청서 작성하기</Link>
                </Button>
              </li>

              <li className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">2. 계좌이체</p>
                {bank ? (
                  <>
                    <dl className="mt-3 space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">은행</dt>
                        <dd className="font-medium text-gray-900">{bank.bankName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">계좌번호</dt>
                        <dd className="select-all font-mono font-medium text-gray-900">{bank.bankAccount}</dd>
                      </div>
                      {bank.bankHolder && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">예금주</dt>
                          <dd className="font-medium text-gray-900">{bank.bankHolder}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">금액</dt>
                        <dd className="font-medium text-gray-900">{formatWon(SETUP_PACKAGE.price)}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-xs text-gray-500">입금자명은 신청서에 적은 이름으로 해주세요.</p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    신청서를 남겨주시면 입금 계좌를 바로 보내드립니다.
                  </p>
                )}
              </li>

              <li className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">3. 입금했다고 알려주기</p>
                <p className="mt-1 text-sm text-gray-600">
                  확인되면 바로 세팅을 시작하고, 완성된 링크를 보내드립니다. 카드 결제나 세금계산서가 필요하면 함께 말씀해주세요.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {kakaoUrl && (
                    <Button asChild className="bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00]">
                      <a href={kakaoUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        카카오톡으로 알리기
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="border-gray-300">
                    <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('세팅 패키지 입금 확인 요청')}`}>
                      이메일로 알리기
                    </a>
                  </Button>
                </div>
              </li>
            </ol>

            <p className="mt-8 text-xs text-gray-500">
              세팅을 시작하기 전에는 전액 환불합니다. 자세한 기준은{' '}
              <Link href="/pricing/guide" className="underline">이용정책</Link>을 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
