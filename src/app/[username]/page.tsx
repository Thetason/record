"use client"

import { useState } from "react"
import Link from "next/link"

// 임시 데이터
const mockProfileData = {
  name: "김서연",
  username: "seoyeon",
  bio: "요가 강사 & 교육 전문가 🧘‍♀️\n마음챙김과 몸의 균형을 통해 일상의 평화를 찾아드립니다.",
  avatar: "김",
  location: "서울, 한국",
  website: "https://seoyeon-yoga.com",
  joinedDate: "2024-01",
  stats: {
    totalReviews: 47,
    averageRating: 4.8,
    platforms: 4,
    responseRate: 98
  },
  reviews: [
    {
      id: 1,
      platform: "네이버",
      business: "마인드홈 스튜디오", 
      rating: 5,
      content: "서연 선생님의 요가 수업은 제 연습을 완전히 바꿔놓았어요. 매일 아침 명상과 함께 시작하는 하타 요가는 정말 마음을 평온하게 해주고, 몸도 한층 유연해졌습니다.",
      author: "김**",
      date: "2024-01-15",
      platformColor: "bg-green-100 text-green-800"
    },
    {
      id: 2,
      platform: "카카오맵",
      business: "세렌디피티 요가",
      rating: 5, 
      content: "소수정예 요가 수업을 들어봤지만, 서연 선생님의 마음챙김 요가는 차별화되어 있어요. 단순히 동작만 배우는 게 아니라, 호흡과 명상을 통해 진정한 요가의 정신을 배울 수 있었습니다.",
      author: "이**",
      date: "2024-01-12",
      platformColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 3,
      platform: "구글",
      business: "프라임 교육센터",
      rating: 4,
      content: "김서연 강사님의 강의는 매우 체계적이고 논리적입니다. 복잡한 개념도 쉽게 설명해주시고, 실습 위주의 수업 방식이 정말 효과적이었어요.",
      author: "박**", 
      date: "2024-01-10",
      platformColor: "bg-blue-100 text-blue-800"
    }
  ]
}

export default function PublicProfilePage({
  params
}: {
  params: { username: string }
}) {
  const [profile] = useState(mockProfileData)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        alert("링크가 복사되었습니다!")
      }
    } catch (err) {
      console.error('링크 복사 실패:', err)
      alert("링크 복사에 실패했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={handleCopyLink}
              >
                📋 {copied ? '복사됨!' : '링크 복사'}
              </button>
              <button 
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={handleCopyLink}
              >
                📤 공유하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Hero */}
        <div className="bg-white rounded-lg shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] h-32"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#FF6B35] border-4 border-white shadow-lg">
                  {profile.avatar}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 pt-4 md:pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile.name}
                    </h1>
                    <p className="text-lg text-gray-600 mb-1">
                      @{profile.username}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      👤 {profile.location}
                    </p>
                  </div>
                  
                  {/* Compact Stats */}
                  <div className="flex items-center gap-8 mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{profile.stats.totalReviews}</p>
                      <p className="text-xs text-gray-700 whitespace-nowrap">총 리뷰</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{profile.stats.averageRating}</p>
                      <p className="text-xs text-gray-700 whitespace-nowrap">평균 평점</p>
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
                
                {/* Links */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B35] hover:underline flex items-center gap-1"
                  >
                    🔗 웹사이트
                  </a>
                  <span className="text-gray-500 flex items-center gap-1">
                    📅 {profile.joinedDate}부터 활동
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-2">{profile.stats.totalReviews}</p>
            <p className="text-sm font-medium text-gray-600">총 리뷰</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-2">{profile.stats.averageRating}</p>
            <p className="text-sm font-medium text-gray-600">평균 평점</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-2">{profile.stats.platforms}</p>
            <p className="text-sm font-medium text-gray-600">플랫폼</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-2">{profile.stats.responseRate}%</p>
            <p className="text-sm font-medium text-gray-600">응답률</p>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                받은 리뷰
              </h2>
              <p className="text-gray-600">
                {profile.name}님이 받은 실제 고객 리뷰들입니다
              </p>
            </div>
            
            <div className="space-y-6">
              {profile.reviews.map((review) => (
                <div key={review.id} className="border-l-4 border-[#FF6B35] pl-6 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${review.platformColor}`}>
                      {review.platform}
                    </span>
                    <span className="font-semibold text-gray-900">{review.business}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i} 
                          className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{review.author}</span>
                    <span>•</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-2">
            &ldquo;리뷰는 누군가의 기억입니다&rdquo;
          </p>
          <Link href="/" className="text-[#FF6B35] hover:underline text-sm">
            Re:cord로 나만의 리뷰 포트폴리오 만들기 →
          </Link>
        </div>
      </div>
    </div>
  )
}