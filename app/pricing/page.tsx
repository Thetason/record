'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LandingNav } from '@/components/landing/LandingNav'
import { Check, ShieldCheck, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SETUP_PACKAGE, formatWon } from '@/lib/setup-package'
import type { LaunchOfferSnapshot } from '@/lib/launch-offer-config'

const SETUP_PACKAGE_HREF = '/migration-request?from=pricing'

const FREE_BULLETS = [
  '공개 신뢰 페이지 1개',
  '스크린샷으로 후기 직접 가져오기',
  '후기 요청 링크와 기본 공유',
  '페이지 조회·상담 클릭 수 확인',
]

export default function PricingPage() {
  const { data: session } = useSession()
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

  return (
    <>
      <LandingNav />
      <div className="min-h-screen bg-[#f2f4f6] py-16 pt-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-white p-8 shadow-md md:p-12">
            <div className="mb-10 space-y-3">
              <p className="text-sm font-semibold text-[#FF6B35]">가격 안내</p>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                직접 만들면 무료, 맡기면 {formatWon(SETUP_PACKAGE.price)} 한 번
              </h1>
              <p className="max-w-2xl text-gray-600">
                월 구독은 없습니다. 링크는 무료로 직접 만들 수 있고, 후기 옮기기부터 상담에 보낼 페이지 완성까지
                맡기고 싶다면 세팅 패키지를 한 번만 결제하면 됩니다.
              </p>
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
                  <Link href={session ? '/dashboard/import' : '/signup'}>
                    <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                      {session ? '혜택으로 리뷰 옮기기' : '혜택으로 시작하기'}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="flex flex-col justify-between border-2 border-transparent bg-gray-50">
                <CardHeader>
                  <div className="mb-3 text-sm font-semibold text-gray-500">직접 만들기</div>
                  <CardTitle className="text-2xl font-bold text-gray-900">무료</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed text-gray-600">
                    가입하고 바로 내 링크를 열어 고객에게 보내볼 수 있습니다.
                  </CardDescription>
                  <p className="mt-6 text-4xl font-bold text-gray-900">0원</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {FREE_BULLETS.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start pt-0">
                  <Button asChild variant="outline" className="w-full border-gray-300 text-gray-800">
                    <Link href={session ? '/dashboard' : '/signup'}>무료로 시작하기</Link>
                  </Button>
                  <p className="mt-4 w-full border-t border-gray-100 pt-4 text-xs text-gray-500">
                    무료 페이지에는 Re:cord 표시가 함께 나갑니다.
                  </p>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between border-2 border-[#FF6B35] bg-[#FF6B35]/5 shadow-lg">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35]">
                      <Wrench className="h-4 w-4" />
                      맡기기
                    </div>
                    <Badge className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]">추천</Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{SETUP_PACKAGE.name}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed text-gray-600">
                    {SETUP_PACKAGE.summary}
                  </CardDescription>
                  <p className="mt-6 text-4xl font-bold text-gray-900">
                    {formatWon(SETUP_PACKAGE.price)}
                    <span className="ml-1 text-base font-medium text-gray-500">1회</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {SETUP_PACKAGE.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-[#FF6B35]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-start pt-0">
                  <Button asChild className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                    <Link href={SETUP_PACKAGE_HREF}>세팅 패키지 신청하기</Link>
                  </Button>
                  <p className="mt-4 w-full border-t border-gray-100 pt-4 text-xs text-gray-500">
                    자동 결제 없음 · 프로 {SETUP_PACKAGE.includedProMonths}개월이 끝나면 무료 플랜으로 그대로 유지됩니다.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="mt-12 space-y-10">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>이 기준으로 운영합니다</CardTitle>
                <CardDescription>
                  검증은 팔지 않고, 데이터는 묶어두지 않습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                    <ShieldCheck className="h-4 w-4 text-[#FF6B35]" />
                    검증은 판매하지 않습니다
                  </h3>
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
                    <li>프로 기간이 끝나도 데이터와 링크는 그대로 남습니다.</li>
                    <li>후기 요청 기능은 스팸성 사용을 제한합니다.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="justify-between text-sm text-gray-600">
                <span>환불과 이용 기준은 안내 페이지에서 확인할 수 있습니다.</span>
                <Link href="/pricing/guide" className="font-medium text-[#FF6B35] hover:underline">
                  이용정책 자세히 보기
                </Link>
              </CardFooter>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>자주 묻는 질문</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-6 text-sm text-gray-600">
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">무료로도 실제 링크를 보낼 수 있나요?</dt>
                    <dd>
                      네. 무료로도 공개 링크를 열고 고객에게 보낼 수 있습니다. 대신 Re:cord 표시가 함께 나갑니다.
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">세팅 패키지는 어떤 분께 맞나요?</dt>
                    <dd>
                      네이버, 당근, 크몽, 숨고 등에 후기가 이미 많은데 옮기고 다듬을 시간이 없는 분께 맞습니다.
                      자료만 보내주시면 상담에 바로 보낼 수 있는 상태로 완성해드립니다.
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">매달 돈이 나가나요?</dt>
                    <dd>
                      아니요. {formatWon(SETUP_PACKAGE.price)} 한 번이고 자동 결제는 없습니다. 포함된 프로 {SETUP_PACKAGE.includedProMonths}개월이
                      끝나면 무료 플랜으로 돌아가며, 후기와 링크는 그대로 유지됩니다.
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 font-semibold text-gray-900">결제는 어떻게 하나요?</dt>
                    <dd>
                      신청서를 남기시면 계좌이체 안내를 드립니다. 입금이 확인되면 바로 세팅을 시작합니다.
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
