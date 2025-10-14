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
  UploadIcon,
  ArrowUpIcon,
  CalendarIcon,
  EyeOpenIcon,
  Share2Icon,
  LockClosedIcon
} from "@radix-ui/react-icons"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MobileNav from "@/components/ui/mobile-nav"

interface Review {
  id: string
  platform: string
  business: string
  content: string
  author: string
  reviewDate: string
  createdAt: string
}

interface DashboardStats {
  overview: {
    totalReviews: number
    platforms: number
    thisMonth: number
    profileViews: number
  }
  subscription: {
    plan: string
    planExpiry: string | null
    reviewLimit: number
    reviewsUsed: number
    reviewsRemaining: number | string
  }
  trends: {
    thisWeekReviews: number
    thisMonthReviews: number
    lastMonthReviews: number
    monthlyChange: number
    monthlyTrend: Array<{
      month: string
      count: number
    }>
  }
  distribution: {
    platforms: Record<string, {
      count: number
    }>
  }
  recent: {
    reviews: Review[]
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || `서버 오류 (${res.status})`)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getPlatformColor = (platform: string) => {
    const map: Record<string, string> = {
      '네이버': 'bg-green-100 text-green-800',
      '카카오맵': 'bg-yellow-100 text-yellow-800',
      '카카오': 'bg-yellow-100 text-yellow-800',
      '구글': 'bg-blue-100 text-blue-800',
      '인스타그램': 'bg-pink-100 text-pink-800',
      '인스타': 'bg-pink-100 text-pink-800',
      '당근': 'bg-orange-100 text-orange-700',
      '당근마켓': 'bg-orange-100 text-orange-700',
      'Re:cord': 'bg-[#FF6B35]/10 text-[#FF6B35]',
      're:cord': 'bg-[#FF6B35]/10 text-[#FF6B35]',
      '크몽': 'bg-purple-100 text-purple-800'
    }
    return map[platform] || "bg-gray-100 text-gray-800"
  }

  // 차트 색상
  const platformColors: { [key: string]: string } = {
    "네이버": "#2DB400",
    "카카오맵": "#FAE100",
    "구글": "#4285F4",
    "크몽": "#7C3AED",
    "인스타그램": "#E4405F",
    "당근": "#FF8A3D",
    "Re:cord": "#FF6B35",
    "기타": "#6B7280"
  }

