"use client"

import { useState, useEffect } from "react"
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
  Pencil1Icon,
  TrashIcon,
  MagnifyingGlassIcon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

export default function ReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    platforms: 0,
    fiveStars: 0
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchReviews()
  }, [session])

  useEffect(() => {
    // 필터링 적용
    const filtered = reviews.filter(review => {
      const matchesSearch = 
        review.business.toLowerCase().includes(searchTerm.toLowerCase()) || 
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPlatform = filterPlatform === "all" || review.platform === filterPlatform
      
      return matchesSearch && matchesPlatform
    })
    setFilteredReviews(filtered)
  }, [reviews, searchTerm, filterPlatform])

  const fetchReviews = async () => {
    if (!session) return

    try {
      const res = await fetch("/api/reviews")
      if (res.ok) {
        const data = await res.json()
        const reviewsList = data.reviews || data
        setReviews(reviewsList)
        
        // 통계 계산
        if (reviewsList.length > 0) {
          const total = reviewsList.length
          const avgRating = reviewsList.reduce((sum: number, r: Review) => sum + r.rating, 0) / total
          const platforms = new Set(reviewsList.map((r: Review) => r.platform)).size
          const fiveStars = reviewsList.filter((r: Review) => r.rating === 5).length

          setStats({
            total,
            avgRating: Math.round(avgRating * 10) / 10,
            platforms,
            fiveStars
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      return
    }

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setReviews(reviews.filter(review => review.id !== id))
      } else {
        alert("리뷰 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("리뷰 삭제 중 오류가 발생했습니다.")
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/reviews/edit/${id}`)
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

  const platforms = ["all", ...Array.from(new Set(reviews.map(r => r.platform)))]

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">총 리뷰</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgRating || 0}
                  </p>
                  <p className="text-sm text-gray-600">평균 평점</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.platforms}</p>
                  <p className="text-sm text-gray-600">플랫폼</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.fiveStars}</p>
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
                <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
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
                    <p className="text-gray-500 mb-4">
                      {reviews.length === 0 ? "아직 등록된 리뷰가 없습니다" : "검색 결과가 없습니다"}
                    </p>
                    <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
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
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPlatformColor(review.platform)}`}>
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
                            <span>작성일: {new Date(review.reviewDate).toLocaleDateString()}</span>
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