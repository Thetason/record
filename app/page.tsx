'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRightIcon, CheckIcon, StarFilledIcon } from "@radix-ui/react-icons"
import { Shield, Camera, Menu, X, Users, Star, TrendingUp, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"

// 타겟 오디언스 데이터
const targetAudiences = [
  "보컬트레이너",
  "필라테스 강사", 
  "네일아티스트",
  "헤어디자이너",
  "PT 트레이너",
  "요가 강사",
  "메이크업 아티스트",
  "속눈썹 전문가",
  "피부관리사",
  "마사지 테라피스트"
]

// 해시태그 데이터
const hashtags = [
  "#노래교실_회원관리", "#필라테스_전문강사", "#보컬코치_프리랜서",
  "#뷰티컬_입시지도", "#음치교정_전문", "#발성교정_전문가",
  "#네일샵_단골관리", "#미용실_독립준비", "#PT트레이너_창업",
  "#요가강사_프리랜서", "#속눈썹_고객관리", "#왁싱샵_리뷰관리",
  "#마사지샵_단골", "#메이크업_포트폴리오", "#헤어디자이너_독립"
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [reviewCount, setReviewCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // 페이지 로드 완료
    setIsLoading(false)
    
    // 숫자 애니메이션
    const timer = setTimeout(() => {
      // 리뷰 카운트
      let count = 0
      const reviewInterval = setInterval(() => {
        if (count <= 12847) {
          setReviewCount(count)
          count += 321
        } else {
          clearInterval(reviewInterval)
          setReviewCount(12847)
        }
      }, 30)
      
      // 사용자 카운트
      let users = 0
      const userInterval = setInterval(() => {
        if (users <= 3782) {
          setUserCount(users)
          users += 94
        } else {
          clearInterval(userInterval)
          setUserCount(3782)
        }
      }, 30)
      
      // 평점
      let rating = 4.0
      const ratingInterval = setInterval(() => {
        if (rating <= 4.9) {
          setAvgRating(rating)
          rating += 0.1
        } else {
          clearInterval(ratingInterval)
          setAvgRating(4.9)
        }
      }, 100)
    }, 300)
    
    // 타겟 오디언스 순환 (읽을 수 있게 2초로)
    const targetTimer = setInterval(() => {
      setCurrentTargetIndex((prev) => (prev + 1) % targetAudiences.length)
    }, 2000)
    
    return () => {
      clearTimeout(timer)
      clearInterval(targetTimer)
    }
  }, [])
  
  return (
    <main className="min-h-screen bg-white">
      {/* 네비게이션 - 모바일 개선 */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl md:text-2xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">✓</span>
            </Link>
            
            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-6">
              <button className="text-gray-600 hover:text-[#FF6B35] transition-colors">
                기능
              </button>
              <button className="text-gray-600 hover:text-[#FF6B35] transition-colors">
                요금
              </button>
              <button className="text-gray-600 hover:text-[#FF6B35] transition-colors">
                고객사례
              </button>
            </div>
            
            {/* 모바일 메뉴 버튼 */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* 데스크톱 버튼 */}
            <div className="hidden md:flex gap-3">
              {status === "loading" ? (
                <Skeleton className="w-24 h-9" />
              ) : session ? (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B] shadow-lg">
                    대시보드
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">로그인</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B] shadow-lg">
                      무료 시작하기
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <button className="block w-full text-left py-2 text-gray-600">기능</button>
              <button className="block w-full text-left py-2 text-gray-600">요금</button>
              <button className="block w-full text-left py-2 text-gray-600">고객사례</button>
              <div className="pt-3 border-t space-y-2">
                {session ? (
                  <Link href="/dashboard" className="block">
                    <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                      대시보드
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">로그인</Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                        무료 시작하기
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* 신뢰도 배너 - 새로 추가 */}
      <div className="fixed top-16 w-full bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white py-2 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8 text-xs md:text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="font-bold">{userCount.toLocaleString()}명</span>
              <span className="hidden md:inline">이용 중</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span className="font-bold">{avgRating.toFixed(1)}</span>
              <span className="hidden md:inline">평점</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">67%</span>
              <span className="hidden md:inline">문의율 상승</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 히어로 섹션 - 개선 */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="text-center space-y-4">
              <Skeleton className="w-3/4 h-12 mx-auto" />
              <Skeleton className="w-1/2 h-8 mx-auto" />
              <Skeleton className="w-2/3 h-6 mx-auto" />
            </div>
          ) : (
            <div className="text-center">
              {/* 긴급성 메시지 */}
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Clock className="w-4 h-4 animate-pulse" />
                오늘도 평균 12개의 리뷰가 사라지고 있습니다
              </div>
              
              {/* 메인 타이틀 - 모바일 최적화 */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="block mb-2">이직하거나 독립할 때</span>
                <div className="inline-block bg-[#FF6B35] text-white px-4 py-2 rounded-lg transition-all duration-500">
                  {targetAudiences[currentTargetIndex]}
                </div>
                <span className="block mt-2 text-xl md:text-3xl">님의 모든 리뷰가 사라진다면?</span>
              </h1>
              
              {/* 서브 타이틀 */}
              <p className="text-base md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                네이버, 카카오, 인스타... 흩어진 <strong>{reviewCount.toLocaleString()}개</strong>의 리뷰를
                <br />한 곳에 모아 <strong className="text-[#FF6B35]">평생 소장</strong>하세요
              </p>
              
              {/* 단일 CTA - 더 크고 명확하게 */}
              <div className="mb-8">
                <Link href="/signup">
                  <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8 md:px-12 py-6 md:py-8 text-base md:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
                    지금 무료로 시작하기
                    <ArrowRightIcon className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-3">
                  ✓ 카드 등록 없음 · ✓ 30초 회원가입 · ✓ 평생 무료
                </p>
              </div>
              
              {/* 소셜 프루프 */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <span className="text-gray-600">
                  <strong>{userCount.toLocaleString()}명</strong>의 프리랜서가 사용 중
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* 문제 제시 섹션 - 새로 추가 */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            이런 고민 있으신가요?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                emoji: "😰",
                title: "플랫폼 정책 변경",
                desc: "네이버가 리뷰 정책을 바꾸면 모든 리뷰가 사라질 수 있어요"
              },
              {
                emoji: "💔",
                title: "이직/독립 시 증명 불가",
                desc: "회사를 옮기면 기존 고객 리뷰를 보여줄 수 없어요"
              },
              {
                emoji: "😵",
                title: "계정 정지 위험",
                desc: "해킹이나 정지로 한순간에 모든 리뷰가 날아가요"
              },
              {
                emoji: "📉",
                title: "신뢰도 증명 어려움",
                desc: "흩어진 리뷰로는 실력을 제대로 보여줄 수 없어요"
              }
            ].map((item, i) => (
              <Card key={i} className="p-4 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-lg font-medium text-[#FF6B35]">
              ⚡ Re:cord가 모든 문제를 해결합니다
            </p>
          </div>
        </div>
      </section>
      
      {/* 솔루션 제시 - 간결하게 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Re:cord로 <span className="text-[#FF6B35]">3분</span> 만에 해결
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "스크린샷 업로드",
                desc: "리뷰 캡처 후 드래그",
                time: "30초"
              },
              {
                step: "2", 
                title: "AI 자동 분석",
                desc: "플랫폼, 내용 자동 추출",
                time: "즉시"
              },
              {
                step: "3",
                title: "프로필 완성",
                desc: "공유 가능한 링크 생성",
                time: "1분"
              }
            ].map((item, i) => (
              <Card key={i} className="relative p-6 text-center hover:shadow-xl transition-all">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.time}
                </div>
                <div className="w-12 h-12 bg-[#FF6B35] text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* 실시간 데모 - 기존 코드 활용 */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <span className="text-sm font-medium text-[#FF6B35] mb-2 block">LIVE DEMO</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              실제 사용 화면
            </h2>
          </div>
          
          <Card className="p-6 md:p-8 border-2 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 프로필 미리보기 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    김
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">김서연 강사님</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarFilledIcon key={i} className="w-4 h-4 text-yellow-500" />
                      ))}
                      <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                {/* 통계 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-xl font-bold text-[#FF6B35]">127</div>
                    <div className="text-xs">리뷰</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-xl font-bold text-[#FF6B35]">4.9</div>
                    <div className="text-xs">평점</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-xl font-bold text-[#FF6B35]">98%</div>
                    <div className="text-xs">추천율</div>
                  </div>
                </div>
                
                {/* 플랫폼별 분포 */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">네이버 45</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">카카오 38</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">인스타 44</span>
                </div>
              </div>
              
              {/* 최근 리뷰 */}
              <div>
                <h4 className="font-bold mb-3">최근 리뷰</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { platform: "네이버", content: "정말 친절하고 꼼꼼하게 가르쳐주세요!", rating: 5 },
                    { platform: "카카오", content: "실력이 눈에 띄게 늘었어요. 강추!", rating: 5 },
                    { platform: "인스타", content: "최고의 선생님! 덕분에 자신감이 생겼어요", rating: 5 }
                  ].map((review, i) => (
                    <div key={i} className="p-3 bg-white rounded border animate-slideIn" style={{ animationDelay: `${i * 200}ms` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
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
                      </div>
                      <p className="text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mt-6 pt-6 border-t text-center">
              <Link href="/signup">
                <Button className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8 py-3">
                  나도 만들기 →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
      
      {/* 고객 사례 - 간결하게 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {userCount.toLocaleString()}명이 선택한 이유
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: "박소연 헤어디자이너",
                content: "단골 고객이 87%로 늘었어요",
                result: "매출 42% ↑"
              },
              {
                name: "김준호 PT트레이너",
                content: "투자자 미팅에서 238개 리뷰로 신뢰도 증명",
                result: "투자 유치 성공"
              },
              {
                name: "이하나 네일아티스트",
                content: "리뷰 요청 자동화로 시간 절약",
                result: "주 5명 신규고객"
              }
            ].map((item, i) => (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                <div className="mb-3">
                  <p className="font-bold text-sm">{item.name}</p>
                </div>
                <p className="text-sm text-gray-700 mb-3">"{item.content}"</p>
                <div className="bg-orange-50 text-[#FF6B35] text-xs font-bold px-2 py-1 rounded inline-block">
                  {item.result}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* 해시태그 - 기존 코드 활용 */}
      <section className="py-8 overflow-hidden bg-gray-50">
        <div className="relative">
          <div className="flex gap-2 animate-scroll-right-to-left">
            {[...hashtags, ...hashtags].map((tag, i) => (
              <div key={i} className="flex-shrink-0 px-4 py-2 bg-white rounded-full text-xs text-gray-700 whitespace-nowrap shadow">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 최종 CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            지금 시작하면 평생 무료
          </h2>
          <p className="text-white/90 mb-8">
            {userCount.toLocaleString()}명의 프리랜서가 이미 시작했습니다
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100 px-8 py-6 text-lg font-bold shadow-2xl">
              30초 만에 시작하기
            </Button>
          </Link>
        </div>
      </section>
      
      {/* 푸터 */}
      <footer className="py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-xs text-gray-600">
          <p>© 2025 Re:cord. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}