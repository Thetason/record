'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileImage, Link2, MessageSquareText, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const platformOptions = ['네이버', '카카오맵', '당근', '크몽', '프립', '솜씨당', '기타']
const audienceOptions = ['헤어디자이너', 'PT 트레이너', '크몽 프리랜서', '강사', '기타']
const contactOptions = ['이메일', '카카오톡/문자', '전화']
const urgencyOptions = [
  { value: 'today', label: '오늘 안에 필요' },
  { value: 'this_week', label: '이번 주 안에 필요' },
  { value: 'this_month', label: '이번 달 안에 필요' },
  { value: 'exploring', label: '일단 상담부터' },
]
const materialOptions = ['스크린샷', '인스타 하이라이트', '포트폴리오 링크']

const audienceContext: Record<string, { eyebrow: string; title: string; description: string; example: string; helper: string }> = {
  '헤어디자이너': {
    eyebrow: 'FOR HAIR STYLISTS',
    title: '샵을 옮기기 전에 소개 페이지부터 열어두세요',
    description: '전 샵에 남겨둔 네이버 후기와 인스타 하이라이트를 정리해 처음 보는 고객도 바로 이해할 수 있는 소개 페이지를 먼저 만듭니다.',
    example: '예: 이번 주 안에 샵을 옮기는데 네이버 후기 40개를 먼저 정리하고 싶습니다.',
    helper: '네이버 후기 스크린샷, 하이라이트, 작업 사진이 있다면 바로 세팅을 시작할 수 있습니다.'
  },
  'PT 트레이너': {
    eyebrow: 'FOR PT TRAINERS',
    title: '센터를 옮겨도 회원 신뢰는 그대로 이어가세요',
    description: '센터 후기와 직접 받은 고객 피드백을 트레이너 이름으로 정리해 상담 링크 하나로 보여줄 수 있게 만듭니다.',
    example: '예: 개인 PT 전환 전에 회원 후기와 소개 페이지를 먼저 정리하고 싶습니다.',
    helper: '네이버 후기, 카톡 후기 캡처, 전후 사진이 있으면 PT용 소개 페이지 초안을 빠르게 만들 수 있습니다.'
  },
  '크몽 프리랜서': {
    eyebrow: 'FOR PLATFORM FREELANCERS',
    title: '플랫폼 밖에서도 통하는 리뷰 자산을 먼저 확보하세요',
    description: '크몽에 묶여 있는 리뷰를 포트폴리오형 소개 페이지로 정리해 플랫폼 노출과 무관하게 소개와 상담에 쓸 수 있게 만듭니다.',
    example: '예: 크몽 리뷰 스크린샷 25개와 포트폴리오 링크를 정리해뒀고, 이번 주 안에 새 링크를 만들고 싶습니다.',
    helper: '크몽은 리뷰 스크린샷과 기존 작업 링크를 함께 보내주시면 빠르게 정리할 수 있습니다.'
  }
}

interface MigrationRequestClientProps {
  initialAudience?: string
  initialPlatform?: string
  initialMethod?: string
  initialSource?: string
}

