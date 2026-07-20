import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TargetAudienceLandingProps {
  eyebrow: string
  headline: string
  problem: string
  summary: string
  bullets: string[]
  evidenceLabel: string
  evidenceText: string
  audienceExamples: string[]
  requestAudience: string
  requestPlatform?: string
  requestSource: string
}

export function TargetAudienceLanding({
  eyebrow,
  headline,
  problem,
  summary,
  bullets,
  evidenceLabel,
  evidenceText,
  audienceExamples,
  requestAudience,
  requestPlatform,
  requestSource,
}: TargetAudienceLandingProps) {
  const migrationHref = `/migration-request?audience=${encodeURIComponent(requestAudience)}${requestPlatform ? `&platform=${encodeURIComponent(requestPlatform)}` : ''}&from=${encodeURIComponent(requestSource)}`
  const requestCta =
    requestAudience === '헤어디자이너'
      ? '헤어 후기 정리 요청'
      : `${requestAudience} 후기 정리 요청`

  return (
    <main className="min-h-screen bg-[#F6F7F9]">
      <section className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] bg-white p-8 shadow-md md:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B35]">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                {headline}
              </h1>
              <p className="mt-6 text-xl font-semibold text-gray-800">{problem}</p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                {summary}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={migrationHref}>
                  <Button size="lg" className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] sm:w-auto">
                    내 소개 페이지 열기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/stylist-demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    실제 페이지 보기
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl bg-[#FFF7F3] px-4 py-4 text-sm font-medium text-gray-700">
                    {bullet}
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-[#FF6B35]/20 bg-slate-900 text-white shadow-md">
              <CardHeader>
              <CardTitle className="text-white">먼저 바뀌는 것</CardTitle>
              <CardDescription className="text-white/70">
                  대표 후기와 작업을 먼저 정리한 소개 페이지를 빠르게 열어드립니다.
              </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[#FFB498]">{evidenceLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">{evidenceText}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[#FFB498]">프로필을 빨리 여는 방식</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    핵심은 자료를 많이 모으는 것이 아니라, 대표 후기와 작업 사진부터 정리해서 소개 전에 보내는 링크를 여는 것입니다. 처음에는 대표 후기 3개와 상담 버튼만 살아 있어도 충분합니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[#FFB498]">이런 분께 바로 필요합니다</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {audienceExamples.map((example) => (
                      <li key={example} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#FF6B35]" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={migrationHref}>
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                    {requestCta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
