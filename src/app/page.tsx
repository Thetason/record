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
        if (count <= 156) {
          setReviewCount(count)
          count += 3
        } else {
          clearInterval(interval)
        }
      }, 20)
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
      rating: 5,
      content: "디자인 작업 정말 만족스러웠습니다. 포트폴리오도 꼼꼼하게 보여주시고, 소통도 원활해서 믿고 맡길 수 있었어요.",
      author: "김**",
      date: "2024.08.07"
    },
    {
      platform: "카카오",
      rating: 5,
      content: "요가 수업 너무 좋았어요! 초보자도 쉽게 따라할 수 있게 설명해주셔서 감사했습니다.",
      author: "이**",
      date: "2024.08.06"
    },
    {
      platform: "크몽",
      rating: 5,
      content: "웹사이트 개발 의뢰했는데 기대 이상으로 잘 만들어주셨습니다. 반응형 디자인까지 완벽해요!",
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
              <span>5분 만에 리뷰 포트폴리오 완성</span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              흩어진 리뷰를 <span className="text-[#FF6B35]">한 곳에</span><br />
              나만의 신뢰 자산으로
            </h1>
            
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              네이버, 카카오, 구글, 인스타... 여기저기 흩어진 리뷰들을<br className="hidden md:block" />
              <strong>3초 만에 업로드</strong>하고 <strong>평생 관리</strong>하세요
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
                <span>신용카드 불필요</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>5분 만에 완성</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-green-500 w-4 h-4" />
                <span>평생 무료</span>
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
                    <div className="grid grid-cols-3 gap-4 mb-6">
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
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
                          5
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">플랫폼</div>
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
                            <div className="flex text-yellow-500">
                              {[...Array(review.rating)].map((_, j) => (
                                <StarFilledIcon key={j} className="w-3 h-3" />
                              ))}
                            </div>
                            <span className="text-gray-500 ml-auto">{review.date}</span>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{review.content}</p>
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
                ❌ 지금 당신의 리뷰는...
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📱</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">네이버 리뷰 35개</p>
                    <p className="text-xs md:text-sm text-gray-500">링크 복사... 붙여넣기... 반복</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">💬</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">카톡 리뷰 50개</p>
                    <p className="text-xs md:text-sm text-gray-500">스크린샷... 저장... 찾기 어려움</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">📷</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">인스타 DM 리뷰 20개</p>
                    <p className="text-xs md:text-sm text-gray-500">휘발성... 나중에 못 찾음</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-gray-600">
                  "어... 제 리뷰요? 잠시만요..."<br />
                  <span className="text-xs md:text-sm">😰 신뢰도 하락</span>
                </p>
              </div>
            </Card>

            {/* After */}
            <Card className="p-4 md:p-6 border-2 border-[#FF6B35] relative shadow-lg">
              <div className="absolute -top-3 left-4 md:left-6 bg-white px-2 md:px-3">
                <span className="text-xs md:text-sm font-bold text-[#FF6B35]">AFTER</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-[#FF6B35]">
                ✅ Re:cord와 함께라면!
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🔗</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">단 하나의 링크</p>
                    <p className="text-xs md:text-sm text-gray-500">re-cord.kr/당신이름</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">✨</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">모든 리뷰 한눈에</p>
                    <p className="text-xs md:text-sm text-gray-500">105개 리뷰 • 평균 4.9점</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🚀</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">3초 만에 업로드</p>
                    <p className="text-xs md:text-sm text-gray-500">OCR로 자동 텍스트 추출</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-orange-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-[#FF6B35] font-medium">
                  "여기 제 리뷰 포트폴리오입니다"<br />
                  <span className="text-xs md:text-sm">💪 즉시 신뢰도 상승</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 실제 리뷰 예시 - 모바일 최적화 */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            실제 리코드 사용자들의 리뷰
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 리뷰 카드 1 */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  네이버
                </span>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarFilledIcon key={i} className="w-3 md:w-4 h-3 md:h-4" />
                  ))}
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-700 mb-3">
                "디자인 작업 정말 만족스러웠습니다. 소통도 원활하고 수정사항도 빠르게 반영해주셨어요. 
                다음에도 꼭 다시 의뢰하고 싶습니다!"
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>김** 고객님</span>
                <span>2024.08.07</span>
              </div>
            </Card>

            {/* 리뷰 카드 2 */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                  카카오
                </span>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarFilledIcon key={i} className="w-3 md:w-4 h-3 md:h-4" />
                  ))}
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-700 mb-3">
                "요가 수업 너무 좋았어요! 선생님이 정말 친절하시고 초보자도 따라하기 쉽게 
                설명해주셔서 감사했습니다."
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>이** 고객님</span>
                <span>2024.08.06</span>
              </div>
            </Card>

            {/* 리뷰 카드 3 */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  크몽
                </span>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarFilledIcon key={i} className="w-3 md:w-4 h-3 md:h-4" />
                  ))}
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-700 mb-3">
                "웹사이트 개발 의뢰했는데 기대 이상으로 잘 만들어주셨습니다. 
                특히 반응형 디자인이 완벽해요!"
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>박** 고객님</span>
                <span>2024.08.05</span>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              이 모든 리뷰를 <strong>한 곳에서</strong> 관리하세요
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] text-sm md:text-base">
                지금 시작하기 →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 사용 방법 - 모바일 최적화 */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            단 3단계로 완성하는 리뷰 포트폴리오
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-[#FF6B35]">1</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">가입하기</h3>
              <p className="text-sm md:text-base text-gray-600">
                이메일만으로 5초 가입<br />
                신용카드 불필요
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-[#FF6B35]">2</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">리뷰 업로드</h3>
              <p className="text-sm md:text-base text-gray-600">
                스크린샷 드래그 앤 드롭<br />
                OCR로 자동 텍스트 추출
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-[#FF6B35]">3</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-2">공유하기</h3>
              <p className="text-sm md:text-base text-gray-600">
                re-cord.kr/당신이름<br />
                링크 하나로 끝
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - 모바일 최적화 */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
            지금 시작하면 평생 무료
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
            베타 기간 특별 혜택 • 선착순 1,000명
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