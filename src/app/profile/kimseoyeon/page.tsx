'use client'

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarFilledIcon, Share1Icon, ArrowLeftIcon } from "@radix-ui/react-icons"
import { Badge } from "@/components/ui/badge"

export default function KimSeoyeonProfilePage() {
  const [selectedPlatform, setSelectedPlatform] = useState("전체")

  const profileData = {
    name: "김서연",
    title: "필라테스 강사",
    bio: "8년차 필라테스 전문 강사입니다. 기구/매트/소도구 필라테스 전문, 체형교정 및 재활 전문가입니다.",
    totalReviews: 69,
    avgRating: 4.8,
    platforms: 2,
    studios: 3,
    avatar: "김서연"
  }

  const reviews = [
    {
      id: 1,
      platform: "네이버",
      business: "비너스필라테스",
      rating: 5,
      content: "김서연 강사님 최고예요! 자세 하나하나 꼼꼼하게 봐주시고, 제 몸 상태에 맞춰서 운동 강도도 조절해주셔서 너무 좋았어요. 허리 통증이 많이 개선됐습니다.",
      author: "정**",
      date: "2024.08.07"
    },
    {
      id: 2,
      platform: "카카오",
      business: "밸런스드필라테스",
      rating: 5,
      content: "서연쌤 수업은 진짜 강추! 기구 필라테스 처음인데도 무리 없이 따라갈 수 있게 지도해주셔서 감사해요. 체형이 예뻐지고 있어요!",
      author: "이**",
      date: "2024.08.06"
    },
    {
      id: 3,
      platform: "네이버",
      business: "필라오라인",
      rating: 5,
      content: "6개월째 김서연 강사님께 PT받고 있는데 체형이 정말 많이 개선됐어요. 전문적이면서도 친절하신 최고의 강사님! 골반 교정 전문가시네요.",
      author: "박**",
      date: "2024.08.05"
    },
    {
      id: 4,
      platform: "네이버",
      business: "비너스필라테스",
      rating: 5,
      content: "김서연 강사님 덕분에 필라테스의 매력에 빠졌어요! 초보자도 쉽게 따라할 수 있게 설명해주시고, 매시간 동기부여도 해주셔서 좋아요.",
      author: "최**",
      date: "2024.08.04"
    },
    {
      id: 5,
      platform: "카카오",
      business: "필라오라인",
      rating: 5,
      content: "서연쌤 진짜 전문가세요. 제 몸 상태 분석해주시고 맞춤 운동 짜주셨어요. 매트 필라테스도 기구도 다 잘 가르쳐주세요!",
      author: "강**",
      date: "2024.08.03"
    },
    {
      id: 6,
      platform: "네이버",
      business: "밸런스드필라테스",
      rating: 5,
      content: "임산부 필라테스 전문가세요! 임신 중에도 안전하게 운동할 수 있게 도와주셨고, 출산 후 회복 운동도 친절하게 알려주셨어요.",
      author: "윤**",
      date: "2024.08.02"
    },
    {
      id: 7,
      platform: "카카오",
      business: "비너스필라테스",
      rating: 4,
      content: "김서연 강사님 수업 좋아요! 다만 인기가 많아서 예약이 어려워요. 그래도 수업 퀄리티는 최고입니다.",
      author: "조**",
      date: "2024.08.01"
    },
    {
      id: 8,
      platform: "네이버",
      business: "필라오라인",
      rating: 5,
      content: "재활 필라테스 전문가세요. 디스크 수술 후 재활로 받았는데 정말 많이 좋아졌어요. 안전하게 운동할 수 있게 도와주셨어요.",
      author: "황**",
      date: "2024.07.31"
    },
    {
      id: 9,
      platform: "카카오",
      business: "밸런스드필라테스",
      rating: 5,
      content: "서연쌤은 진짜 프로페셔널해요! 매번 수업 시간이 기다려져요. 솔츄한 성격에 열정이 넘치세요!",
      author: "임**",
      date: "2024.07.30"
    },
    {
      id: 10,
      platform: "네이버",
      business: "비너스필라테스",
      rating: 5,
      content: "김서연 강사님 수업 들으면서 몸매가 정말 달라졌어요. 탄탄해지고 자세도 많이 교정됐어요. 최고의 강사님!",
      author: "서**",
      date: "2024.07.29"
    }
  ]

  const platforms = ["전체", "네이버", "카카오"]
  const studios = ["전체", "비너스필라테스", "밸런스드필라테스", "필라오라인"]
  
  const filteredReviews = selectedPlatform === "전체" 
    ? reviews 
    : selectedPlatform === "네이버" || selectedPlatform === "카카오"
    ? reviews.filter(r => r.platform === selectedPlatform)
    : reviews.filter(r => r.business === selectedPlatform)

  const platformStats = {
    "네이버": reviews.filter(r => r.platform === "네이버").length,
    "카카오": reviews.filter(r => r.platform === "카카오").length,
  }

  const studioStats = {
    "비너스필라테스": reviews.filter(r => r.business === "비너스필라테스").length,
    "밸런스드필라테스": reviews.filter(r => r.business === "밸런스드필라테스").length,
    "필라오라인": reviews.filter(r => r.business === "필라오라인").length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="w-4 h-4" />
              <span>메인으로</span>
            </Link>
            <Button variant="outline" size="sm">
              <Share1Icon className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
      </header>

      {/* 프로필 섹션 */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* 아바타 */}
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {profileData.avatar}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{profileData.name}</h1>
                <p className="text-lg text-gray-600 mb-3">{profileData.title}</p>
                <p className="text-gray-700 mb-4">{profileData.bio}</p>
                
                {/* 통계 */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-[#FF6B35]">{profileData.totalReviews}</div>
                    <div className="text-sm text-gray-600">총 리뷰</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#FF6B35]">
                      {profileData.avgRating}
                    </div>
                    <div className="text-sm text-gray-600">평균 평점</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#FF6B35]">{profileData.platforms}</div>
                    <div className="text-sm text-gray-600">플랫폼</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#FF6B35]">{profileData.studios}</div>
                    <div className="text-sm text-gray-600">스튜디오</div>
                  </div>
                </div>

                {/* 평점 별 */}
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <StarFilledIcon key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <span className="font-bold">{profileData.avgRating}</span>
                  <span className="text-gray-600">({profileData.totalReviews}개 리뷰)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 플랫폼 필터 */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-3">
            {/* 플랫폼 필터 */}
            <div>
              <p className="text-sm text-gray-600 mb-2">플랫폼별</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {platforms.map(platform => (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                    className={selectedPlatform === platform ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                  >
                    {platform}
                    {platform !== "전체" && (
                      <span className="ml-1">({platformStats[platform as keyof typeof platformStats]})</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 스튜디오 필터 */}
            <div>
              <p className="text-sm text-gray-600 mb-2">스튜디오별</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {studios.map(studio => (
                  <Button
                    key={studio}
                    variant={selectedPlatform === studio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlatform(studio)}
                    className={selectedPlatform === studio ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                  >
                    {studio}
                    {studio !== "전체" && (
                      <span className="ml-1">({studioStats[studio as keyof typeof studioStats]})</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 리뷰 목록 */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-xl font-bold mb-6">
            리뷰 {filteredReviews.length}개
          </h2>
          
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <Card key={review.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={
                      review.platform === "네이버" ? "bg-green-100 text-green-700" :
                      review.platform === "카카오" ? "bg-yellow-100 text-yellow-700" :
                      review.platform === "크몽" ? "bg-purple-100 text-purple-700" :
                      review.platform === "숨고" ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    }>
                      {review.platform}
                    </Badge>
                    <div className="flex text-yellow-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <StarFilledIcon key={i} className="w-4 h-4" />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                
                <h3 className="font-medium mb-2">
                  <span className="text-[#FF6B35]">{review.business}</span>
                  <span className="text-gray-400 text-sm ml-2">에서 받은 리뷰</span>
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  {review.content}
                </p>
                <p className="text-sm text-gray-500">{review.author} 고객님</p>
              </Card>
            ))}
          </div>

          {/* 더보기 버튼 */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              더 많은 리뷰 보기
            </Button>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-12 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            나도 리뷰 포트폴리오 만들기
          </h2>
          <p className="text-white/90 mb-6">
            5분 만에 당신의 신뢰 자산을 만들어보세요
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-[#FF6B35] hover:bg-gray-100">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}