'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRightIcon, CheckIcon, StarFilledIcon } from "@radix-ui/react-icons"
import { Shield, Camera } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"

// 해시태그 데이터
const hashtags = [
  "#노래교실_회원관리", "#필라테스_전문강사", "#보컬코치_프리랜서",
  "#뷰티컬_입시지도", "#음치교정_전문", "#발성교정_전문가", 
  "#녹음실습_지도", "#버스킹_코칭", "#가요_레슨",
  "#보컬코치_프리랜서", "#네일샵_단골관리", "#미용실_독립준비",
  "#PT트레이너_창업", "#요가강사_프리랜서", "#속눈썹_고객관리",
  "#왁싱샵_리뷰관리", "#마사지샵_단골", "#메이크업_포트폴리오",
  "#헤어디자이너_독립", "#피부관리_고객", "#네일아트_리뷰",
  "#반영구_시술리뷰", "#타투이스트_포트폴리오", "#퍼스널컬러_진단",
  "#스포츠마사지_회원", "#필라테스_독립", "#크로스핏_회원관리",
  "#카페사장_단골관리", "#베이커리_리뷰", "#플로리스트_포트폴리오",
  "#웨딩플래너_고객", "#포토그래퍼_리뷰", "#비즈니스_코칭"
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [reviewCount, setReviewCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [showDemo, setShowDemo] = useState(false)
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const [visibleReviews, setVisibleReviews] = useState(3)
  
  const targetAudiences = [
    "보컬트레이너",
    "미용사",
    "강사", 
    "네일샵 사장님",
    "자영업자",
    "필라테스 강사",
    "요가 선생님",
    "트레이너",
    "헤어디자이너",
    "네일아티스트",
    "메이크업 아티스트",
    "카페 사장님",
    "레스토랑 셰프",
    "바리스타",
    "플로리스트",
    "인테리어 디자이너",
    "사진작가"
  ]

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
    
    // 타겟 오디언스 순환 애니메이션
    const targetTimer = setInterval(() => {
      setCurrentTargetIndex((prev) => (prev + 1) % targetAudiences.length)
    }, 800) // 0.8초마다 변경

    return () => {
      clearTimeout(timer)
      clearTimeout(ratingTimer)
      clearInterval(targetTimer)
    }
  }, [])

  const demoReviews = [
    {
      platform: "네이버",
      business: "비너스필라테스",
      rating: 5,
      content: "수업 때마다 컨디션에 맞게 진행해주시기 때문에 무리하지 않는 선에서 운동할 수 있어서 좋아요. 동작할 때 꼼꼼히 봐주시고, 제가 불편하거나 자극이 없어서 아쉬운 부분이 있다고 말씀드리면 바로 수정도 해주셔서 좋아요. 최고입니다!",
      author: "헤이지오니",
      date: "5.22.목",
      reviewCount: "리뷰 497",
      visitCount: "사진 22",
      isNaverReview: true,
      verified: true
    },
    {
      platform: "네이버",
      business: "서영빈 선생님",
      rating: 5,
      content: "선생님이 늘 친절하시고, 꼼꼼하시고, 정말 열정적으로 잘 가르쳐주십니다. 저에게 필요했던 부분을 잘 지도해주셔서, 요즘 노래부르는 게 더 재밌어졌어요~ 감사합니다 :)",
      author: "20221001",
      date: "22.6.4",
      reviewCount: "리뷰 716",
      visitCount: "사진 27",
      isNaverReview: true,
      verified: true
    },
    {
      platform: "네이버",
      business: "서영빈 선생님",
      rating: 5,
      content: "친구 축가를 부르기 위해 배우게 되었는데요... 사실 음치 박치라 반쯤 포기하고 시작했는데, 쌤이 포기하지 않고 이끌어나가주고 있습니다. 항상 용기를 가득 채워주고, 열정을 가지고 가르쳐 주세요. 중간에 포기할 뻔한 순간도 있었지만, 그때마다 진심으로 할 수 있다고 말씀해주시고 좋은 말도 많이해주셔서 용기를 얻고 있습니다!",
      author: "ho****",
      date: "22.12.1",
      reviewCount: "리뷰 69",
      visitCount: "사진 79",
      isNaverReview: true,
      verified: true
    },
    {
      platform: "네이버",
      business: "서영빈 선생님",
      rating: 5,
      content: "이전에도 취미로 노래를 배웠었지만 뜻대로 되지않아 자신감만 떨어지던 날날을 보내던 중에 쾌라우디 뮤직, 그리고 영빈쌤을 만났어요! 멘탈관리도 보컬레슨에 있어서 중요한 영역이라고 말씀하시는 선생님께... 학생 수업 때마다 칭찬감에 가득주십니다...",
      author: "cod****",
      date: "22.12.2",
      reviewCount: "리뷴 7",
      visitCount: "사진 6",
      isNaverReview: true,
      verified: true
    },
    {
      platform: "네이버",
      business: "서영빈 선생님",
      rating: 5,
      content: "평소에 음악 듣는 것도 좋아하고 노래 부르는 것도 좋아했었는데, 꾼을 이쯀으로 정해서 학원을 찾던 도중 쾌라우디뮤직, 영빈쌤을 만났어요!! 수업을 받으지는 한 달 정도 지났는데, 한 달 전에 제가 불러본 것과 현재 부르는 게 조금씩 변하고 있다는 게 너무 신기하고 재밌어요!! 그냥 힐링 그 자체입니다",
      author: "aki****",
      date: "23.4.6",
      reviewCount: "리뷴 12",
      visitCount: "사진 4",
      isNaverReview: true,
      verified: true
    },
    {
      platform: "카카오",
      business: "빈 보컬 스튜디오",
      rating: 4,
      content: "복식호흡이 뭔지도 몰랐는데 이제는 자연스럽게 돼요! 일상생활에서도 활용할 수 있는 발성팁도 알려주셔서 목이 편해졌어요.",
      author: "조**",
      date: "2024.08.02",
      imageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=300&fit=crop",
      verified: true
    },
    {
      platform: "네이버",
      business: "YB 보컬 아카데미",
      rating: 5,
      content: "영빈선생님께 3개월째 레슨 받고 있는데 음정, 박자감이 확실히 좋아졌어요. 친구들이 노래 잘한다고 칭찬해줘요!",
      author: "최**",
      date: "2024.08.01",
      imageUrl: null,
      verified: true
    },
    {
      platform: "인스타",
      business: "서영빈 보컬 클래스",
      rating: 5,
      content: "취미로 시작했는데 이제는 버스킹도 해요! 영빈쌤과 함께하면서 무대 자신감도 생기고 실력도 늘었어요. 최고의 선생님!",
      author: "서**",
      date: "2024.07.31",
      imageUrl: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop",
      verified: false
    },
    {
      platform: "네이버",
      business: "빈 뮤직 스튜디오",
      rating: 5,
      content: "상담부터 레슨까지 모든 과정이 체계적이에요. 개인별 맞춤 커리큘럼으로 진행해주셔서 실력이 빠르게 늘어요!",
      author: "이**",
      date: "2024.07.30",
      imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=400&h=300&fit=crop",
      verified: true
    },
    {
      platform: "카카오",
      business: "YB 보컬 트레이닝",
      rating: 5,
      content: "목이 쉽게 아팠는데 올바른 발성법을 배우고 나서는 3시간 노래해도 멀쩡해요! 보컬 건강까지 챙겨주시는 선생님이세요.",
      author: "손**",
      date: "2024.07.29",
      imageUrl: null,
      verified: true
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
            
            {/* 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
                onClick={() => {
                  const section = document.getElementById('live-demo')
                  section?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                라이브데모
              </button>
              <button 
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
                onClick={() => {
                  const section = document.getElementById('how-it-works')
                  section?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                사용방법
              </button>
              <button 
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
                onClick={() => {
                  const section = document.getElementById('before-after')
                  section?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                효과비교
              </button>
            </div>
            
            <div className="flex gap-3">
              {status === "loading" ? (
                <Button variant="ghost" size="sm" disabled>로딩중...</Button>
              ) : session ? (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                    대시보드로 이동
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">로그인</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                      무료 시작하기
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 1. 히어로 섹션 - 감성적 카피라이팅 */}
      <section className="pt-24 md:pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            {/* 상단 알림 */}
            <div className="text-center mb-12">
              <p className="text-[#FF6B35] font-semibold text-lg">
                🔥 매일 평균 12개의 리뷰가 사라지고 있습니다
              </p>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-6xl font-bold text-center leading-tight mb-8 text-gray-900">
              브랜드를 새로 열거나 지점을 옮기는
            </h1>
            
            {/* 타겟 오디언스 박스 - 자동 변경 */}
            <div className="flex justify-center mb-8">
              <div className="inline-block bg-white border-2 border-gray-200 rounded-full px-8 py-3">
                <span className="text-2xl md:text-3xl font-bold text-[#FF6B35] transition-all duration-300">
                  {targetAudiences[currentTargetIndex]}
                </span>
              </div>
            </div>

            {/* 서브 타이틀 */}
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-8 text-gray-900 text-center">
              고객들의 진짜 '찐' 후기가<br/>
              여러 플랫폼에 흩어져 제대로 빛을 못 보고 있나요?
            </h2>

            {/* 설명 텍스트 */}
            <p className="text-lg text-gray-600 mb-4">
              이제 흩어진 리뷰를 한 곳에 모아
            </p>
            <p className="text-lg mb-12">
              프로필 조회 후 문의율을 <span className="text-[#FF6B35] font-bold">최대 67%까지</span> 확실히 끌어올리세요!
            </p>

            {/* 추가 설명 */}
            <p className="text-gray-600 mb-12">
              네이버, 카카오, 인스타 등 모든 리뷰를 한 번에 통합<br />
              당신의 모든 소중한 리뷰가 당신의 실력을 명확하게 증명합니다
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8 py-6 text-lg">
                  30초만에 리뷰 통합하기
                  <ArrowRightIcon className="ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg"
                onClick={() => {
                  const section = document.getElementById('app-preview')
                  section?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                통합 효과 보기
              </Button>
            </div>

            {/* 하단 정보 */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <span>✓ 카드 등록 없음</span>
              <span>·</span>
              <span>14일 무료 체험</span>
              <span>·</span>
              <span>1분 안에 시작</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-[#FF6B35]">🎁</span>
              <span className="font-medium">베타 기간 특별 혜택 12월 31일까지</span>
            </div>

            {/* 하단 체크 항목들 */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mt-12">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>모든 리뷰 한 곳에</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>평생 소장 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>신뢰도 UP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 라이브 데모 - 티로 스타일 */}
      <section id="live-demo" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-[#FF6B35] mb-2 block">LIVE DEMO</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              실제 <span className="text-[#FF6B35]">Re:cord</span> 사용 화면
            </h2>
            <p className="text-gray-600 text-lg">69개 리뷰를 가진 김서연 필라테스 강사님의 프로필</p>
          </div>
          
          {/* 실제 데모 화면 */}
          <div className="max-w-4xl mx-auto">
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
                  <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="space-y-3 pr-2">
                      {demoReviews.slice(0, visibleReviews).map((review, i) => (
                        <div key={i} className="bg-white border rounded-lg overflow-hidden animate-slideIn hover:shadow-md transition-shadow" 
                             style={{ animationDelay: `${1000 + i * 200}ms` }}>
                          
                          {/* 리뷰 UI - 법률적으로 안전한 독립 디자인 */}
                          {review.isNaverReview ? (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                              {/* 플랫폼 표시 - 텍스트로만 */}
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600 font-medium">출처: 네이버</span>
                                  {review.verified && (
                                    <div className="flex items-center gap-1">
                                      <Shield className="w-3 h-3 text-blue-600" />
                                      <span className="text-xs text-blue-600">인증됨</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* 리뷰 본문 */}
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  {/* 프로필 */}
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {review.author.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* 내용 */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-gray-900">{review.author}</span>
                                      <span className="text-xs text-gray-500">· {review.date}</span>
                                    </div>
                                    
                                    {/* 별점 */}
                                    <div className="flex items-center gap-1 mb-2">
                                      {[...Array(5)].map((_, j) => (
                                        <StarFilledIcon 
                                          key={j} 
                                          className={`w-4 h-4 ${j < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
                                        />
                                      ))}
                                    </div>
                                    
                                    {/* 리뷰 텍스트 */}
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {review.content}
                                    </p>
                                    
                                    {/* 메타 정보 */}
                                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                      <span>{review.reviewCount}</span>
                                      <span>·</span>
                                      <span>{review.visitCount}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : review.isKakaoReview ? (
                            /* 카카오맵 리뷰 스타일 */
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center">
                                  <span className="text-black text-xs font-bold">K</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">카카오맵 리뷰</span>
                              </div>
                              
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-yellow-700">
                                    {review.author.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">{review.author}</span>
                                    <div className="flex text-yellow-400">
                                      {[...Array(review.rating)].map((_, j) => (
                                        <StarFilledIcon key={j} className="w-3 h-3" />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">{review.date}</p>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-800 leading-relaxed mb-3">
                                {review.content}
                              </p>
                              
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                  <button className="flex items-center gap-1 text-xs text-gray-500">
                                    👍 도움됨 2
                                  </button>
                                  <button className="text-xs text-gray-500">
                                    댓글
                                  </button>
                                </div>
                                <span className="text-xs text-gray-400">{review.business}</span>
                              </div>
                            </div>
                          ) : (
                            /* 기존 리뷰 스타일 */
                            <>
                              {/* 리뷰 이미지 */}
                              {review.imageUrl && (
                                <div className="relative h-32 bg-gray-100">
                                  <Image 
                                    src={review.imageUrl} 
                                    alt={`${review.platform} 리뷰 이미지`}
                                    fill
                                    className="object-cover"
                                  />
                                  {review.verified && (
                                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      검증됨
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                    <Camera className="w-3 h-3" />
                                    스크린샷
                                  </div>
                                </div>
                              )}
                              
                              <div className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    review.platform === "네이버" ? "bg-green-100 text-green-700" :
                                    review.platform === "카카오" ? "bg-yellow-100 text-yellow-700" :
                                    review.platform === "인스타" ? "bg-purple-100 text-purple-700" :
                                    "bg-blue-100 text-blue-700"
                                  }`}>
                                    {review.platform}
                                  </span>
                                  {review.verified && !review.imageUrl && (
                                    <Shield className="w-3 h-3 text-green-600" />
                                  )}
                                  <div className="flex text-yellow-500 ml-auto">
                                    {[...Array(review.rating)].map((_, j) => (
                                      <StarFilledIcon key={j} className="w-3 h-3" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{review.content}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-500">{review.author} · {review.date}</p>
                                  <p className="text-xs text-gray-400">{review.business}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {visibleReviews < demoReviews.length && (
                        <button
                          onClick={() => setVisibleReviews(prev => Math.min(prev + 3, demoReviews.length))}
                          className="w-full p-3 text-center text-[#FF6B35] hover:bg-orange-50 rounded-lg transition-colors border-2 border-dashed border-gray-200 hover:border-[#FF6B35]"
                        >
                          더 많은 리뷰 보기 ({demoReviews.length - visibleReviews}개 남음)
                        </button>
                      )}
                      
                      {visibleReviews >= demoReviews.length && (
                        <div className="text-center p-3 text-gray-500 text-sm">
                          총 {demoReviews.length}개 리뷰를 모두 확인했습니다! ✨
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t flex gap-3">
                <Link href="/signup" className="flex-1">
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                    나도 만들기
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const section = document.getElementById('how-it-works')
                    section?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  더 알아보기
                </Button>
              </div>
            </Card>
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
        
        {/* 해시태그 무한 스크롤 - 한 줄 (오른쪽에서 왼쪽으로) */}
        <div className="relative overflow-hidden">
          <div className="flex gap-4 animate-scroll-right-to-left">
            {[...hashtags, ...hashtags, ...hashtags].map((tag, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-6 py-3 bg-gray-100 rounded-full text-gray-700 font-medium whitespace-nowrap"
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

          {/* CTA 버튼 */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8 py-4 text-lg"
              onClick={() => {
                const section = document.getElementById('live-demo')
                section?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              라이브 데모 체험하기 →
            </Button>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS - 상세 기능 가이드 */}
      <section id="how-it-works" className="py-20 bg-white">
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
                <Link href="/signup">
                  <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                    지금 시작하기 →
                  </Button>
                </Link>
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
                    <Button 
                      className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Re:cord - 리뷰 통합 관리',
                            text: '모든 플랫폼의 리뷰를 한 곳에서 관리하세요!',
                            url: window.location.href
                          })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                          alert('링크가 복사되었습니다!')
                        }
                      }}
                    >
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
      <section id="before-after" className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
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
                  <span className="text-xl md:text-2xl">🧮</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">계정 정지/해킹으로 접근 불가</p>
                    <p className="text-xs md:text-sm text-gray-500">소중한 리뷰가 한순간에 사라질 위험</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl md:text-2xl">🔍</span>
                  <div>
                    <p className="text-sm md:text-base font-medium">활동하던 곳이 닫라지면 사라지는 리뷰</p>
                    <p className="text-xs md:text-sm text-gray-500">이직/독립 시 과거 실적 증명 복잡</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm md:text-base text-gray-600">
                  "리뷰가 어디저디 흩어져 있어서<br />
                  <span className="text-xs md:text-sm">전체 실력을 보여주기 어려웠어요"</span>
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
                    <p className="text-xs md:text-sm text-gray-500">안도적인 숫자가 주는 강력한 임팩트</p>
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
                  "모든 리뷰가 한 곳에!<br />
                  <span className="text-xs md:text-sm">💪 10개보다 100개가 주는 신뢰의 힘!"</span>
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