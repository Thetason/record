"use client"

import { useState, useEffect, Fragment, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface Review {
  id: string
  platform: string
  business: string
  content: string
  author: string
  reviewDate: string
  createdAt: string
  imageUrl?: string | null
  originalUrl?: string | null
  verificationStatus: string
}

export default function ReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "business">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10
  const [shareLink, setShareLink] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    platforms: 0,
    recentWeek: 0,
    requestPending: 0,
    requestTotal: 0
  })
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
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
          const platforms = new Set(
            reviewsList.filter((r: Review) => r.platform).map((r: Review) => r.platform)
          ).size
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          const recentWeek = reviewsList.filter((r: Review) => new Date(r.createdAt) >= sevenDaysAgo).length
          const requestReviews = reviewsList.filter((r: Review) => (r.platform || '').toLowerCase() === 're:cord')
          const requestPending = requestReviews.filter((r: Review) => r.verificationStatus === 'pending').length

          setStats({
            total,
            platforms,
            recentWeek,
            requestPending,
            requestTotal: requestReviews.length
          })
        } else {
          setStats({
            total: 0,
            platforms: 0,
            recentWeek: 0,
            requestPending: 0,
            requestTotal: 0
          })
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
  }, [session])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const username = session?.user?.username
    if (!username) return
    setShareLink(`${window.location.origin}/${username}/review-request`)
  }, [session?.user?.username])

  useEffect(() => {
    // 필터링 및 정렬 적용
    const filtered = reviews.filter(review => {
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
        case "business":
          comparison = a.business.localeCompare(b.business)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredReviews(filtered)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
  }, [reviews, searchTerm, filterPlatform, sortBy, sortOrder])

  const handleCopyLink = async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      toast({
        title: '리뷰 요청 링크가 복사되었습니다',
        description: '고객에게 링크를 전달하면 바로 리뷰를 받을 수 있어요.'
      })
    } catch (error) {
      console.error('copy error:', error)
      toast({
        title: '링크 복사에 실패했습니다',
        description: '브라우저에서 수동으로 주소를 복사해주세요.',
        variant: 'destructive'
      })
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
    <>
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

          {session?.user?.username && (
            <Card className="mb-6 border-dashed border-[#FF6B35]/40 bg-[#FF6B35]/5">
              <CardContent className="py-4 px-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#FF6B35]">리뷰 자동 아카이빙 링크</p>
                  <p className="text-sm text-gray-600 mt-1">
                    고객에게 아래 링크를 보내 직접 리뷰를 받고, 대기 중인 요청을 대시보드에서 검토하세요.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 border border-[#FF6B35]/30">
                    <span className="truncate max-w-[240px] md:max-w-[320px]">
                      {shareLink || '링크 준비 중...'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="whitespace-nowrap"
                      onClick={handleCopyLink}
                      disabled={!shareLink}
                    >
                      링크 복사
                    </Button>
                  </div>
                  <Link
                    href={`/${session.user.username}/review-request`}
                    target="_blank"
                    className="text-xs text-[#FF6B35] underline-offset-2 hover:underline"
                  >
                    링크 미리보기
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">Re:cord 요청</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                    대기 {stats.requestPending}건
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
                  <p className="text-2xl font-bold text-gray-900">{stats.recentWeek}</p>
                  <p className="text-sm text-gray-600">최근 7일 등록</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.requestPending}</p>
                  <p className="text-sm text-gray-600">요청 검토 대기</p>
                  <p className="text-xs text-gray-400 mt-1">누적 {stats.requestTotal}건</p>
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
                    onChange={(e) => setSortBy(e.target.value as "date" | "business")}
                  >
                    <option value="date">날짜</option>
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
                            {review.platform === 'Re:cord' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                                요청 수집
                              </span>
                            )}
                            <span className="text-lg font-semibold">{review.business}</span>
                          </div>
                          
                          {review.imageUrl && (
                            <div className="relative mb-4 max-w-sm overflow-hidden rounded-lg border border-gray-200 group">
                              <Image
                                src={review.imageUrl}
                                alt="리뷰 첨부 이미지"
                                width={640}
                                height={360}
                                className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewImage(review.imageUrl as string)}
                                className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
                                aria-label="리뷰 이미지 크게 보기"
                              >
                                확대 보기
                              </button>
                            </div>
                          )}

                          <p className="text-gray-700 leading-relaxed">
                            {review.content}
                          </p>
                          
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>작성자: {review.author}</span>
                        <span>•</span>
                        <span>작성일: {new Date(review.reviewDate).toLocaleDateString()}</span>
                      </div>

                      {review.imageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-[#FF6B35] hover:text-[#E55A2B] w-auto px-0"
                          onClick={() => setPreviewImage(review.imageUrl as string)}
                        >
                          이미지 미리보기
                        </Button>
                      )}
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

      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>리뷰 첨부 이미지</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="w-full overflow-hidden rounded-lg border">
              <Image src={previewImage} alt="리뷰 첨부 이미지 확대" width={1024} height={768} className="h-auto w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
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
