'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/Navigation'
import {
  BookOpenCheck,
  PlayCircle,
  ShieldCheck,
  FilePlus,
  ArrowRight,
  ClipboardCheck,
  Link2,
  Images
} from 'lucide-react'

const quickStartSteps = [
  {
    title: '1. 계정 만들기',
    description: '회원가입 후 현재 근무지와 소개 문구를 입력해 새 고객에게 바로 보여줄 프로필을 준비하세요.',
    icon: <FilePlus className="w-5 h-5" />,
    href: '/signup',
    cta: '무료 가입'
  },
  {
    title: '2. 대표 후기와 작업 정리',
    description: '리뷰 원문 링크나 캡처 중 지금 가진 자료만으로 대표 후기 3개와 작업 사진 2장을 먼저 고르세요.',
    icon: <ClipboardCheck className="w-5 h-5" />,
    href: '/dashboard/profile',
    cta: '프로필 완성하기'
  },
  {
    title: '3. 링크 실제로 보내기',
    description: '공개 페이지를 정리한 뒤 인스타, 카카오톡, 새 샵 공지에 바로 붙여 상담 전환을 확인하세요.',
    icon: <ShieldCheck className="w-5 h-5" />,
    href: '/dashboard/share',
    cta: '공유 화면 열기'
  }
]

const workflowCards = [
  {
    title: '라이브 데모로 둘러보기',
    description: '소개 전에 보내게 될 공개 프로필이 실제로 어떻게 보이는지, 후기와 원문 캡처 흐름까지 미리 확인해보세요.',
    icon: <PlayCircle className="w-8 h-8 text-[#FF6B35]" />,
    href: '#live-demo'
  },
  {
    title: '세팅 가이드',
    description: '이름, 대표 후기, 작업 사진, 상담 버튼을 어떻게 정리하면 되는지 단계별로 안내합니다.',
    icon: <BookOpenCheck className="w-8 h-8 text-[#FF6B35]" />,
    href: '#setup'
  },
  {
    title: '공유 전에 점검하기',
    description: '대표 후기, 포트폴리오, CTA가 30초 안에 신뢰를 주는지 마지막으로 확인하세요.',
    icon: <ShieldCheck className="w-8 h-8 text-[#FF6B35]" />,
    href: '#share-check'
  },
  {
    title: '실제 상담에 보내기',
    description: '인스타 DM, 카카오톡, 새 샵 공지 전에 링크를 실제로 보내보는 것이 가장 중요한 검증입니다.',
    icon: <ArrowRight className="w-8 h-8 text-[#FF6B35]" />,
    href: '#share-check'
  }
]

const setupChecklist = [
  {
    heading: '프로필 기본 구성',
    items: [
      '현재 소개 문구, 핵심 서비스, 연락 동선 등록',
      '대표 리뷰 3개 선정 후 상단에 고정',
      '문의 버튼과 링크 연동 (전화, 예약, 상담 링크 등)'
    ]
  },
  {
    heading: '대표 후기 불러오기',
    items: [
      '원문 링크나 리뷰 캡처가 있는 후기부터 고르기',
      '처음에는 대표 후기 3개만 먼저 정리하기',
      '문장이 길어도 좋으니 설득력 있는 후기 우선 저장하기'
    ]
  },
  {
    heading: '공유 전 점검',
    items: [
      '링크를 열자마자 누구인지 3초 안에 이해되는지',
      '대표 후기와 작업 이미지가 가장 먼저 보이는지',
      '상담/예약 버튼이 바로 눌리는지'
    ]
  }
]

