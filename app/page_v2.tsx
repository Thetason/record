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
        if (count <= 127) {
          setReviewCount(count)
          count += 3
        } else {
          clearInterval(interval)
          setReviewCount(127)
        }
      }, 30)
    }, 500)

    // 평점 애니메이션
    const ratingTimer = setTimeout(() => {
      let rating = 0
      const interval = setInterval(() => {
        if (rating <= 4.9) {
          setAvgRating(rating)
          rating += 0.1
        } else {
          clearInterval(interval)
          setAvgRating(4.9)
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
      business: "플라워샵",
      rating: 5,
      content: "항상 신선한 꽃으로 예쁘게 만들어주셔서 감사해요. 벌써 10번째 구매인데 한 번도 실망한 적이 없어요!",
      author: "정**",
      date: "2024.08.07"
    },
    {
      platform: "카카오",
      business: "카페이음",
      rating: 5,
      content: "분위기도 좋고 커피도 맛있어요. 사장님이 친절하셔서 단골이 되었습니다.",
      author: "이**",
      date: "2024.08.06"
    },
    {
      platform: "인스타",
      business: "@nail_artist",
      rating: 5,
      content: "네일 진짜 예쁘게 해주세요! 디자인 센스가 최고예요. 다음에도 또 방문할게요~",
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

      {/* 히어로 섹션 */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6B35] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="animate-pulse">💎</span>
              <span>리뷰 하나하나가 당신의 보물입니다</span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              흩어진 리뷰를 모아<br />
              <span className="text-[#FF6B35]">신뢰를 쌓으세요</span>
            </h1>
            
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              네이버, 카카오, 인스타... 여기저기 흩어진 소중한 리뷰들<br />
              <strong>한 곳에 모아두면 강력한 신뢰의 증거가 됩니다</strong><br />
              고객이 남긴 진심, Re:cord가 소중히 간직합니다
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8 px-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#E55A2B] text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                  지금 리뷰 모으기 시작
                  <ArrowRightIcon className="ml-2 w-4 md:w-5 h-4 md:h-5" />
                </Button>
              </Link>
              <Link href="#live-demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                  통합 효과 보기
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>모든 리뷰 한 곳에</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>평생 소장 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>신뢰도 UP</span>
              </div>
            </div>
          </div>

          {/* 실시간 데모 섹션 */}
          <div className="max-w-4xl mx-auto mb-12 md:mb-16" id="live-demo">
            {showDemo && (
              <Card className="p-6 md:p-8 border-2 border-[#FF6B35] shadow-2xl animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FF6B35] text-white px-3 py-1 rounded-bl-lg text-xs md:text-sm font-bold">
                  통합 효과
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  {/* 프로필 정보 */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl">
                      김민수
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="font-bold text-lg md:text-xl">김민수</h3>
                      <p className="text-sm text-gray-600">프리랜서 디자이너</p>
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
                        <div className="text-xs md:text-sm text-gray-600">통합 리뷰</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">평균 평점</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm md:text-base">소중한 리뷰 컬렉션</h4>
                      {demoReviews.map((review, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs md:text-sm animate-slideIn" 
                             style={{ animationDelay: `${1000 + i * 200}ms` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              review.platform === "네이버" ? "bg-green-100 text-green-700" :
                              review.platform === "카카오" ? "bg-yellow-100 text-yellow-700" :
                              review.platform === "인스타" ? "bg-purple-100 text-purple-700" :
                              "bg-blue-100 text-blue-700"
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
                            <span className="text-xs text-gray-500">{review.author} 고객님</span>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs md:text-sm text-orange-800">
                        💡 <strong>"리뷰를 한 곳에 모아 보여주니 문의가 3배 늘었어요. 
                        신규 고객들이 신뢰감을 느낀다고 하네요!"</strong> - 김민수님
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* 비포/애프터 비교 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Before */}
            <Card className="p-4 md:p-6 border-2 border-gray-200 relative">
              <div className="absolute -top-3 left-4 md:left-6 bg-white px-2 md:px-3">
                <span className="text-xs md:text-sm font-bold text-gray-400">BEFORE</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-700">
                ❌ 지금 당신의 리뷰는 위험합니다
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">😱</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">네이버 45개, 인스타 82개...</p>
                    <p className="text-xs md:text-sm text-gray-500">플랫폼마다 따로 보여줘야 하는 번거로움</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">💔</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">신규 고객에게 신뢰 전달이 어려움</p>
                    <p className="text-xs md:text-sm text-gray-500">흩어진 리뷰로는 임팩트가 약함</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📱</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">계정 정지/해킹으로 접근 불가</p>
                    <p className="text-xs md:text-sm text-gray-500">소중한 리뷰가 한순간에 사라질 위험</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🔍</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">활동하던 곳이 달라지면 사라지는 리뷰</p>
                    <p className="text-xs md:text-sm text-gray-500">이직/독립 시 과거 실적 증명 불가</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-gray-600">
                  "리뷰가 여기저기 흩어져 있어서<br />
                  <span className="text-xs md:text-sm text-gray-500">전체 실력을 보여주기 어려워요</span>"
                </p>
              </div>
            </Card>

            {/* After */}
            <Card className="p-4 md:p-6 border-2 border-[#FF6B35] relative shadow-lg">
              <div className="absolute -top-3 left-4 md:left-6 bg-white px-2 md:px-3">
                <span className="text-xs md:text-sm font-bold text-[#FF6B35]">AFTER</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-[#FF6B35]">
                ✅ Re:cord로 영구 보관
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">✅</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">총 127개 리뷰 한눈에</p>
                    <p className="text-xs md:text-sm text-gray-500">압도적인 숫자가 주는 강력한 임팩트</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🔒</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">신뢰의 아카이브</p>
                    <p className="text-xs md:text-sm text-gray-500">신규 고객 확보가 훨씬 용이</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📊</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">통합 관리</p>
                    <p className="text-xs md:text-sm text-gray-500">모든 플랫폼 리뷰를 한눈에</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🌟</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">언제든 활용</p>
                    <p className="text-xs md:text-sm text-gray-500">이직/독립 시 완벽한 증명 자료</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-orange-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-[#FF6B35] font-medium">
                  "모든 리뷰가 한 곳에!<br />
                  <span className="text-xs md:text-sm">💪 10개보다 100개가 주는 신뢰의 힘</span>"
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 실제 효과 사례 */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            리뷰를 모으니 생긴 놀라운 변화
          </h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12">
            실제 사용자들의 생생한 후기
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 사례 1 */}
            <Card className="p-4 md:p-6 border-2 hover:border-[#FF6B35] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  📈
                </div>
                <div>
                  <p className="font-bold text-sm">문의 3배 증가</p>
                  <p className="text-xs text-gray-500">프리랜서 디자이너</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "리뷰 30개 → <strong>127개로 통합해서 보여주니</strong> 
                문의가 3배나 늘었어요. 고객들이 '리뷰가 정말 많네요!' 
                하면서 신뢰감을 표현합니다."
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <span className="text-[#FF6B35] font-bold">✨ 월 매출 250% 상승</span>
              </div>
            </Card>

            {/* 사례 2 */}
            <Card className="p-4 md:p-6 border-2 hover:border-[#FF6B35] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  💰
                </div>
                <div>
                  <p className="font-bold text-sm">단가 20% 인상 성공</p>
                  <p className="text-xs text-gray-500">헤어 디자이너</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "흩어진 리뷰를 <strong>모아서 보여주니</strong> 
                실력이 검증된 느낌이 들어요. 덕분에 
                단가를 올려도 고객들이 기꺼이 지불합니다."
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <span className="text-[#FF6B35] font-bold">💎 프리미엄 포지셔닝 성공</span>
              </div>
            </Card>

            {/* 사례 3 */}
            <Card className="p-4 md:p-6 border-2 hover:border-[#FF6B35] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  🏢
                </div>
                <div>
                  <p className="font-bold text-sm">대기업 프로젝트 수주</p>
                  <p className="text-xs text-gray-500">마케팅 전문가</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "<strong>통합 리뷰 포트폴리오</strong>를 
                제안서에 첨부했더니 신뢰도가 확 올라갔어요. 
                경쟁 PT에서 이긴 결정적 요인이었습니다."
              </p>
              <div className="bg-orange-50 p-2 rounded text-xs">
                <span className="text-[#FF6B35] font-bold">🎯 5천만원 프로젝트 수주</span>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              <strong>당신도 리뷰의 힘을 경험해보세요</strong>
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] text-sm md:text-base">
                지금 시작하면 평생 무료 →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            리뷰가 모이면 신뢰가 쌓입니다
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">💎</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">소중한 보관</h3>
              <p className="text-sm md:text-base text-gray-600">
                고객의 진심 담긴 리뷰<br />
                평생 안전하게 보관
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">🤝</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">신뢰 구축</h3>
              <p className="text-sm md:text-base text-gray-600">
                통합된 리뷰로<br />
                강력한 신뢰감 전달
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">📈</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">비즈니스 성장</h3>
              <p className="text-sm md:text-base text-gray-600">
                리뷰의 힘으로<br />
                매출과 기회 확대
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            리뷰 하나하나가 당신의 보물입니다
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
            지금 모으기 시작하면, 1년 후엔 강력한 신뢰의 증거가 됩니다
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