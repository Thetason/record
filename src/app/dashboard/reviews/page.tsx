"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  HomeIcon, 
  PersonIcon, 
  PlusIcon, 
  BarChartIcon,
  GearIcon,
  ExitIcon,
  Pencil1Icon,
  TrashIcon,
  MagnifyingGlassIcon,
  DotsVerticalIcon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// 임시 데이터
const mockUser = {
  name: "김서연",
  username: "seoyeon",
  email: "seoyeon@example.com",
  avatar: "김"
}

const initialReviews = [
  {
    id: 1,
    platform: "네이버",
    business: "마인드홈 스튜디오", 
    rating: 5,
    content: "서연 선생님의 요가 수업은 제 연습을 완전히 바꿔놓았어요. 매일 아침 명상과 함께 시작하는 하타 요가는 정말 마음을 평온하게 해주고, 몸도 한층 유연해졌습니다. 특히 개인별 맞춤 지도가 인상적이었어요.",
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
    content: "김서연 강사님의 강의는 매우 체계적이고 논리적입니다. 복잡한 개념도 쉽게 설명해주시고, 실습 위주의 수업 방식이 정말 효과적이었어요. 다음 기수 강의도 꼭 들을 예정입니다.",
    author: "박**", 
    date: "2024-01-10",
    platformColor: "bg-blue-100 text-blue-800"
  },
  {
    id: 4,
    platform: "크몽",
    business: "서연의 맞춤형 과외",
    rating: 5,
    content: "1:1 맞춤 과외를 받았는데 정말 만족스러웠습니다. 제가 부족한 부분을 정확히 짚어주시고, 단계별로 차근차근 가르쳐주셔서 실력이 많이 늘었어요.",
    author: "최**",
    date: "2024-01-08",
    platformColor: "bg-purple-100 text-purple-800"
  },
  {
    id: 5,
    platform: "네이버",
    business: "힐링 요가 스튜디오",
    rating: 5,
    content: "임신 중에 받은 산전 요가 수업이었는데, 임산부의 몸 상태를 정말 세심하게 배려해주셨어요. 안전하면서도 효과적인 동작들로 구성된 수업이었습니다.",
    author: "정**",
    date: "2024-01-05",
    platformColor: "bg-green-100 text-green-800"
  }
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")

  const platforms = ["all", "네이버", "카카오맵", "구글", "크몽"]
  
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.business.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === "all" || review.platform === filterPlatform
    
    return matchesSearch && matchesPlatform
  })

  const handleDelete = (id: number) => {
    if (confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      setReviews(reviews.filter(review => review.id !== id))
    }
  }

  const handleEdit = (id: number) => {
    // 편집 로직 구현 예정
    alert(`리뷰 ${id} 편집 기능은 곧 구현됩니다!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem icon={<HomeIcon />} label="대시보드" href="/dashboard" />
            <NavItem icon={<BarChartIcon />} label="리뷰 관리" href="/dashboard/reviews" active />
            <NavItem icon={<PersonIcon />} label="내 프로필" href="/dashboard/profile" />
            <NavItem icon={<PlusIcon />} label="리뷰 추가" href="/dashboard/add-review" />
            <NavItem icon={<GearIcon />} label="설정" href="/dashboard/settings" />
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-[#FF6B35]">
                {mockUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mockUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{mockUser.username}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <ExitIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">리뷰 관리</h1>
            <p className="text-gray-600 mt-2">
              받으신 모든 리뷰를 한 곳에서 관리하세요
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                  <p className="text-sm text-gray-600">총 리뷰</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">평균 평점</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(reviews.map(r => r.platform)).size}
                  </p>
                  <p className="text-sm text-gray-600">플랫폼</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews.filter(r => r.rating === 5).length}
                  </p>
                  <p className="text-sm text-gray-600">5점 리뷰</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>필터 & 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="업체명, 리뷰 내용, 작성자로 검색..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform === "all" ? "모든 플랫폼" : platform}
                    </option>
                  ))}
                </select>
                <Button asChild>
                  <Link href="/dashboard/add-review">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    리뷰 추가
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>
                리뷰 목록 ({filteredReviews.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">검색 결과가 없습니다</p>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/add-review">
                        첫 번째 리뷰 추가하기
                      </Link>
                    </Button>
                  </div>
                ) : (
                  filteredReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${review.platformColor}`}>
                              {review.platform}
                            </span>
                            <span className="text-lg font-semibold">{review.business}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed">
                            {review.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>작성자: {review.author}</span>
                            <span>•</span>
                            <span>작성일: {review.date}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(review.id)}
                          >
                            <Pencil1Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(review.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function NavItem({ 
  icon, 
  label, 
  href, 
  active = false 
}: { 
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean 
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
        active 
          ? 'bg-[#FF6B35] text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}