export function MigrationRequestClient({
  initialAudience,
  initialPlatform,
  initialMethod,
  initialSource
}: MigrationRequestClientProps) {
  const defaultPreferredMethod = initialMethod || '스크린샷 업로드'
  const defaultMaterials = ['스크린샷']

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    audience: initialAudience || '헤어디자이너',
    platforms: initialPlatform ? [initialPlatform] : ['네이버'],
    reviewCount: '',
    preferredMethod: defaultPreferredMethod,
    preferredContact: '이메일',
    urgency: 'this_week',
    materials: defaultMaterials,
    currentProfileUrl: '',
    message: '',
    source: initialSource || 'public-page'
  }))

  const selectedPlatformLabels = useMemo(() => new Set(formData.platforms), [formData.platforms])
  const context = audienceContext[formData.audience] || {
    eyebrow: 'BETA CONCIERGE ONBOARDING',
    title: '리뷰 자료만 보내주시면 소개 페이지까지 빠르게 정리합니다',
    description: '스크린샷과 링크 자료만 있어도 충분합니다. 여러 플랫폼 리뷰를 가장 빠른 방식으로 정리해드립니다.',
    example: '예: 이번 주 안에 새 링크를 공유해야 해서 리뷰를 먼저 정리하고 싶습니다.',
    helper: '자료가 흩어져 있어도 괜찮습니다. 가장 편한 방식으로 먼저 받겠습니다.'
  }

  const togglePlatform = (platform: string) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platform)
      if (exists) {
        const next = prev.platforms.filter((item) => item !== platform)
        return { ...prev, platforms: next.length > 0 ? next : [platform] }
      }

      return {
        ...prev,
        platforms: [...prev.platforms, platform].slice(0, 5)
      }
    })
  }

  const toggleMaterial = (material: string) => {
    setFormData((prev) => {
      const exists = prev.materials.includes(material)
      if (exists) {
        const next = prev.materials.filter((item) => item !== material)
        return { ...prev, materials: next.length > 0 ? next : [material] }
      }

      return {
        ...prev,
        materials: [...prev.materials, material].slice(0, 5)
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/migration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || '요청을 접수하지 못했습니다.')
      }

      setSuccess(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '요청을 접수하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <Card className="border-[#FF6B35]/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-2xl">소개 페이지 정리 요청이 접수되었습니다</CardTitle>
              <CardDescription className="text-base leading-7">
                스크린샷과 링크 자료를 먼저 검토해 가장 빠르게 소개 페이지 초안까지 정리해드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                접수 후에는 1) 자료 확인 2) 대표 후기와 작업 선정 3) 소개 페이지 초안 정리 순서로 진행합니다. 필요하면 리뷰 스크린샷과 포트폴리오 링크부터 먼저 받습니다.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/signup">
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] sm:w-auto">
                    지금 계정 만들기
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button variant="outline" className="w-full sm:w-auto">
                    업로드 가이드 보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-md md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B35]">{context.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            {context.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {context.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FileImage,
                title: '스크린샷 업로드',
                copy: '가장 빠르게 바로 시작할 수 있는 방식'
              },
              {
                icon: Link2,
                title: '포트폴리오 링크 정리',
                copy: '인스타 하이라이트나 기존 작업 링크도 함께 정리합니다'
              },
              {
                icon: Sparkles,
                title: '대표 후기 큐레이션',
                copy: '가장 먼저 보여줄 리뷰 3개를 함께 골라드립니다'
              },
              {
                icon: MessageSquareText,
                title: '직접 후기 수집 시작',
                copy: '과거 후기 정리 후에는 내 링크로 직접 받습니다'
              }
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-[#FF6B35] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-gray-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.copy}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm font-semibold text-[#FFB498]">가장 빠르게 시작하는 방법</p>
            <p className="mt-3 text-sm leading-7 text-white/80">
              첫 고객은 셀프서브보다 빠른 세팅이 중요합니다. 리뷰 자료를 먼저 받고, 가장 적은 마찰로 공개 페이지를 발행하는 방식으로 지원합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">카드 등록 없음</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">스크린샷 중심 정리</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">초안 먼저 발행</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">무엇을 준비하면 좋나요?</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                <li>1. 플랫폼 리뷰 스크린샷</li>
                <li>2. 인스타 하이라이트나 기존 포트폴리오 링크</li>
                <li>3. 가장 먼저 살리고 싶은 대표 후기 3개</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">베타 기간 답변 범위</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                <li>1. 어떤 방식으로 자료를 보내는 게 제일 빠른지 안내</li>
                <li>2. 소개 페이지 초안 구조 제안</li>
                <li>3. 직접 후기 수집 시작 방법 정리</li>
              </ul>
            </div>
          </div>
        </div>

        <Card className="border-[#FF6B35]/20 shadow-md">
          <CardHeader>
            <CardTitle>소개 페이지 정리 요청</CardTitle>
            <CardDescription>
              연락처와 현재 리뷰 상태를 남겨주시면, 자료를 가장 편하게 넘기는 방법과 소개 페이지 초안 방향까지 함께 안내합니다.
            </CardDescription>
            {formData.source === 'pricing' && (
              <div className="mt-3 rounded-xl bg-[#FF6B35]/10 px-4 py-3 text-sm leading-6 text-gray-700">
                베타 기간에는 프로 결제를 세팅 요청과 함께 직접 안내드립니다. 요청을 남겨주시면
                결제 방법과 세팅 일정까지 한 번에 정리해드릴게요.
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">이름</label>
                  <Input
                    value={formData.name}
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="홍길동"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">이메일</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="hello@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">직군</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.audience}
                    onChange={(event) => setFormData((prev) => ({ ...prev, audience: event.target.value }))}
                  >
                    {audienceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">대략적인 리뷰 수</label>
                  <Input
                    value={formData.reviewCount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, reviewCount: event.target.value }))}
                    placeholder="예: 30~50개"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">어떤 플랫폼 리뷰인가요?</label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((platform) => {
                    const active = selectedPlatformLabels.has(platform)
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {platform}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">자료를 어떻게 보내고 싶나요?</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.preferredMethod}
                    onChange={(event) => setFormData((prev) => ({ ...prev, preferredMethod: event.target.value }))}
                  >
                    {['스크린샷 업로드', '리뷰 옮겨드림 상담', '잘 모르겠어요'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">전화번호 (선택)</label>
                  <Input
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">언제까지 필요한가요?</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.urgency}
                    onChange={(event) => setFormData((prev) => ({ ...prev, urgency: event.target.value }))}
                  >
                    {urgencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">어떻게 연락드리면 좋을까요?</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.preferredContact}
                    onChange={(event) => setFormData((prev) => ({ ...prev, preferredContact: event.target.value }))}
                  >
                    {contactOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">지금 가지고 있는 자료는 무엇인가요?</label>
                <div className="flex flex-wrap gap-2">
                  {materialOptions.map((material) => {
                    const active = formData.materials.includes(material)
                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => toggleMaterial(material)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {material}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">현재 인스타/SNS 링크 (선택)</label>
                <Input
                  value={formData.currentProfileUrl}
                  onChange={(event) => setFormData((prev) => ({ ...prev, currentProfileUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">무엇을 제일 빨리 해결하고 싶나요?</label>
                <Textarea
                  value={formData.message}
                  onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder={context.example}
                  rows={6}
                  required
                />
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  {context.helper}
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full bg-[#FF6B35] text-base hover:bg-[#E55A2B]"
                disabled={submitting}
              >
                {submitting ? '요청 접수 중...' : '소개 페이지 정리 요청 보내기'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto mt-8 max-w-6xl">
        <div className="rounded-[32px] bg-white p-8 shadow-md md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B35]">FAQ</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: '스크린샷만 가능한가요?',
                copy: '스크린샷이 가장 빠릅니다. 인스타 하이라이트와 포트폴리오 링크도 함께 보고 가장 빠른 방식으로 세팅합니다.',
              },
              {
                title: '플랫폼 공식 연동인가요?',
                copy: '아닙니다. 사용자가 제공한 리뷰 자료를 정리해 내 이름의 페이지로 보관하고 공개하는 방식입니다.',
              },
              {
                title: '아직 자료가 정리 안 되어 있어도 되나요?',
                copy: '괜찮습니다. 지금 가지고 있는 것부터 적어주시면 어떤 방식이 가장 적은 마찰인지 먼저 안내합니다.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-[#F6F7F9] p-5">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-gray-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