const launchBlocks = [
  {
    title: '대표 후기 3개',
    description: '처음엔 모든 후기가 아니라, 소개 전에 보여줄 후기 3개가 더 중요합니다.',
    icon: <ClipboardCheck className="w-5 h-5" />,
    items: ['직접 받은 후기 우선', '원문 링크가 있으면 함께 첨부', '작업 결과가 읽히는 후기부터 선택'],
  },
  {
    title: '공유 가능한 링크',
    description: '고객이 카톡, 인스타, DM에서 바로 눌러볼 수 있는 링크여야 합니다.',
    icon: <Link2 className="w-5 h-5" />,
    items: ['고유 URL 확인', '상담 버튼 연결', '실제로 복사해 한 번 보내보기'],
  },
  {
    title: '작업 사진 2장 이상',
    description: '말보다 빠르게 실력을 보여주는 장면이 필요합니다.',
    icon: <Images className="w-5 h-5" />,
    items: ['대표 시술 2장 이상', '너무 많은 사진보다 선명한 몇 장', '후기와 함께 보이도록 배치'],
  }
]

export default function GuidePage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#F6F7F9] py-16 pt-24">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
        <section className="bg-white rounded-3xl shadow-md p-8 md:p-12">
          <Badge className="mb-4 w-fit bg-[#FF6B35]/10 text-[#FF6B35]">사용 가이드</Badge>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                개인 전문가가 새 고객에게 바로 보여줄 프로필을 여는 과정을 안내합니다
              </h1>
              <p className="text-gray-600 text-lg">
                Re:cord는 여러 곳에 흩어진 리뷰를 정리해 대표 후기와 작업이 먼저 보이는 공개 프로필을 만드는 도구입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                <Link href="/pricing">
                  요금 안내 보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/#live-demo">라이브 데모 보기</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {quickStartSteps.map((step) => (
            <Card key={step.title} className="border-0 shadow-sm bg-white">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                  {step.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">{step.title}</CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href={step.href}>{step.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="import-guide" className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">처음엔 이것만 채우면 됩니다</h2>
              <p className="text-gray-600">
                중요한 건 업로드 방식이 아니라, 고객이 30초 안에 믿을 수 있는 링크를 만드는 일입니다. 이름, 대표 후기, 작업 사진, 상담 버튼만 또렷하면 충분합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/profile">프로필부터 정리하기 →</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/share">공유 화면 열기</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {launchBlocks.map((block) => (
              <Card key={block.title} className="border-0 bg-[#F8FAFC]">
                <CardHeader className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                    {block.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{block.title}</CardTitle>
                  <p className="text-sm text-gray-600 leading-relaxed">{block.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-[#FF6B35]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8" id="live-demo">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">실제로 보내는 흐름</h2>
              <p className="text-gray-600">보컬트레이너, 헤어디자이너, 필라테스 강사처럼 소개 전에 신뢰를 보여줘야 하는 개인 전문가 기준으로 순서를 설명합니다.</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/">라이브 데모 보기 →</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {workflowCards.map((card) => (
              <Card key={card.title} className="border-0 bg-[#F8FAFC]">
                <CardHeader className="space-y-3">
                  <div>{card.icon}</div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{card.title}</CardTitle>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
                  <Button variant="link" className="p-0 w-fit" asChild>
                    <a href={card.href}>자세히 보기 →</a>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="setup" className="grid gap-6 md:grid-cols-3">
          {setupChecklist.map((section) => (
            <Card key={section.heading} className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#FF6B35]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="share-check" className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">공유 전에 꼭 확인할 것</h2>
              <p className="text-gray-600">지금 필요한 건 예쁜 대시보드보다, 이 링크 하나가 30초 안에 신뢰를 주는지 확인하는 일입니다.</p>
            </div>
            <Badge className="bg-[#FF6B35]/10 text-[#FF6B35]">SHARE CHECK</Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">첫 화면</CardTitle>
              </CardHeader>
              <CardContent>
                <p>이름, 전문분야, 대표후기, 작업 이미지가 처음 1화면 안에 들어오는지 확인하세요.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">CTA 위치</CardTitle>
              </CardHeader>
              <CardContent>
                <p>카카오톡, 전화, 예약 버튼이 스크롤 없이 보이거나 바로 찾히는 위치에 있어야 합니다.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">실제 전송</CardTitle>
              </CardHeader>
              <CardContent>
                <p>이 프로필을 실제 새 고객에게 보내보는 것이 가장 중요합니다. 공유되지 않는 프로필은 아직 제품이 아닙니다.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
    </>
  )
}
