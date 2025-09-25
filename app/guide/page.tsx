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
  ArrowRight,
  Image as ImageIcon,
  ClipboardCheck,
  MousePointer2,
  UploadCloud
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
    description: '기존 플랫폼 리뷰 스크린샷을 OCR로 읽어와 단 몇 번의 클릭으로 저장합니다.',
    icon: <Wrench className="w-5 h-5" />,
    href: '#import-guide',
    cta: 'OCR 가이드'
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
      '스크린샷 OCR로 빠르게 입력',
      '필요 시 수동 입력으로 즉시 등록',
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

const visualGuides = [
  {
    title: 'OCR 이미지 업로드',
    description: '리뷰 추가 화면에서 스크린샷을 드래그하면 자동으로 텍스트를 인식합니다.',
    highlight: '이미지 영역에 드래그',
    steps: ['이미지 탭 선택', '리뷰 스크린샷 업로드', '인식 결과 확인 후 저장'],
  },
  {
    title: '추가 데이터 정리',
    description: 'OCR로 읽은 내용은 즉시 편집 가능하며, 필요한 경우 태그와 메모를 추가합니다.',
    highlight: '내용 확인 후 저장',
    steps: ['필드 자동 채움 확인', '필요 시 내용 수정', '태그 및 메모 추가'],
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

        <section id="import-guide" className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">리뷰 업로드 가이드</h2>
              <p className="text-gray-600">
                Re:cord의 핵심은 스크린샷만으로 리뷰를 기록하는 OCR 업로드입니다. 기존 플랫폼에서 캡처한 이미지를 준비하고 아래 절차를 따르면 1분 안에 리뷰를 저장할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/bulk-upload">OCR 업로드 화면 열기 →</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">스크린샷 업로드 (OCR)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <ol className="space-y-2 list-decimal list-inside">
                  <li>리뷰가 보이도록 캡처한 이미지를 준비합니다.</li>
                  <li>`대시보드 → 리뷰 추가`에서 이미지 업로드 방식을 선택합니다.</li>
                  <li>OCR로 추출된 텍스트를 검토하고 필요한 부분만 수정 후 저장합니다.</li>
                </ol>
                <p className="text-xs text-gray-500">* 텍스트가 흐릿한 경우 패스워드 보호된 PDF 대신 PNG/JPG로 업로드하는 것이 좋습니다.</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-[#F8FAFC]">
              <CardHeader className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">수동 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <ol className="space-y-2 list-decimal list-inside">
                  <li>`대시보드 → 리뷰 추가`에서 플랫폼과 고객 정보를 직접 입력합니다.</li>
                  <li>원본 링크와 내부 메모를 함께 기록하면 관리가 쉬워집니다.</li>
                  <li>저장 후 태그를 부여해 검색성과 필터링을 높입니다.</li>
                </ol>
                <p className="text-xs text-gray-500">* 새로 받은 리뷰를 즉시 등록할 때 유용한 방식입니다.</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">화면 안내</h3>
            <p className="text-sm text-gray-600">아래 이미지는 실제 Re:cord 대시보드 UI를 단순화한 예시입니다. 강조된 포인터를 따라가며 화면 위치를 확인하세요.</p>
          <div className="grid gap-6 md:grid-cols-2">
            {visualGuides.map((guide) => (
              <div key={guide.title} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
                  <div className="px-6 pt-6 pb-4 space-y-3">
                    <h4 className="text-base font-semibold text-gray-900">{guide.title}</h4>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="relative rounded-xl border border-gray-200 bg-white shadow-inner">
                      <div className="h-10 border-b border-gray-100 flex items-center gap-2 px-4 text-xs text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="ml-2 font-medium text-gray-600">리뷰 업로드</span>
                      </div>
                      <div className="grid grid-cols-4">
                        <div className="col-span-1 border-r border-gray-100 bg-gray-50 p-4 space-y-2 text-xs text-gray-500">
                          <p className="font-semibold text-gray-700">탭</p>
                          {['이미지 OCR', '직접 입력'].map((label, idx) => (
                            <div key={label} className={`px-3 py-2 rounded-md ${idx === 0 ? 'bg-white shadow-sm text-[#FF6B35] font-semibold' : ''}`}>
                              {label}
                            </div>
                          ))}
                        </div>
                        <div className="col-span-3 p-4 space-y-3 text-xs text-gray-600 relative">
                          <div className="absolute top-6 right-8 flex items-center gap-2 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-[10px] font-semibold shadow-lg animate-pulse">
                            <MousePointer2 className="w-3 h-3" /> {guide.highlight}
                          </div>
                          <div className="h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                            <UploadCloud className="w-6 h-6 mb-2" />
                            <span>여기에 파일을 드래그하세요</span>
                          </div>
                          <ul className="space-y-1">
                            {guide.steps.map((step) => (
                              <li key={step} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500">※ 기존 시스템에서 대용량 CSV로 데이터를 이전해야 하는 경우, 고객 지원(support@record.kr)으로 요청하시면 전용 마이그레이션 도구를 제공해 드립니다.</p>
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
