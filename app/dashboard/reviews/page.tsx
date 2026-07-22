"use client"

import { useState, useEffect, Fragment, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  HomeIcon,
  PersonIcon,
  BarChartIcon,
  ExitIcon,
  Pencil1Icon,
  TrashIcon,
  MagnifyingGlassIcon,
  Share1Icon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"

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
  isVerified?: boolean
  verifiedBy?: string | null
  isPublic: boolean
  isFeatured: boolean
  featuredAt?: string | null
}

const MAX_FEATURED_REVIEWS = 3

type StatItem = {
  value: number
  label: string
  hint?: string
}

export default function ReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")
  const [requestFilter, setRequestFilter] = useState<"all" | "pending" | "direct">("all")
  const [sortBy, setSortBy] = useState<"date" | "business">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10
  const [shareLink, setShareLink] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    platforms: 0,
    recentWeek: 0,
    requestPending: 0,
    requestTotal: 0
  })
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkUpdatingVisibility, setIsBulkUpdatingVisibility] = useState(false)
  const [processingReviewId, setProcessingReviewId] = useState<string | null>(null)
  const [expandedReviewIds, setExpandedReviewIds] = useState<Set<string>>(new Set())

  const fetchReviews = useCallback(async () => {
    if (!session) return

    try {
      const res = await fetch("/api/reviews?limit=200")
      if (res.ok) {
        const data = await res.json()
        const reviewsList = Array.isArray(data) ? data : (data.reviews || [])
        setReviews(reviewsList)
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
    if (reviews.length === 0) {
      setStats({
        total: 0,
        featured: 0,
        platforms: 0,
        recentWeek: 0,
        requestPending: 0,
        requestTotal: 0
      })
      return
    }

    const total = reviews.length
    const featured = reviews.filter((review) => review.isFeatured).length
    const platforms = new Set(
      reviews.filter((review) => review.platform).map((review) => review.platform)
    ).size
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentWeek = reviews.filter((review) => new Date(review.createdAt) >= sevenDaysAgo).length
    const requestReviews = reviews.filter((review) => (review.platform || '').toLowerCase() === 're:cord')
    const requestPending = requestReviews.filter((review) => review.verificationStatus === 'pending').length

    setStats({
      total,
      featured,
      platforms,
      recentWeek,
      requestPending,
      requestTotal: requestReviews.length
    })
  }, [reviews])

  useEffect(() => {
    // 필터링 및 정렬 적용
    const filtered = reviews.filter(review => {
      const matchesSearch =
        review.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPlatform = filterPlatform === "all" || review.platform === filterPlatform
      const isDirectReview = (review.platform || '').toLowerCase() === 're:cord'
      const matchesRequestFilter =
        requestFilter === "all" ||
        (requestFilter === "pending" && isDirectReview && review.verificationStatus === 'pending') ||
        (requestFilter === "direct" && isDirectReview)

      return matchesSearch && matchesPlatform && matchesRequestFilter
    })

    // 정렬 적용
    filtered.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1
      }

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
  }, [reviews, searchTerm, filterPlatform, requestFilter, sortBy, sortOrder])

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

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedReviews.size === paginatedReviews.length) {
      setSelectedReviews(new Set())
    } else {
      setSelectedReviews(new Set(paginatedReviews.map(r => r.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedReviews.size === 0) return
    
    if (!confirm(`선택한 ${selectedReviews.size}개의 리뷰를 삭제하시겠습니까?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const deletePromises = Array.from(selectedReviews).map(id =>
        fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      setReviews(reviews.filter(review => !selectedReviews.has(review.id)))
      setSelectedReviews(new Set())
      
      toast({
        title: '삭제 완료',
        description: `${deletePromises.length}개의 리뷰가 삭제되었습니다.`
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: '삭제 실패',
        description: '일부 리뷰 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const updateReviewVisibility = useCallback(async (reviewIds: string[], isPublic: boolean) => {
    if (reviewIds.length === 0) return { success: 0, failed: 0 }

    const results = await Promise.allSettled(
      reviewIds.map(async (id) => {
        const res = await fetch(`/api/reviews/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic })
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || data?.error || "공개 상태 변경 실패")
        }
        return await res.json()
      })
    )

    const updatedReviews = results
      .filter((r): r is PromiseFulfilledResult<Review> => r.status === "fulfilled")
      .map((r) => r.value)

    if (updatedReviews.length > 0) {
      const updatedReviewMap = new Map(updatedReviews.map((review) => [review.id, review]))
      setReviews(prev =>
        prev.map(review =>
          updatedReviewMap.has(review.id)
            ? { ...review, ...updatedReviewMap.get(review.id) }
            : review
        )
      )
    }

    return { success: updatedReviews.length, failed: reviewIds.length - updatedReviews.length }
  }, [])

  const handlePublishAll = async () => {
    const privateIds = reviews.filter(review => !review.isPublic).map(review => review.id)
    if (privateIds.length === 0) {
      toast({
        title: "전환할 리뷰가 없습니다",
        description: "모든 리뷰가 이미 공개 상태입니다."
      })
      return
    }

    if (!confirm(`비공개 리뷰 ${privateIds.length}개를 공개로 전환할까요?`)) {
      return
    }

    setIsBulkUpdatingVisibility(true)
    try {
      const result = await updateReviewVisibility(privateIds, true)
      if (result.failed > 0) {
        toast({
          title: `일괄 공개 부분 완료 (${result.success}/${privateIds.length})`,
          description: `${result.failed}개 리뷰는 전환에 실패했습니다.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "일괄 공개 완료",
          description: `${result.success}개의 리뷰를 공개 상태로 전환했습니다.`
        })
      }
    } catch (error) {
      console.error("Bulk publish error:", error)
      toast({
        title: "일괄 공개 실패",
        description: error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsBulkUpdatingVisibility(false)
    }
  }

  const handleSelectedVisibility = async (isPublic: boolean) => {
    const selectedIds = Array.from(selectedReviews)
    if (selectedIds.length === 0) return

    setIsBulkUpdatingVisibility(true)
    try {
      const result = await updateReviewVisibility(selectedIds, isPublic)
      if (result.failed > 0) {
        toast({
          title: `선택 ${isPublic ? "공개" : "비공개"} 부분 완료 (${result.success}/${selectedIds.length})`,
          description: `${result.failed}개 리뷰는 처리에 실패했습니다.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: `선택 리뷰 ${isPublic ? "공개" : "비공개"} 완료`,
          description: `${result.success}개의 리뷰 상태를 변경했습니다.`
        })
      }
    } catch (error) {
      console.error("Selected visibility update error:", error)
      toast({
        title: "상태 변경 실패",
        description: error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsBulkUpdatingVisibility(false)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/reviews/edit/${id}`)
  }

  const handleToggleReviewVisibility = async (review: Review) => {
    setIsBulkUpdatingVisibility(true)
    try {
      const nextPublic = !review.isPublic
      const result = await updateReviewVisibility([review.id], nextPublic)
      if (result.failed > 0) {
        toast({
          title: "공개 상태 변경 실패",
          description: "잠시 후 다시 시도해주세요.",
          variant: "destructive"
        })
        return
      }
      toast({
        title: `리뷰를 ${nextPublic ? "공개" : "비공개"}로 전환했습니다`
      })
    } catch (error) {
      console.error("Single visibility update error:", error)
      toast({
        title: "공개 상태 변경 실패",
        description: error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsBulkUpdatingVisibility(false)
    }
  }

  const handleReviewModeration = async (
    review: Review,
    nextStatus: 'approved' | 'rejected'
  ) => {
    setProcessingReviewId(review.id)
    try {
      const approving = nextStatus === 'approved'
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: nextStatus,
          verificationNote: approving
            ? 'Owner approved direct review for public profile.'
            : 'Owner rejected direct review submission.',
          isVerified: approving,
          isPublic: approving,
          verifiedBy: approving ? 'owner' : null,
          verifiedAt: approving ? new Date().toISOString() : null
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || data?.error || '검토 처리 실패')
      }

      const updated = await res.json()
      setReviews(prev => prev.map(item => item.id === review.id ? { ...item, ...updated } : item))

      toast({
        title: approving ? '직접 후기를 승인하고 공개했습니다' : '직접 후기를 비공개 보류했습니다',
        description: approving
          ? '이제 공개 프로필의 직접 후기 섹션에 노출됩니다.'
          : '필요하면 수정 후 다시 검토할 수 있습니다.'
      })
    } catch (error) {
      console.error('Moderation error:', error)
      toast({
        title: '검토 처리 실패',
        description: error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setProcessingReviewId(null)
    }
  }

  const handleToggleFeatured = async (review: Review) => {
    const nextFeatured = !review.isFeatured

    if (nextFeatured && !review.isPublic) {
      toast({
        title: '대표 후기 선택 불가',
        description: '대표 후기는 공개 상태의 리뷰만 선택할 수 있습니다.',
        variant: 'destructive'
      })
      return
    }

    if (nextFeatured && review.verificationStatus !== 'approved') {
      toast({
        title: '대표 후기 선택 불가',
        description: '대표 후기는 승인 완료된 리뷰만 선택할 수 있습니다.',
        variant: 'destructive'
      })
      return
    }

    if (nextFeatured && stats.featured >= MAX_FEATURED_REVIEWS) {
      toast({
        title: '대표 후기 한도 초과',
        description: `대표 후기는 최대 ${MAX_FEATURED_REVIEWS}개까지 선택할 수 있습니다.`,
        variant: 'destructive'
      })
      return
    }

    setProcessingReviewId(review.id)
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || data?.error || '대표 후기 상태 변경 실패')
      }

      const updated = await res.json()
      setReviews(prev => prev.map(item => item.id === review.id ? { ...item, ...updated } : item))

      toast({
        title: nextFeatured ? '대표 후기에 추가했습니다' : '대표 후기에서 제외했습니다',
        description: nextFeatured
          ? '공개 프로필 상단에서 먼저 보이도록 정렬됩니다.'
          : '후기 목록에는 그대로 남고 우선 노출만 해제됩니다.'
      })
    } catch (error) {
      console.error('Featured review toggle error:', error)
      toast({
        title: '대표 후기 상태 변경 실패',
        description: error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setProcessingReviewId(null)
    }
  }

  const handleToggleExpandedReview = (reviewId: string) => {
    setExpandedReviewIds((prev) => {
      const next = new Set(prev)
      if (next.has(reviewId)) {
        next.delete(reviewId)
      } else {
        next.add(reviewId)
      }
      return next
    })
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
  const privateReviewCount = reviews.filter(review => !review.isPublic).length
  const featuredLimitReached = stats.featured >= MAX_FEATURED_REVIEWS
  const statItems: StatItem[] = [
    { value: stats.total, label: "총 리뷰" },
    { value: stats.recentWeek, label: "최근 7일 등록" },
    { value: stats.platforms, label: "플랫폼" },
    { value: stats.featured, label: "대표 후기", hint: `최대 ${MAX_FEATURED_REVIEWS}개` },
    { value: stats.requestPending, label: "검토 대기", hint: `누적 ${stats.requestTotal}건` },
  ]

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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35]">*</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-[#FF6B35]">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (Desktop Only) */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
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
            <NavItem icon={<HomeIcon />} label="작업실" href="/dashboard" />
            <NavItem icon={<BarChartIcon />} label="대표 후기" href="/dashboard/reviews" active />
            <NavItem icon={<PersonIcon />} label="내 링크" href="/dashboard/profile" />
            <NavItem icon={<Share1Icon />} label="공유하기" href="/dashboard/share" />
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
      <div className="md:pl-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">대표 후기 정리</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              새 고객이 먼저 읽게 될 후기 순서와 공개 상태를 여기서 정리하세요
            </p>
          </div>

          <Card className="mb-4 border border-[#f2dfd6] bg-[#fffaf7] shadow-sm md:mb-5">
            <CardContent className="px-3 py-3 md:px-5 md:py-5">
              <div className="md:hidden space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#FF6B35]">리뷰는 두 가지 방식으로 추가합니다</p>
                    <p className="mt-1 text-[12px] leading-5 text-gray-600">
                      처음엔 가져와 채우고, 이후엔 Re:cord 링크로 직접 받아 계속 쌓으세요.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#FF6B35]/25 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    대기 {stats.requestPending}건
                  </span>
                </div>

                <div className="grid gap-2.5">
                  <div className="rounded-2xl border border-[#eadfd7] bg-white px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-slate-900">기존 플랫폼 리뷰 옮기기</p>
                      <span className="rounded-full bg-[#fff3ec] px-2 py-0.5 text-[10px] font-medium text-[#C76243]">빠른 시작</span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-5 text-slate-600">
                      리뷰 화면을 쭉 스크롤 캡처해서 올리면 여러 개를 한 번에 정리해 드려요.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button asChild size="sm" className="h-8 bg-[#FF6B35] px-3 text-xs hover:bg-[#E55A2B]">
                        <Link href="/dashboard/import">한 번에 가져오기</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs">
                        <Link href="/dashboard/bulk-upload">한 장씩 / CSV</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#eadfd7] bg-white px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-slate-900">Re:cord에서 직접 리뷰 받기</p>
                      <span className="rounded-full bg-[#fff3ec] px-2 py-0.5 text-[10px] font-medium text-[#C76243]">계속 쌓기</span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-5 text-slate-600">
                      고객에게 링크를 보내고, 들어온 후기만 검토 후 공개하세요.
                    </p>
                    {session?.user?.username && (
                      <>
                        <div className="mt-2.5 rounded-xl border border-[#FF6B35]/15 bg-[#fcfaf8] px-3 py-2 text-[11px] font-medium text-gray-700">
                          <div className="truncate">{shareLink || "링크 준비 중..."}</div>
                        </div>
                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[11px] whitespace-nowrap"
                            onClick={handleCopyLink}
                            disabled={!shareLink}
                          >
                            링크 복사
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-[11px] whitespace-nowrap"
                            onClick={() => {
                              setFilterPlatform("all")
                              setRequestFilter("pending")
                            }}
                          >
                            검토 보기
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="h-8 px-1 text-[11px] text-[#FF6B35] hover:text-[#E55A2B]">
                            <Link href={`/${session.user.username}/review-request`} target="_blank">
                              미리보기
                            </Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex md:flex-col md:gap-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-[#FF6B35]">리뷰는 두 가지 방식으로 추가합니다</p>
                    <p className="mt-1 text-xs leading-5 text-gray-600 md:text-sm md:leading-6">
                      처음에는 기존 플랫폼 리뷰를 가져와 프로필을 채우고, 이후에는 Re:cord 링크로 직접 후기를 받아 계속 쌓아가세요.
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-600 border border-[#FF6B35]/30">
                    직접 받은 후기 대기 {stats.requestPending}건
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#eadfd7] bg-white p-3 md:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">1. 기존 플랫폼 리뷰 옮기기</p>
                      <span className="rounded-full bg-[#fff3ec] px-2 py-1 text-[11px] font-medium text-[#C76243]">빠른 시작</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-600 md:text-sm md:leading-6">
                      네이버, 당근, 숨고, 크몽에 흩어진 리뷰를 스크린샷이나 링크로 먼저 가져오세요.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                        <Link href="/dashboard/import">리뷰 옮기기 시작</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#eadfd7] bg-white p-3 md:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">2. Re:cord에서 직접 리뷰 받기</p>
                      <span className="rounded-full bg-[#fff3ec] px-2 py-1 text-[11px] font-medium text-[#C76243]">계속 쌓기</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-600 md:text-sm md:leading-6">
                      고객에게 리뷰 요청 링크를 보내고, 들어온 후기만 검토해서 공개하세요.
                    </p>
                    {session?.user?.username && (
                      <>
                        <div className="mt-3 rounded-xl border border-[#FF6B35]/20 bg-[#fcfaf8] px-3 py-2 text-xs font-medium text-gray-700 md:text-sm">
                          <div className="truncate">{shareLink || "링크 준비 중..."}</div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap"
                            onClick={handleCopyLink}
                            disabled={!shareLink}
                          >
                            링크 복사
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFilterPlatform("all")
                              setRequestFilter("pending")
                            }}
                          >
                            검토 대기 보기
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="col-span-2 h-auto justify-start px-0 text-[#FF6B35] hover:text-[#E55A2B] sm:col-span-1">
                            <Link href={`/${session.user.username}/review-request`} target="_blank">
                              링크 미리보기
                            </Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="mb-5 md:hidden">
            <div className="grid grid-cols-6 gap-2">
              {statItems.map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm ${
                    index < 3 ? "col-span-2" : "col-span-3"
                  }`}
                >
                  <p className="text-lg font-bold tracking-[-0.04em] text-gray-900">{item.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium leading-4 text-gray-600">{item.label}</p>
                  {item.hint && <p className="mt-0.5 text-[10px] leading-4 text-gray-400">{item.hint}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 hidden gap-6 md:grid md:grid-cols-5">
            {statItems.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    {item.hint && <p className="mt-1 text-xs text-gray-400">{item.hint}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-6 border-gray-200 shadow-sm md:mb-8">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-xl">필터 & 검색</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 md:space-y-4">
                {/* 검색 및 필터 */}
                <div className="flex flex-col gap-2.5 md:flex-row md:gap-4">
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
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                  >
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>
                        {platform === "all" ? "모든 플랫폼" : platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                  <Button asChild className="h-9 bg-[#FF6B35] text-xs hover:bg-[#E55A2B] md:text-sm">
                    <Link href="/dashboard/share">
                      <Share1Icon className="mr-2 h-4 w-4" />
                      공유 화면 열기
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-9 text-xs md:text-sm">
                    <Link href="/dashboard/import">
                      스크린샷으로 추가
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="col-span-2 h-9 text-xs md:col-span-1 md:text-sm"
                    onClick={handlePublishAll}
                    disabled={isBulkUpdatingVisibility || privateReviewCount === 0}
                  >
                    {isBulkUpdatingVisibility
                      ? "처리 중..."
                      : `전체 공개 전환 (${privateReviewCount})`}
                  </Button>
                </div>
                
                {/* 정렬 옵션 */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  <span className="text-sm font-medium text-gray-700">정렬:</span>
                  <div className="flex gap-2">
                    <select
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] md:flex-none md:py-1"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "date" | "business")}
                    >
                      <option value="date">날짜</option>
                      <option value="business">업체명</option>
                    </select>
                    <select
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] md:flex-none md:py-1"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    >
                      <option value="desc">내림차순</option>
                      <option value="asc">오름차순</option>
                    </select>
                  </div>
                  <span className="text-xs text-gray-500 md:ml-auto md:text-sm">
                    총 {filteredReviews.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)}개 표시
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">직접 후기 필터:</span>
                  <Button
                    type="button"
                    variant={requestFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRequestFilter("all")}
                    className={requestFilter === "all" ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                  >
                    전체
                  </Button>
                  <Button
                    type="button"
                    variant={requestFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRequestFilter("pending")}
                    className={requestFilter === "pending" ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                  >
                    검토 대기
                  </Button>
                  <Button
                    type="button"
                    variant={requestFilter === "direct" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRequestFilter("direct")}
                    className={requestFilter === "direct" ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                  >
                    직접 받은 후기
                  </Button>
                  <span className="w-full text-xs text-gray-500 md:ml-auto md:w-auto">
                    대표 후기는 공개 프로필에서 가장 먼저 보입니다.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  리뷰 목록 ({filteredReviews.length}개)
                </CardTitle>
                {selectedReviews.size > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedReviews.size}개 선택됨
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectedVisibility(true)}
                      disabled={isBulkUpdatingVisibility}
                    >
                      선택 공개
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectedVisibility(false)}
                      disabled={isBulkUpdatingVisibility}
                    >
                      선택 비공개
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReviews(new Set())}
                    >
                      선택 해제
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={isDeleting || isBulkUpdatingVisibility}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      선택 삭제
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReviews.length > 0 && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <input
                      type="checkbox"
                      checked={selectedReviews.size === paginatedReviews.length && paginatedReviews.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      전체 선택 ({paginatedReviews.length}개)
                    </span>
                  </div>
                )}
                
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {reviews.length === 0 ? "아직 등록된 리뷰가 없습니다" : "검색 결과가 없습니다"}
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                      <Button asChild className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                        <Link href="/dashboard/share">
                          리뷰 요청 링크 보내기
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/dashboard/import">
                          스크린샷으로 첫 후기 추가
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  paginatedReviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border p-4 transition-shadow hover:shadow-md md:p-6">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedReviews.has(review.id)}
                          onChange={() => handleSelectReview(review.id)}
                          className="mt-1 w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPlatformColor(review.platform)}`}>
                              {review.platform}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                review.isPublic
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {review.isPublic ? "공개" : "비공개"}
                            </span>
                            {review.platform === 'Re:cord' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                                요청 수집
                              </span>
                            )}
                            {review.isFeatured && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#1f1720] text-white">
                                대표 후기
                              </span>
                            )}
                            {review.verificationStatus === 'pending' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                                검토 대기
                              </span>
                            )}
                            {review.verificationStatus === 'approved' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                승인 완료
                              </span>
                            )}
                            {review.verificationStatus === 'rejected' && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                                보류됨
                              </span>
                            )}
                          </div>

                          <p className="text-base font-semibold text-gray-900 break-words">
                            {review.business}
                          </p>
                          
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                          <p
                            className="text-sm leading-6 text-gray-700 md:text-base"
                            style={
                              expandedReviewIds.has(review.id)
                                ? undefined
                                : {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 5,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }
                            }
                          >
                            {review.content}
                          </p>
                          {review.content.length > 180 && (
                            <button
                              type="button"
                              onClick={() => handleToggleExpandedReview(review.id)}
                              className="mt-2 text-sm font-medium text-[#FF6B35] hover:text-[#E55A2B]"
                            >
                              {expandedReviewIds.has(review.id) ? '접기' : '더 보기'}
                            </button>
                          )}
                            </div>

                          {review.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(review.imageUrl as string)}
                              className="group relative w-full overflow-hidden rounded-2xl border border-gray-200 sm:w-28 sm:shrink-0"
                              aria-label="리뷰 이미지 크게 보기"
                            >
                              <Image
                                src={review.imageUrl}
                                alt="리뷰 첨부 이미지"
                                width={320}
                                height={240}
                                className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-700 shadow-sm">
                                확대
                              </span>
                            </button>
                          )}
                          </div>
                          
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 md:text-sm">
                        <span>작성자: {review.author}</span>
                        <span>•</span>
                        <span>작성일: {new Date(review.reviewDate).toLocaleDateString()}</span>
                      </div>

                      {review.originalUrl && (
                        <Button asChild variant="ghost" size="sm" className="mt-1 w-auto px-0 text-[#FF6B35] hover:text-[#E55A2B]">
                          <a href={review.originalUrl} target="_blank" rel="noreferrer">
                            원문 링크 열기
                          </a>
                        </Button>
                      )}
                          </div>
                          
                          <div className="flex gap-2 overflow-x-auto pb-1 lg:ml-4 lg:w-auto lg:flex-wrap">
                            {review.platform === 'Re:cord' && review.verificationStatus === 'pending' && (
                              <Fragment>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReviewModeration(review, 'approved')}
                                  disabled={processingReviewId === review.id || isBulkUpdatingVisibility}
                                  className="whitespace-nowrap"
                                >
                                  승인 후 공개
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReviewModeration(review, 'rejected')}
                                  disabled={processingReviewId === review.id || isBulkUpdatingVisibility}
                                  className="whitespace-nowrap"
                                >
                                  비공개 보류
                                </Button>
                              </Fragment>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleFeatured(review)}
                              disabled={
                                processingReviewId === review.id ||
                                isBulkUpdatingVisibility ||
                                (!review.isFeatured && (
                                  !review.isPublic ||
                                  review.verificationStatus !== 'approved' ||
                                  featuredLimitReached
                                ))
                              }
                              title={
                                review.isFeatured
                                  ? '대표 후기에서 제외'
                                  : !review.isPublic
                                    ? '대표 후기는 공개 상태의 리뷰만 선택할 수 있습니다.'
                                    : review.verificationStatus !== 'approved'
                                      ? '대표 후기는 승인 완료된 리뷰만 선택할 수 있습니다.'
                                      : featuredLimitReached
                                        ? `대표 후기는 최대 ${MAX_FEATURED_REVIEWS}개까지 선택할 수 있습니다.`
                                        : '대표 후기로 선택'
                              }
                              className={review.isFeatured ? "border-[#1f1720] bg-[#1f1720] text-white hover:bg-[#1f1720]/90 hover:text-white" : ""}
                            >
                              {review.isFeatured ? "대표 해제" : "대표 선택"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleReviewVisibility(review)}
                              disabled={isBulkUpdatingVisibility || processingReviewId === review.id}
                              className="whitespace-nowrap"
                            >
                              {review.isPublic ? "비공개" : "공개"}
                            </Button>
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
                                  className="whitespace-nowrap text-red-600 hover:text-red-700 text-xs"
                                >
                                  확인
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                onClick={handleCancelDelete}
                                  className="whitespace-nowrap text-gray-600 hover:text-gray-700 text-xs"
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
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
