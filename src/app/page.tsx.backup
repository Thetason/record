'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRightIcon, CheckIcon, StarFilledIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"
import Image from "next/image"

// 해시태그 데이터
const hashtags = [
  "#네일샵_단골관리", "#미용실_독립준비", "#필라테스_회원관리",
  "#PT트레이너_창업", "#요가강사_프리랜서", "#속눈썹_고객관리",
  "#왁싱샵_리뷰관리", "#마사지샵_단골", "#메이크업_포트폴리오",
  "#헤어디자이너_독립", "#피부관리_고객", "#네일아트_리뷰",
  "#반영구_시술리뷰", "#타투이스트_포트폴리오", "#퍼스널컬러_진단",
  "#스포츠마사지_회원", "#필라테스_독립", "#크로스핏_회원관리"
]

export default function HomePage() {
  const [reviewCount, setReviewCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    // 리뷰 카운트 애니메이션
    const timer = setTimeout(() => {
      setShowDemo(true)
      let count = 0
      const interval = setInterval(() => {
        if (count <= 69) {
          setReviewCount(count)
          count += 2
        } else {
          clearInterval(interval)
          setReviewCount(69)
        }
      }, 30)
    }, 500)

    // 평점 애니메이션
    const ratingTimer = setTimeout(() => {
      let rating = 0
      const interval = setInterval(() => {
        if (rating <= 4.8) {
          setAvgRating(rating)
          rating += 0.1
        } else {
          clearInterval(interval)
          setAvgRating(4.8)
        }
      }, 40)
    }, 800)

    return () => {
      clearTimeout(timer)
      clearTimeout(ratingTimer)
    }
  }, [])

  const demoReviews = [
    {
      platform: "네이버",
      business: "비너스필라테스",
      rating: 5,
      content: "김서연 강사님 최고예요! 자세 하나하나 꼼꼼하게 봐주시고, 제 몸 상태에 맞춰서 운동 강도도 조절해주셔서 너무 좋았어요.",
      author: "정**",
      date: "2024.08.07"
    },
    {
      platform: "카카오",
      business: "밸런스드필라테스",
      rating: 5,
      content: "서연쌤 수업은 진짜 강추! 기구 필라테스 처음인데도 무리 없이 따라갈 수 있게 지도해주셔서 감사해요.",
      author: "이**",
      date: "2024.08.06"
    },
    {
      platform: "네이버",
      business: "필라오라인",
      rating: 5,
      content: "6개월째 김서연 강사님께 PT받고 있는데 체형이 정말 많이 개선됐어요. 전문적이면서도 친절하신 최고의 강사님!",
      author: "박**",
      date: "2024.08.05"
    }
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                  무료 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. 히어로 섹션 - 우리 서비스는 이런거예요 */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-light mb-6 leading-tight">
              리뷰 관리는 그만,<br />
              <span className="font-medium text-[#FF6B35]">고객 관계에만 집중하세요.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              중요한 고객과의 관계도 <span className="font-medium">Re:cord</span>만 있으면 걱정 끝
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8 py-6 text-lg">
                  무료로 시작하기
                  <ArrowRightIcon className="ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg" onClick={() => document.getElementById('app-preview')?.scrollIntoView({ behavior: 'smooth' })}>
                3초 미리보기
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>3초 만에 리뷰 수집</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span>실시간 고객 분석</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span>자동 단골 관리</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 해시태그 플로우 - 다양한 사용 사례 */}
      <section className="py-16 overflow-hidden bg-white">
        <div className="container mx-auto px-4 max-w-6xl mb-8">
          <div className="text-center">
            <span className="text-sm font-medium text-[#FF6B35] mb-2 block">WHO WE SERVE</span>
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              이미 <span className="font-medium">3,782명</span>이 Re:cord와 함께하고 있어요
            </h2>
            <p className="text-gray-600">독립을 준비하는 모든 프리랜서를 위한 필수 도구</p>
          </div>
        </div>
        
        {/* 해시태그 무한 스크롤 - 첫 번째 줄 */}
        <div className="relative mb-4">
          <div className="flex gap-3 animate-scroll-left">
            {[...hashtags, ...hashtags].map((tag, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-5 py-3 bg-gray-50 rounded-full text-gray-700 hover:bg-[#FF6B35] hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        
        {/* 해시태그 무한 스크롤 - 두 번째 줄 (반대 방향) */}
        <div className="relative mb-4">
          <div className="flex gap-3 animate-scroll-right">
            {[...hashtags.slice(9), ...hashtags.slice(0, 9), ...hashtags.slice(9), ...hashtags.slice(0, 9)].map((tag, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-5 py-3 bg-gray-50 rounded-full text-gray-700 hover:bg-[#FF6B35] hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        
        {/* 해시태그 무한 스크롤 - 세 번째 줄 */}
        <div className="relative">
          <div className="flex gap-3 animate-scroll-left-slow">
            {[...hashtags.slice(6), ...hashtags.slice(0, 6), ...hashtags.slice(6), ...hashtags.slice(0, 6)].map((tag, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-5 py-3 bg-gray-50 rounded-full text-gray-700 hover:bg-[#FF6B35] hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 앱 UI 미리보기 - 실제 사용 화면 */}
      <section id="app-preview" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-[#FF6B35] mb-2 block">실제 앱 화면</span>
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              스크린샷 하나로, <span className="font-medium">완벽한 고객 관리</span>
            </h2>
            <p className="text-gray-600">네이버, 카카오, 인스타... 모든 리뷰를 한 곳에서</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* 스텝 1: 스크린샷 업로드 */}
            <div className="relative group">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold z-10">
                1
              </div>
              <Card className="h-full p-6 border-2 hover:border-[#FF6B35] transition-all cursor-pointer group-hover:shadow-xl">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">리뷰 스크린샷 업로드</h3>
                  <p className="text-sm text-gray-600">드래그 앤 드롭으로 간편하게</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 group-hover:bg-orange-50 transition-colors">
                  <span className="text-4xl">📱</span>
                  <p className="text-xs text-gray-500 mt-2">스크린샷을 여기 끌어다 놓으세요</p>
                </div>
              </Card>
            </div>
            {/* 스텝 2: AI 자동 분석 */}
            <div className="relative group">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold z-10">
                2
              </div>
              <Card className="h-full p-6 border-2 hover:border-[#FF6B35] transition-all cursor-pointer group-hover:shadow-xl">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">AI가 자동 분석</h3>
                  <p className="text-sm text-gray-600">플랫폼, 평점, 내용 자동 추출</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-green-50 p-3 rounded-lg animate-pulse">
                    <p className="text-xs font-medium text-green-700">✓ 네이버 리뷰 감지</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <p className="text-xs font-medium text-yellow-700">✓ 평점: 5점</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <p className="text-xs font-medium text-blue-700">✓ 고객명: 김**</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 스텝 3: 고객 관리 완료 */}
            <div className="relative group">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-bold z-10">
                3
              </div>
              <Card className="h-full p-6 border-2 hover:border-[#FF6B35] transition-all cursor-pointer group-hover:shadow-xl">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">프로필 자동 생성</h3>
                  <p className="text-sm text-gray-600">공유 가능한 리뷰 포트폴리오</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-bold">
                      김
                    </div>
                    <div>
                      <p className="font-medium text-sm">김서연 강사님</p>
                      <p className="text-xs text-gray-600">리뷰 {reviewCount}개 · ⭐ {avgRating.toFixed(1)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 italic">
                    "최고의 강사님! 항상 친절하고..."
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* 실제 데모 화면 */}
          <div className="max-w-4xl mx-auto">
            {showDemo && (
              <Card className="p-8 border-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FF6B35] text-white px-3 py-1 rounded-bl-lg text-sm font-bold">
                  LIVE DEMO
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 왼쪽: 프로필 */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        김
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">김서연</h3>
                        <p className="text-gray-600">필라테스 강사</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <StarFilledIcon key={i} className="w-4 h-4" />
                            ))}
                          </div>
                          <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FF6B35]">{reviewCount}</div>
                        <div className="text-xs text-gray-600">총 리뷰</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FF6B35]">{avgRating.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">평균 평점</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FF6B35]">98%</div>
                        <div className="text-xs text-gray-600">추천율</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">네이버 33개</span>
                      <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs">카카오 21개</span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">인스타 15개</span>
                    </div>
                  </div>
                  
                  {/* 오른쪽: 최근 리뷰 */}
                  <div>
                    <h4 className="font-bold mb-3">최근 리뷰</h4>
                    <div className="space-y-3">
                      {demoReviews.slice(0, 2).map((review, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg animate-slideIn" 
                             style={{ animationDelay: `${1000 + i * 200}ms` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              review.platform === "네이버" ? "bg-green-100 text-green-700" :
                              review.platform === "카카오" ? "bg-yellow-100 text-yellow-700" :
                              "bg-purple-100 text-purple-700"
                            }`}>
                              {review.platform}
                            </span>
                            <div className="flex text-yellow-500 ml-auto">
                              {[...Array(5)].map((_, j) => (
                                <StarFilledIcon key={j} className="w-3 h-3" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{review.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{review.author} · {review.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Link href="/signup" className="flex-1">
                    <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                      나도 만들기
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1">
                    더 알아보기
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS - 상세 기능 가이드 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-[#FF6B35] mb-2 block">HOW IT WORKS</span>
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              단 3분이면 <span className="font-medium">시작</span>할 수 있어요
            </h2>
            <p className="text-gray-600">복잡한 설정 없이, 바로 시작하세요</p>
          </div>

          <div className="space-y-20">
            {/* Step 1: 회원가입 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <Card className="p-8 border-2 shadow-lg">
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg font-bold shadow">
                        1
                      </div>
                      <h3 className="text-xl font-bold">간편 회원가입</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm">이메일로 3초 가입</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm">네이버/카카오 간편 로그인</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm">신용카드 불필요</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-[#FF6B35] font-bold text-sm">STEP 1</span>
                <h3 className="text-2xl font-bold mb-3">30초면 충분해요</h3>
                <p className="text-gray-600 mb-4">
                  복잡한 절차 없이 이메일만으로 바로 시작하세요. 
                  네이버나 카카오 계정이 있다면 더욱 간편하게 가입할 수 있어요.
                </p>
                <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                  지금 시작하기 →
                </Button>
              </div>
            </div>

            {/* Step 2: 리뷰 업로드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[#FF6B35] font-bold text-sm">STEP 2</span>
                <h3 className="text-2xl font-bold mb-3">리뷰 스크린샷 업로드</h3>
                <p className="text-gray-600 mb-4">
                  네이버, 카카오, 인스타그램 등 어떤 플랫폼의 리뷰든 상관없어요.
                  스크린샷만 찍어서 올려주시면 AI가 자동으로 분석해드립니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">네이버</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">카카오</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">인스타그램</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">구글</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">+15개 플랫폼</span>
                </div>
              </div>
              <div>
                <Card className="p-8 border-2 shadow-lg">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50 hover:bg-orange-50 transition-colors">
                    <div className="text-5xl mb-3">📸</div>
                    <p className="font-medium mb-2">클릭 또는 드래그</p>
                    <p className="text-sm text-gray-500">JPG, PNG, GIF (최대 10MB)</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 3: 프로필 완성 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <Card className="p-8 border-2 shadow-lg">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl">
                      YOU
                    </div>
                    <h4 className="font-bold text-lg mb-2">나만의 리뷰 포트폴리오</h4>
                    <p className="text-sm text-gray-600 mb-4">record.kr/yourname</p>
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FF6B35]">152</div>
                        <div className="text-xs text-gray-500">리뷰</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FF6B35]">4.9</div>
                        <div className="text-xs text-gray-500">평점</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FF6B35]">98%</div>
                        <div className="text-xs text-gray-500">추천율</div>
                      </div>
                    </div>
                    <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                      공유하기
                    </Button>
                  </div>
                </Card>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-[#FF6B35] font-bold text-sm">STEP 3</span>
                <h3 className="text-2xl font-bold mb-3">프로필 자동 생성</h3>
                <p className="text-gray-600 mb-4">
                  업로드한 리뷰들이 자동으로 정리되어 전문적인 프로필이 만들어져요.
                  링크 하나로 고객에게 신뢰감을 전달하세요.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm">커스텀 URL 제공</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm">SNS 공유 최적화</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm">QR코드 자동 생성</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

          {/* 비포/애프터 비교 - 모바일 최적화 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Before */}
            <Card className="p-4 md:p-6 border-2 border-gray-200 relative">
              <div className="absolute -top-3 left-4 md:left-6 bg-white px-2 md:px-3">
                <span className="text-xs md:text-sm font-bold text-gray-400">BEFORE</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-700">
                ❌ 지금 당신의 고객 관리는...
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">😰</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">단골인지 신규인지 모름</p>
                    <p className="text-xs md:text-sm text-gray-500">고객 히스토리 파악 불가</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📝</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">수기로 관리하는 고객 정보</p>
                    <p className="text-xs md:text-sm text-gray-500">독립할 때 데이터 소실 위험</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">💔</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">리뷰 요청이 어색함</p>
                    <p className="text-xs md:text-sm text-gray-500">체계적인 리뷰 수집 시스템 부재</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-gray-600">
                  "이 고객님이 몇 번 오셨더라...?"<br />
                  <span className="text-xs md:text-sm">😰 전문성 의심받음</span>
                </p>
              </div>
            </Card>

            {/* After */}
            <Card className="p-4 md:p-6 border-2 border-[#FF6B35] relative shadow-lg">
              <div className="absolute -top-3 left-4 md:left-6 bg-white px-2 md:px-3">
                <span className="text-xs md:text-sm font-bold text-[#FF6B35]">AFTER</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-[#FF6B35]">
                ✅ Re:cord로 독립 준비!
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">👥</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">단골 고객 자동 분류</p>
                    <p className="text-xs md:text-sm text-gray-500">2회 이상 방문 시 VIP 표시</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📊</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">고객별 히스토리 관리</p>
                    <p className="text-xs md:text-sm text-gray-500">언제, 어떤 서비스 받았는지 한눈에</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">💌</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">리뷰 요청 자동화</p>
                    <p className="text-xs md:text-sm text-gray-500">서비스 후 자동 문자 발송</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-orange-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-[#FF6B35] font-medium">
                  "김00님, 벌써 10번째 방문이시네요!"<br />
                  <span className="text-xs md:text-sm">💪 프로페셔널한 고객 관리</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 실제 사용 사례 - 모바일 최적화 */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            이미 성공한 프리랜서들의 선택
          </h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12">
            독립을 준비하는 프로페셔널들이 리코드를 선택한 이유
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 사례 1 - 헤어디자이너 */}
            <Card className="p-4 md:p-6 border-2 hover:border-[#FF6B35] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  ✂️
                </div>
                <div>
                  <p className="font-bold text-sm">박소연 헤어디자이너</p>
                  <p className="text-xs text-gray-500">프리랜서 3년차</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "리코드 덕분에 <strong>단골 고객이 87%</strong>로 늘었어요. 
                고객님들이 몇 번 오셨는지 바로 알 수 있어서 
                맞춤 서비스 제공이 가능해졌습니다."
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <span className="text-[#FF6B35] font-bold">📈 매출 42% 상승</span>
              </div>
            </Card>

            {/* 사례 2 - PT 트레이너 */}
            <Card className="p-4 md:p-6 border-2 hover:border-[#FF6B35] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  💪
                </div>
                <div>
                  <p className="font-bold text-sm">김준호 PT 트레이너</p>
                  <p className="text-xs text-gray-500">독립 준비 중</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "내년 개인 짐 오픈 준비 중인데, 
                <strong>3년간 관리한 회원 238명</strong>의 리뷰를 
                모두 보여줄 수 있어서 투자자 미팅에 큰 도움이 됐어요."
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <span className="text-[#FF6B35] font-bold">🏆 투자 유치 성공</span>
              </div>
            </Card>

            {/* 사례 3 - 네일 아티스트 */}
            <Card className="p-4 md:p-6 border-2 hover:border-[#FF6B35] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  💅
                </div>
                <div>
                  <p className="font-bold text-sm">이하나 네일아티스트</p>
                  <p className="text-xs text-gray-500">프리랜서 5년차</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "<strong>리뷰 요청 문자 자동화</strong>로 시간이 엄청 절약됐어요. 
                예전에는 일일이 부탁드렸는데, 이제 자동으로 
                리뷰가 쌓여서 신규 고객 유치가 쉽습니다."
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <span className="text-[#FF6B35] font-bold">✨ 주 5명 신규 고객</span>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              당신도 <strong>체계적인 고객 관리</strong>로 독립을 준비하세요
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] text-sm md:text-base">
                무료로 시작하기 →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 사용 방법 - 모바일 최적화 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            독립을 위한 필수 기능
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">📈</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">리뷰 분석</h3>
              <p className="text-sm md:text-base text-gray-600">
                자주 언급되는 강점 파악<br />
                가장 인기 있는 서비스 TOP 3
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">👥</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">고객 관리</h3>
              <p className="text-sm md:text-base text-gray-600">
                단골 고객 자동 분류<br />
                고객별 히스토리 추적
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">💌</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">리뷰 요청</h3>
              <p className="text-sm md:text-base text-gray-600">
                서비스 후 자동 문자 발송<br />
                간편 리뷰 작성 링크
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - 모바일 최적화 */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            독립을 꿈꾸는 당신을 응원합니다
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
            지금 시작하면 모든 기능 평생 무료
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-6 md:py-8 border-t">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-gray-600">
          <p>© 2024 Re:cord. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}