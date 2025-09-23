'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpenCheck,
  PlayCircle,
  Wrench,
  BarChart3,
  Users,
  ShieldCheck,
  FilePlus,
  ArrowRight
} from 'lucide-react'

const quickStartSteps = [
  {
    title: '1. 계정 만들기',
    description: '회원가입 후 관리자 대시보드에서 브랜드 정보를 입력하세요.',
    icon: <FilePlus className="w-5 h-5" />,
    href: '/signup',
    cta: '무료 가입'
  },
  {
    title: '2. 리뷰 불러오기',
    description: '네이버, 카카오, 구글 등 기존 리뷰를 CSV나 스크린샷으로 업로드합니다.',
    icon: <Wrench className="w-5 h-5" />,
    href: '/guide#import-review',
    cta: '업로드 가이드'
  },
  {
    title: '3. 프로필 공개',
    description: '브랜드 페이지를 커스터마이징하고 고객에게 공유하세요.',
    icon: <ShieldCheck className="w-5 h-5" />,
    href: '/pricing',
    cta: '플랜 살펴보기'
  }
]

const workflowCards = [
  {
    title: '라이브 데모로 둘러보기',
    description: '실제 고객 사례를 통해 리뷰 통합 화면과 통계 대시보드를 경험해보세요.',
    icon: <PlayCircle className="w-8 h-8 text-[#FF6B35]" />,
    href: '#live-demo'
  },
  {
    title: '세팅 가이드',
    description: '프로필 설정, 리뷰 카테고리 정리, 태그 관리 등 필수 세팅을 단계별로 안내합니다.',
    icon: <BookOpenCheck className="w-8 h-8 text-[#FF6B35]" />,
    href: '#setup'
  },
  {
    title: '효과 분석하기',
    description: '대시보드와 리포트 기능으로 캠페인 효과와 문의 전환율을 추적하세요.',
    icon: <BarChart3 className="w-8 h-8 text-[#FF6B35]" />,
    href: '#insight'
  },
  {
    title: '팀과 함께 사용하기',
    description: '권한 관리와 협업 기능으로 리뷰 검수 · 답변 작업을 팀 단위로 수행할 수 있습니다.',
    icon: <Users className="w-8 h-8 text-[#FF6B35]" />,
    href: '#team'
  }
]

const setupChecklist = [
  {
    heading: '브랜드 프로필 구성',
    items: [
      '로고, 소개 문구, 핵심 서비스 등록',
      '대표 리뷰 3개 선정 후 상단에 고정',
      '문의 버튼과 링크 연동 (카카오톡, 전화, 예약 등)'
    ]
  },
  {
    heading: '리뷰 데이터 불러오기',
    items: [
      'CSV 템플릿으로 대량 업로드',
      '스크린샷 OCR로 빠르게 입력',
      '검수 체크리스트로 품질 점검'
    ]
  },
  {
    heading: '성과 측정',
    items: [
      '교차 플랫폼 통계 비교',
      '주요 키워드/감성 분석 확인',
      '공유 링크 클릭·문의 전환율 추적'
    ]
  }
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] py-16">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <section className="bg-white rounded-3xl shadow-md p-8 md:p-12">
          <Badge className="mb-4 w-fit bg-[#FF6B35]/10 text-[#FF6B35]">사용 가이드</Badge>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                리뷰를 수집하고, 증명하고, 성장시키는 전 과정을 안내합니다
              </h1>
              <p className="text-gray-600 text-lg">
                Re:cord는 흩어진 리뷰를 한 곳에 모아 브랜드 신뢰도를 높이는 도구입니다. 아래 단계에 따라 세팅하면 10분 이내에 브랜드 포트폴리오를 구축할 수 있습니다.
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
                <Link href="mailto:support@record.kr">도입 상담 요청</Link>
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

        <section className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8" id="live-demo">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">자주 찾는 기능 한눈에</h2>
              <p className="text-gray-600">브랜드 운용 단계에 따라 필요한 기능을 바로 탐색하세요.</p>
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

        <section id="insight" className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">성과 측정과 인사이트</h2>
              <p className="text-gray-600">링크 공유 이후의 고객 반응과 문의 전환율을 계속 추적하세요.</p>
            </div>
            <Badge className="bg-[#FF6B35]/10 text-[#FF6B35]">INSIGHT</Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">대시보드</CardTitle>
              </CardHeader>
              <CardContent>
                <p>플랫폼별 리뷰 수, 평점, 문의 전환율을 한 화면에서 비교합니다.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">리포트 내보내기</CardTitle>
              </CardHeader>
              <CardContent>
                <p>PDF/CSV로 통계를 정리해 팀이나 고객에게 공유할 수 있습니다.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">고객 여정 추적</CardTitle>
              </CardHeader>
              <CardContent>
                <p>공유 링크 클릭, 페이지 체류 시간, 문의 버튼 전환까지 전 과정 데이터를 제공합니다.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="team" className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">팀 협업과 품질 관리</h2>
              <p className="text-gray-600">리뷰 검수, 답변, 태그 관리를 팀원들과 나눠 수행하세요.</p>
            </div>
            <Badge className="bg-[#1B1B1F] text-white">TEAM</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">권한과 역할</CardTitle>
              </CardHeader>
              <CardContent>
                <p>슈퍼 관리자, 운영자, 외부 파트너 등 역할을 구분해 필요한 메뉴만 노출합니다.</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">품질 체크리스트</CardTitle>
              </CardHeader>
              <CardContent>
                <p>가이드라인에 따라 인증된 리뷰만 공개하고, 의심 리뷰는 보류/삭제로 관리합니다.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
