'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRightIcon, CheckIcon, StarFilledIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react"

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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

      {/* 히어로 섹션 - 모바일 최적화 */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6B35] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="animate-pulse">🔴</span>
              <span>이미 2,847명의 프리랜서가 사용 중</span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              당신의 단골 고객,<br />
              <span className="text-[#FF6B35]">평생 관리하세요</span>
            </h1>
            
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              미용실, 헬스장, 학원, 네일샵... <br className="md:hidden" />
              <strong>독립을 준비하는 당신</strong>을 위한<br className="hidden md:block" />
              가장 스마트한 고객 관리 솔루션
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8 px-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#E55A2B] text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                  지금 시작하기 (무료)
                  <ArrowRightIcon className="ml-2 w-4 md:w-5 h-4 md:h-5" />
                </Button>
              </Link>
              <Link href="#live-demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                  실시간 데모 보기
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>고객 관리 자동화</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>단골 고객 분석</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>리뷰 요청 문자</span>
              </div>
            </div>
          </div>

          {/* 실시간 데모 프로필 섹션 */}
          <div className="max-w-4xl mx-auto mb-12 md:mb-16" id="live-demo">
            {showDemo && (
              <Card className="p-6 md:p-8 border-2 border-[#FF6B35] shadow-2xl animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FF6B35] text-white px-3 py-1 rounded-bl-lg text-xs md:text-sm font-bold">
                  LIVE DEMO
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  {/* 프로필 정보 */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl">
                      김서연
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="font-bold text-lg md:text-xl">김서연</h3>
                      <p className="text-sm text-gray-600">필라테스 강사</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <StarFilledIcon key={i} className="w-4 h-4" />
                          ))}
                        </div>
                        <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 리뷰 통계 및 최근 리뷰 */}
                  <div className="flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
                          {reviewCount}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">총 리뷰</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">평균 평점</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm md:text-base">최근 리뷰</h4>
                      {demoReviews.map((review, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs md:text-sm animate-slideIn" 
                             style={{ animationDelay: `${1000 + i * 200}ms` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              review.platform === "네이버" ? "bg-green-100 text-green-700" :
                              review.platform === "카카오" ? "bg-yellow-100 text-yellow-700" :
                              "bg-purple-100 text-purple-700"
                            }`}>
                              {review.platform}
                            </span>
                            <span className="text-xs font-medium text-gray-600">{review.business}</span>
                            <div className="flex text-yellow-500 ml-auto">
                              {[...Array(review.rating)].map((_, j) => (
                                <StarFilledIcon key={j} className="w-3 h-3" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{review.content}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{review.author} 회원님</span>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link href="/profile/kimseoyeon" className="flex-1">
                        <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                          전체 프로필 보기
                        </Button>
                      </Link>
                      <Link href="/signup" className="flex-1">
                        <Button variant="outline" className="w-full">
                          나도 만들기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

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