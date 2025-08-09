"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  HomeIcon, 
  PersonIcon, 
  PlusIcon, 
  BarChartIcon,
  GearIcon,
  ExitIcon,
  UploadIcon 
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MobileNav from "@/components/ui/mobile-nav"

interface Review {
  id: string
  platform: string
  business: string
  rating: number
  content: string
  author: string
  reviewDate: string
  createdAt: string
}

interface UserStats {
  totalReviews: number
  averageRating: number
  platforms: number
  thisMonth: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalReviews: 0,
    averageRating: 0,
    platforms: 0,
    thisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchReviews()
  }, [session])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/reviews")
      if (res.ok) {
        const data = await res.json()
        const reviewsList = data.reviews || data
        setReviews(reviewsList.slice(0, 3))
        
        // 통계 계산
        if (reviewsList.length > 0) {
          const total = reviewsList.length
          const avgRating = reviewsList.reduce((sum: number, r: Review) => sum + r.rating, 0) / total
          const platforms = new Set(reviewsList.map((r: Review) => r.platform)).size
          const thisMonth = reviewsList.filter((r: Review) => {
            const reviewDate = new Date(r.createdAt)
            const now = new Date()
            return reviewDate.getMonth() === now.getMonth() && 
                   reviewDate.getFullYear() === now.getFullYear()
          }).length

          setStats({
            totalReviews: total,
            averageRating: Math.round(avgRating * 10) / 10,
            platforms: platforms,
            thisMonth: thisMonth
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      "네이버": "bg-green-100 text-green-800",
      "카카오맵": "bg-yellow-100 text-yellow-800",
      "구글": "bg-blue-100 text-blue-800",
      "크몽": "bg-purple-100 text-purple-800"
    }
    return colors[platform] || "bg-gray-100 text-gray-800"
  }

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:border-r md:border-gray-200 md:block">
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
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "사용자"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{session?.user?.username || "user"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <ExitIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35]">*</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {session?.user?.name || "사용자"}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <ExitIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              안녕하세요, {session?.user?.name || "사용자"}님! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              오늘도 소중한 리뷰들을 관리해보세요
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="총 리뷰"
              value={stats.totalReviews}
              suffix="개"
              trend={stats.totalReviews > 0 ? "+3" : "0"}
              trendLabel="이번 주"
            />
            <StatCard
              title="평균 평점"
              value={stats.averageRating || 0}
              suffix="점"
              trend={stats.averageRating > 0 ? "+0.2" : "0"}
              trendLabel="지난 달 대비"
            />
            <StatCard
              title="연동 플랫폼"
              value={stats.platforms}
              suffix="개"
              trend="stable"
              trendLabel="안정적"
            />
            <StatCard
              title="이번 달 리뷰"
              value={stats.thisMonth}
              suffix="개" 
              trend={stats.thisMonth > 0 ? `+${stats.thisMonth}` : "0"}
              trendLabel="신규 등록"
            />
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>
                자주 사용하는 기능들을 바로 실행하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Link href="/dashboard/bulk-upload">
                  <Button className="w-full h-auto p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 bg-[#FF6B35] hover:bg-[#E55A2B]">
                    <UploadIcon className="w-5 h-5 md:w-6 md:h-6" />
                    <div className="text-center">
                      <div className="text-sm md:text-base font-medium">대량 업로드</div>
                      <div className="text-xs opacity-90 hidden md:block">여러 리뷰 한번에</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/add-review">
                  <Button variant="outline" className="w-full h-auto p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 hover:bg-gray-50">
                    <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
                    <div className="text-center">
                      <div className="text-sm md:text-base font-medium">리뷰 추가</div>
                      <div className="text-xs text-gray-500 hidden md:block">개별 리뷰 등록</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full h-auto p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 hover:bg-gray-50">
                    <PersonIcon className="w-5 h-5 md:w-6 md:h-6" />
                    <div className="text-center">
                      <div className="text-sm md:text-base font-medium">프로필 보기</div>
                      <div className="text-xs text-gray-500 hidden md:block">공개 프로필 확인</div>
                    </div>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-auto p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 hover:bg-gray-50">
                  <BarChartIcon className="w-5 h-5 md:w-6 md:h-6" />
                  <div className="text-center">
                    <div className="text-sm md:text-base font-medium">분석 보기</div>
                    <div className="text-xs text-gray-500 hidden md:block">상세 통계 확인</div>
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
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(review.platform)}`}>
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
                          <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">아직 등록된 리뷰가 없습니다</p>
                  <Link href="/dashboard/add-review">
                    <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                      첫 리뷰 추가하기
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
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