  // 플랫폼별 분포 데이터 준비
  const platformData = stats ? Object.entries(stats.distribution.platforms).map(([name, data]) => ({
    name,
    value: data.count,
    fill: platformColors[name] || platformColors["기타"]
  })) : []

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:border-r md:border-gray-200 md:block">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 px-4 py-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Header Skeleton */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="md:pl-64 pt-16 md:pt-0 pb-20 md:pb-0">
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={fetchDashboardStats}
                className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]"
              >
                다시 시도
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/add-review')}
                variant="outline"
                className="w-full"
              >
                리뷰 추가하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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
          <NavItem icon={<UploadIcon />} label="대량 업로드" href="/dashboard/bulk-upload" />
          <NavItem icon={<PlusIcon />} label="리뷰 추가" href="/dashboard/add-review" />
          <NavItem icon={<Share2Icon />} label="공유하기" href="/dashboard/share" />
          <NavItem icon={<GearIcon />} label="커스터마이즈" href="/dashboard/customize" />
          {(session?.user?.role === 'admin' || session?.user?.role === 'super_admin') && (
            <NavItem icon={<LockClosedIcon />} label="관리자 센터" href="/admin" />
          )}
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
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              안녕하세요, {session?.user?.name || "사용자"}님! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              오늘의 리뷰 현황을 한눈에 확인하세요
            </p>
          </div>

          {/* Subscription Status Card */}
          {stats?.subscription && (
            <Card className="mb-6 border-[#FF6B35]/30 bg-gradient-to-r from-orange-50 to-red-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {
                          stats.subscription.plan === 'free' ? '프리 플랜' :
                          stats.subscription.plan === 'premium' ? '프리미엄 플랜' : 
                          stats.subscription.plan === 'pro' ? '비즈니스 플랜' : '플랜'
                        }
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        stats.subscription.plan === 'free' ? 'bg-gray-100 text-gray-700' :
                        stats.subscription.plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {stats.subscription.plan === 'free' ? 'FREE' : 
                         stats.subscription.plan === 'premium' ? 'PREMIUM' : 'BUSINESS'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {stats.subscription.reviewsUsed}
                        </span>
                        <span className="text-gray-500">/</span>
                        <span className="text-lg font-semibold text-gray-700">
                          {stats.subscription.reviewLimit === -1 ? '∞' : stats.subscription.reviewLimit}
                        </span>
                        <span className="text-sm text-gray-600">리뷰 사용 중</span>
                      </div>
                      
                      {stats.subscription.reviewLimit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all ${
                              (stats.subscription.reviewsUsed / stats.subscription.reviewLimit) >= 0.9 
                                ? 'bg-red-500' 
                                : (stats.subscription.reviewsUsed / stats.subscription.reviewLimit) >= 0.7
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min((stats.subscription.reviewsUsed / stats.subscription.reviewLimit) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        {stats.subscription.reviewLimit !== -1 ? (
                          <span className={`font-medium ${
                            stats.subscription.reviewsRemaining === 0 ? 'text-red-600' :
                            Number(stats.subscription.reviewsRemaining) <= 5 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {stats.subscription.reviewsRemaining === 'unlimited' 
                              ? '무제한' 
                              : `${stats.subscription.reviewsRemaining}개 남음`}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">무제한 리뷰 등록</span>
                        )}
                        
                        {stats.subscription.planExpiry && (
                          <span className="text-gray-500">
                            만료: {new Date(stats.subscription.planExpiry).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {stats.subscription.plan === 'free' && (
                    <div className="md:text-right">
                      <Button 
                        onClick={() => router.push('/pricing')}
                        size="lg"
                        className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#E55A2B] hover:to-[#D54A1B] text-white shadow-lg w-full md:w-auto"
                      >
                        프리미엄으로 업그레이드 →
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        월 100개 리뷰 + 고급 기능
                      </p>
                    </div>
                  )}
                  
                  {stats.subscription.plan === 'premium' && (
                    <div className="md:text-right">
                      <Button 
                        onClick={() => router.push('/pricing')}
                        size="lg"
                        variant="outline"
                        className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white w-full md:w-auto"
                      >
                        비즈니스로 업그레이드 →
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        무제한 리뷰 + 프리미엄 기능
                      </p>
                    </div>
                  )}
                </div>
                
                {stats.subscription.plan === 'free' && stats.subscription.reviewsUsed >= stats.subscription.reviewLimit * 0.8 && (
                  <div className="mt-4 p-4 bg-orange-100 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-900 font-medium">
                      ⚠️ 프리 플랜 한도의 80%를 사용했습니다. 프리미엄 플랜으로 업그레이드하여 월 100개까지 등록하세요!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={<BarChartIcon className="w-5 h-5" />}
              title="총 리뷰"
              value={stats?.overview.totalReviews || 0}
              suffix="개"
              trend={stats?.trends.thisWeekReviews ? `+${stats.trends.thisWeekReviews}` : "0"}
              trendLabel="이번 주"
              color="blue"
            />
            <StatCard
              icon={<UploadIcon className="w-5 h-5" />}
              title="최근 7일 등록"
              value={stats?.trends.thisWeekReviews || 0}
              suffix="개"
              trend=""
              trendLabel="지난 7일"
              color="yellow"
            />
            <StatCard
              icon={<CalendarIcon className="w-5 h-5" />}
              title="이번 달"
              value={stats?.overview.thisMonth || 0}
              suffix="개"
              trend={stats?.trends.monthlyChange ? `${stats.trends.monthlyChange > 0 ? '+' : ''}${stats.trends.monthlyChange}%` : "0%"}
              trendLabel="전월 대비"
              color="green"
            />
            <StatCard
              icon={<ArrowUpIcon className="w-5 h-5" />}
              title="플랫폼"
              value={stats?.overview.platforms || 0}
              suffix="개"
              trend="active"
              trendLabel="연동됨"
              color="purple"
            />
            <StatCard
              icon={<EyeOpenIcon className="w-5 h-5" />}
              title="프로필 조회"
              value={stats?.overview.profileViews || 0}
              suffix="회"
              trend="+12%"
              trendLabel="증가율"
              color="orange"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 월별 리뷰 추이 */}
            <Card>
              <CardHeader>
                <CardTitle>월별 리뷰 추이</CardTitle>
                <CardDescription>최근 6개월간 리뷰 증가 추세</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.trends.monthlyTrend && stats.trends.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.trends.monthlyTrend}>
                      <defs>
                        <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        fill="url(#colorReviews)"
                        name="리뷰 수"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                    <BarChartIcon className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium mb-2">아직 데이터가 없어요</p>
                    <p className="text-xs">리뷰를 추가하면 차트가 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 플랫폼별 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>플랫폼별 분포</CardTitle>
                <CardDescription>리뷰가 등록된 플랫폼 비율</CardDescription>
              </CardHeader>
              <CardContent>
                {platformData && platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                    <ArrowUpIcon className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium mb-2">플랫폼 데이터가 없어요</p>
                    <p className="text-xs">다양한 플랫폼의 리뷰를 추가해보세요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Platform summary row removed */}

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>
                자주 사용하는 기능들을 바로 실행하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Link href="/dashboard/bulk-upload">
                  <Button className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A2B]">
                    <UploadIcon className="w-5 h-5" />
                    <span className="text-sm">이미지로 빠른 등록</span>
                  </Button>
                </Link>
                <Link href="/dashboard/add-review">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50">
                    <UploadIcon className="w-5 h-5" />
                    <span className="text-sm">리뷰 추가</span>
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                    <PersonIcon className="w-5 h-5" />
                    <span className="text-sm">프로필 보기</span>
                  </Button>
                </Link>
                <Link href="/dashboard/reviews">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                    <BarChartIcon className="w-5 h-5" />
                    <span className="text-sm">리뷰 관리</span>
                  </Button>
                </Link>
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
                <Link href="/dashboard/reviews">
                  <Button variant="outline" size="sm">
                    전체 보기
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.recent.reviews && stats.recent.reviews.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(review.platform)}`}>
                            {review.platform}
                          </span>
                          <span className="text-sm font-medium">{review.business}</span>
                        </div>
                        <p className="text-sm text-gray-600 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
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
  icon,
  title, 
  value, 
  suffix, 
  trend, 
  trendLabel,
  color = "blue"
}: {
  icon: React.ReactNode
  title: string
  value: number
  suffix: string
  trend: string
  trendLabel: string
  color?: string
}) {
  const isPositive = trend.startsWith('+')
  const isNegative = trend.startsWith('-')
  
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600"
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${
              isPositive ? 'text-green-600' : 
              isNegative ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {trend !== 'active' && trend !== 'stable' && trend}
            </p>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {value}{suffix}
          </p>
          <p className="text-xs text-gray-600 mt-1">{title}</p>
          <p className="text-xs text-gray-500">{trendLabel}</p>
        </div>
      </CardContent>
    </Card>
  )
}
