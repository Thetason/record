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
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="animate-pulse">⚠️</span>
              <span>매년 수천 개의 리뷰가 플랫폼 정책으로 삭제됩니다</span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              고객 리뷰,<br />
              <span className="text-[#FF6B35]">사라지기 전에 영구 보관하세요</span>
            </h1>
            
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              네이버, 카카오, 인스타... 여기저기 흩어진 소중한 리뷰들<br />
              <strong>플랫폼이 사라져도, 정책이 바뀌어도</strong><br />
              당신의 리뷰는 Re:cord에 영원히 남습니다
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8 px-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#E55A2B] text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                  지금 바로 리뷰 지키기
                  <ArrowRightIcon className="ml-2 w-4 md:w-5 h-4 md:h-5" />
                </Button>
              </Link>
              <Link href="#live-demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                  실제 사례 보기
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>모든 리뷰 백업</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>평생 소유권 보장</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>언제든 다운로드</span>
              </div>
            </div>
          </div>

          {/* 실시간 데모 섹션 */}
          <div className="max-w-4xl mx-auto mb-12 md:mb-16" id="live-demo">
            {showDemo && (
              <Card className="p-6 md:p-8 border-2 border-[#FF6B35] shadow-2xl animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FF6B35] text-white px-3 py-1 rounded-bl-lg text-xs md:text-sm font-bold">
                  실제 사례
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
                        <div className="text-xs md:text-sm text-gray-600">보관된 리뷰</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">평균 평점</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm md:text-base">영구 보관된 리뷰</h4>
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
                        💡 <strong>"네이버 플레이스 정책 변경으로 리뷰 50개가 삭제될 뻔했는데, 
                        Re:cord에 미리 백업해둬서 다행이었어요"</strong> - 김민수님
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
                    <p className="text-sm md:text-base font-medium">플랫폼 정책 변경으로 리뷰 삭제</p>
                    <p className="text-xs md:text-sm text-gray-500">언제든 사라질 수 있는 불안정한 자산</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">💔</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">업체 폐업/이전 시 리뷰 소실</p>
                    <p className="text-xs md:text-sm text-gray-500">이직하면 모든 리뷰 히스토리 증발</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📱</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">계정 정지/해킹으로 접근 불가</p>
                    <p className="text-xs md:text-sm text-gray-500">복구 불가능한 소중한 고객 피드백</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🔍</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">여러 플랫폼에 흩어져 관리 불가</p>
                    <p className="text-xs md:text-sm text-gray-500">전체 리뷰 현황 파악 어려움</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-gray-600">
                  "3년간 쌓은 리뷰 127개가<br />
                  <span className="text-xs md:text-sm text-red-600 font-bold">하루아침에 사라졌습니다</span>"
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
                    <p className="text-sm md:text-base font-medium">모든 리뷰 백업</p>
                    <p className="text-xs md:text-sm text-gray-500">한 곳에 안전하게 영구 보관</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🔒</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">평생 소유권</p>
                    <p className="text-xs md:text-sm text-gray-500">당신만의 리뷰 자산으로 관리</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📊</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">통합 관리</p>
                    <p className="text-xs md:text-sm text-gray-500">모든 플랫폼 리뷰 한눈에</p>
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
                  "당신의 리뷰는 소중한 자산입니다"<br />
                  <span className="text-xs md:text-sm">💪 평생 안전하게 보관하세요</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 실제 피해 사례 */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            실제로 일어난 리뷰 소실 사례
          </h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12">
            이런 일이 당신에게도 일어날 수 있습니다
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 사례 1 */}
            <Card className="p-4 md:p-6 border-2 hover:border-red-500 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  ⚠️
                </div>
                <div>
                  <p className="font-bold text-sm">네이버 플레이스 정책 변경</p>
                  <p className="text-xs text-gray-500">2024년 실제 사례</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "업체 정보 수정하면서 <strong>리뷰 127개가 전부 삭제</strong>됐어요. 
                3년간 받은 고객 피드백이 하루아침에 사라졌습니다. 
                복구도 불가능하대요."
              </p>
              <div className="bg-red-50 p-2 rounded text-xs">
                <span className="text-red-600 font-bold">💔 3년 노력이 한순간에 소멸</span>
              </div>
            </Card>

            {/* 사례 2 */}
            <Card className="p-4 md:p-6 border-2 hover:border-red-500 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  🔒
                </div>
                <div>
                  <p className="font-bold text-sm">인스타그램 계정 해킹</p>
                  <p className="text-xs text-gray-500">2024년 실제 사례</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "새벽에 해킹당해서 <strong>팔로워 8천명, 리뷰 500개</strong> 
                다 날아갔어요. 계정 복구는 됐는데 게시물은 
                전부 삭제된 상태였습니다."
              </p>
              <div className="bg-red-50 p-2 rounded text-xs">
                <span className="text-red-600 font-bold">😱 5년 쌓은 신뢰도 증발</span>
              </div>
            </Card>

            {/* 사례 3 */}
            <Card className="p-4 md:p-6 border-2 hover:border-red-500 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  🏢
                </div>
                <div>
                  <p className="font-bold text-sm">회사 퇴사 후 접근 불가</p>
                  <p className="text-xs text-gray-500">2024년 실제 사례</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                "회사 계정으로 받은 <strong>리뷰 200개</strong>를 
                퇴사하면서 가져올 수 없었어요. 독립하는데 
                증명할 자료가 하나도 없어졌습니다."
              </p>
              <div className="bg-red-50 p-2 rounded text-xs">
                <span className="text-red-600 font-bold">📉 커리어 증명 자료 소실</span>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              <strong>지금 이 순간에도 당신의 리뷰가 사라지고 있습니다</strong>
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] text-sm md:text-base">
                오늘 백업하지 않으면, 내일은 없을 수도 있습니다 →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Re:cord가 지켜드립니다
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">🛡️</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">영구 백업</h3>
              <p className="text-sm md:text-base text-gray-600">
                모든 플랫폼 리뷰를<br />
                안전하게 영구 보관
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">통합 관리</h3>
              <p className="text-sm md:text-base text-gray-600">
                흩어진 리뷰를<br />
                한 곳에서 관리
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">💼</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">커리어 자산</h3>
              <p className="text-sm md:text-base text-gray-600">
                이직/독립 시<br />
                완벽한 포트폴리오
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            당신의 리뷰는 소중한 자산입니다
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
            오늘 백업하지 않으면, 내일은 없을 수도 있습니다
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
              지금 바로 리뷰 지키기
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