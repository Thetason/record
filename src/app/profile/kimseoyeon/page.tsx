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
    title: "프리랜서 디자이너",
    bio: "10년차 브랜드 디자이너입니다. 로고, 패키지, 웹디자인 전문입니다.",
    totalReviews: 156,
    avgRating: 4.9,
    platforms: 5,
    avatar: "김서연"
  }

  const reviews = [
    {
      id: 1,
      platform: "네이버",
      business: "브랜드 로고 디자인",
      rating: 5,
      content: "디자인 작업 정말 만족스러웠습니다. 포트폴리오도 꼼꼼하게 보여주시고, 소통도 원활해서 믿고 맡길 수 있었어요. 수정사항도 빠르게 반영해주셔서 감사했습니다.",
      author: "김**",
      date: "2024.08.07"
    },
    {
      id: 2,
      platform: "카카오",
      business: "명함 디자인",
      rating: 5,
      content: "깔끔하고 세련된 디자인으로 만들어주셨어요. 여러 시안 보여주시고 선택할 수 있게 해주셔서 좋았습니다.",
      author: "이**",
      date: "2024.08.06"
    },
    {
      id: 3,
      platform: "크몽",
      business: "웹사이트 UI 디자인",
      rating: 5,
      content: "웹사이트 디자인 의뢰했는데 기대 이상으로 잘 만들어주셨습니다. 특히 반응형 디자인이 완벽해요! 사용자 경험까지 고려한 디자인이라 매우 만족합니다.",
      author: "박**",
      date: "2024.08.05"
    },
    {
      id: 4,
      platform: "숨고",
      business: "패키지 디자인",
      rating: 5,
      content: "제품 패키지 디자인 너무 예쁘게 잘 나왔어요. 트렌디하면서도 우리 브랜드 아이덴티티를 잘 살려주셨습니다.",
      author: "정**",
      date: "2024.08.04"
    },
    {
      id: 5,
      platform: "탈잉",
      business: "디자인 레슨",
      rating: 5,
      content: "포토샵 기초부터 차근차근 알려주셔서 너무 좋았어요. 실무에서 바로 쓸 수 있는 팁들도 많이 알려주셨습니다.",
      author: "최**",
      date: "2024.08.03"
    },
    {
      id: 6,
      platform: "네이버",
      business: "SNS 템플릿 디자인",
      rating: 5,
      content: "인스타그램 피드 디자인 템플릿 제작 의뢰했는데 통일감 있고 예쁘게 만들어주셨어요. 덕분에 팔로워가 늘었습니다!",
      author: "강**",
      date: "2024.08.02"
    },
    {
      id: 7,
      platform: "카카오",
      business: "프레젠테이션 디자인",
      rating: 4,
      content: "투자 제안서 디자인 도움받았는데 깔끔하고 전문적으로 만들어주셨습니다. 덕분에 발표 잘 마쳤어요.",
      author: "윤**",
      date: "2024.08.01"
    },
    {
      id: 8,
      platform: "크몽",
      business: "앱 UI/UX 디자인",
      rating: 5,
      content: "모바일 앱 디자인 의뢰했습니다. 사용자 플로우부터 상세 화면까지 완벽하게 작업해주셨어요. 개발자분들도 만족하셨습니다.",
      author: "조**",
      date: "2024.07.31"
    }
  ]

  const platforms = ["전체", "네이버", "카카오", "크몽", "숨고", "탈잉"]
  
  const filteredReviews = selectedPlatform === "전체" 
    ? reviews 
    : reviews.filter(r => r.platform === selectedPlatform)

  const platformStats = {
    "네이버": reviews.filter(r => r.platform === "네이버").length,
    "카카오": reviews.filter(r => r.platform === "카카오").length,
    "크몽": reviews.filter(r => r.platform === "크몽").length,
    "숨고": reviews.filter(r => r.platform === "숨고").length,
    "탈잉": reviews.filter(r => r.platform === "탈잉").length,
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
                <div className="grid grid-cols-3 gap-4 mb-4">
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
                
                <h3 className="font-medium mb-2">{review.business}</h3>
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