"use client"

import Link from "next/link"
import { 
  HomeIcon, 
  PersonIcon, 
  PlusIcon, 
  BarChartIcon,
  GearIcon,
  ExitIcon 
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// 임시 데이터
const mockUser = {
  name: "김서연",
  username: "seoyeon",
  email: "seoyeon@example.com",
  avatar: "김",
  stats: {
    totalReviews: 47,
    averageRating: 4.8,
    platforms: 4,
    thisMonth: 12
  }
}

const mockReviews = [
  {
    id: 1,
    platform: "네이버",
    business: "마인드홈 스튜디오", 
    rating: 5,
    content: "서연 선생님의 요가 수업은 제 연습을 완전히 바꿔놓았어요...",
    author: "김**",
    date: "2024-01-15",
    platformColor: "bg-green-100 text-green-800"
  },
  {
    id: 2,
    platform: "카카오맵",
    business: "세렌디피티 요가",
    rating: 5, 
    content: "소맞은 요가 수업을 들어봤지만, 서연 선생님의 마음챙김...",
    author: "이**",
    date: "2024-01-12",
    platformColor: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 3,
    platform: "구글",
    business: "프라임 교육센터",
    rating: 4,
    content: "김서연 강사님의 강의는 매우 체계적이고 논리적입니다...",
    author: "박**", 
    date: "2024-01-10",
    platformColor: "bg-blue-100 text-blue-800"
  }
]

export default function DashboardPage() {
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
            <NavItem icon={<HomeIcon />} label="대시보드" href="/dashboard" active />
            <NavItem icon={<BarChartIcon />} label="리뷰 관리" href="/dashboard/reviews" />
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
            <h1 className="text-3xl font-bold text-gray-900">
              안녕하세요, {mockUser.name}님! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              오늘도 소중한 리뷰들을 관리해보세요
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="총 리뷰"
              value={mockUser.stats.totalReviews}
              suffix="개"
              trend="+3"
              trendLabel="이번 주"
            />
            <StatCard
              title="평균 평점"
              value={mockUser.stats.averageRating}
              suffix="점"
              trend="+0.2"
              trendLabel="지난 달 대비"
            />
            <StatCard
              title="연동 플랫폼"
              value={mockUser.stats.platforms}
              suffix="개"
              trend="stable"
              trendLabel="안정적"
            />
            <StatCard
              title="이번 달 리뷰"
              value={mockUser.stats.thisMonth}
              suffix="개" 
              trend="+4"
              trendLabel="지난 달 대비"
            />
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>
                자주 사용하는 기능들을 바로 실행하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-auto p-6 flex flex-col items-center gap-3 bg-[#FF6B35] hover:bg-[#E55A2B]">
                  <PlusIcon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">리뷰 추가</div>
                    <div className="text-xs opacity-90">새로운 리뷰 등록</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3">
                  <PersonIcon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">프로필 보기</div>
                    <div className="text-xs text-gray-500">공개 프로필 확인</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3">
                  <BarChartIcon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">분석 보기</div>
                    <div className="text-xs text-gray-500">상세 통계 확인</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>최근 리뷰</CardTitle>
                  <CardDescription>
                    최근에 받은 리뷰들을 확인하세요
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${review.platformColor}`}>
                          {review.platform}
                        </span>
                        <span className="text-sm font-medium">{review.business}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {review.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{review.author}</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
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

function StatCard({ 
  title, 
  value, 
  suffix, 
  trend, 
  trendLabel 
}: {
  title: string
  value: number
  suffix: string
  trend: string
  trendLabel: string
}) {
  const isPositive = trend.startsWith('+')
  const isNegative = trend.startsWith('-')
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}{suffix}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 
              isNegative ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {trend !== 'stable' && trend}
            </p>
            <p className="text-xs text-gray-500">{trendLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}