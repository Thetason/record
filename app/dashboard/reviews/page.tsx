"use client"

import { useState, useEffect, Fragment } from "react"
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
  const [sortBy, setSortBy] = useState<"date" | "rating" | "business">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    platforms: 0,
    fiveStars: 0
  })
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchReviews()
  }, [session])

  useEffect(() => {
    // 필터링 및 정렬 적용
    let filtered = reviews.filter(review => {
      const matchesSearch = 
        review.business.toLowerCase().includes(searchTerm.toLowerCase()) || 
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPlatform = filterPlatform === "all" || review.platform === filterPlatform
      
      return matchesSearch && matchesPlatform
    })

    // 정렬 적용
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
          break
        case "rating":
          comparison = a.rating - b.rating
          break
        case "business":
          comparison = a.business.localeCompare(b.business)
          break
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })
    
    setFilteredReviews(filtered)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
  }, [reviews, searchTerm, filterPlatform, sortBy, sortOrder])

  const fetchReviews = async () => {
    if (!session) return

    try {
      const res = await fetch("/api/reviews")
      if (res.ok) {
        const data = await res.json()
        const reviewsList = Array.isArray(data) ? data : (data.reviews || [])
        setReviews(reviewsList)
        
        // 통계 계산
        if (reviewsList.length > 0) {
          const total = reviewsList.length
          const validReviews = reviewsList.filter((r: Review) => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5)
          const avgRating = validReviews.length > 0 
            ? validReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / validReviews.length 
            : 0
          const platforms = new Set(reviewsList.filter((r: Review) => r.platform).map((r: Review) => r.platform)).size
          const fiveStars = reviewsList.filter((r: Review) => r.rating === 5).length

          setStats({
            total,
            avgRating: Math.round(avgRating * 10) / 10,
            platforms,
            fiveStars
          })
        } else {
          setStats({
            total: 0,
            avgRating: 0,
            platforms: 0,
            fiveStars: 0
          })
        }
      }
      } else {
        console.error("Failed to fetch reviews:", res.statusText)
        setReviews([])
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeletingReviewId(id)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setReviews(reviews.filter(review => review.id !== id))
        setDeletingReviewId(null)
        // 성공적으로 삭제되었다는 피드백을 위해 아주 짧은 알림 표시
        setTimeout(() => {
          // 여기에 토스트 알림을 추가할 수 있습니다
        }, 100)
      } else {
        const errorData = await res.json()
        alert(errorData.message || "리뷰 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("리뷰 삭제 중 오류가 발생했습니다.")
    }
  }

  const handleCancelDelete = () => {
    setDeletingReviewId(null)
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
      "크몽": "bg-purple-100 text-purple-800",
      "인스타그램": "bg-pink-100 text-pink-800"
    }
    return colors[platform] || "bg-gray-100 text-gray-800"
  }

  const platforms = ["all", ...Array.from(new Set(reviews.map(r => r.platform)))]

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex)

  // 페이지 버튼 배열 생성
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }
    
    return pages
  }

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
              <div className="space-y-4">
                {/* 검색 및 필터 */}
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
                
                {/* 정렬 옵션 */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">정렬:</span>
                  <select
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "business")}
                  >
                    <option value="date">날짜</option>
                    <option value="rating">평점</option>
                    <option value="business">업체명</option>
                  </select>
                  <select
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  >
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                  <span className="text-sm text-gray-500 ml-auto">
                    총 {filteredReviews.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)}개 표시
                  </span>
                </div>
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
                  paginatedReviews.map((review) => (
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
                          {deletingReviewId === review.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(review.id)}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                확인
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelDelete}
                                className="text-gray-600 hover:text-gray-700 text-xs"
                              >
                                취소
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(review.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>
                  
                  {getPageNumbers().map((page, index) => (
                    <Fragment key={index}>
                      {page === "..." ? (
                        <span className="px-2 text-gray-400">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className={currentPage === page ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                        >
                          {page}
                        </Button>
                      )}
                    </Fragment>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>
                </div>
              )}
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