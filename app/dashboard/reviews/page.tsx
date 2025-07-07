'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, PlatformBadge } from '@/components/ui/Badge'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'
import { reviewApi } from '@/lib/api'
import type { Review } from '@/types/database'
import { PLATFORMS } from '@/types/database'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Star, 
  Calendar,
  ExternalLink,
  MoreVertical,
  Grid3X3,
  List
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortBy = 'created_at' | 'display_order' | 'rating' | 'reviewer_name'
type SortOrder = 'asc' | 'desc'

export default function ReviewsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useToast()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('display_order')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const loadReviews = async () => {
    try {
      setLoading(true)
      const result = await reviewApi.getCurrent()
      
      if (result.success && result.data) {
        setReviews(result.data)
      } else {
        error('리뷰 로드 실패', result.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error loading reviews:', err)
      error('리뷰 로드 실패', '네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortReviews = () => {
    let filtered = [...reviews]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.review_text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Platform filter
    if (selectedPlatform) {
      filtered = filtered.filter(review => review.source === selectedPlatform)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'display_order':
          aValue = a.display_order
          bValue = b.display_order
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'reviewer_name':
          aValue = a.reviewer_name.toLowerCase()
          bValue = b.reviewer_name.toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredReviews(filtered)
  }

  useEffect(() => {
    loadReviews()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterAndSortReviews()
  }, [reviews, searchQuery, selectedPlatform, sortBy, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleVisibility = async (review: Review) => {
    try {
      const result = await reviewApi.toggleVisibility(review.id, review.is_visible)
      
      if (result.success) {
        setReviews(prev =>
          prev.map(r =>
            r.id === review.id
              ? { ...r, is_visible: !r.is_visible }
              : r
          )
        )
        success(
          review.is_visible ? '리뷰가 숨겨졌습니다' : '리뷰가 공개되었습니다',
          '변경사항이 프로필에 즉시 반영됩니다.'
        )
      } else {
        error('상태 변경 실패', result.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error toggling visibility:', err)
      error('상태 변경 실패', '네트워크 오류가 발생했습니다.')
    }
  }

  const deleteReview = async (review: Review) => {
    const confirmed = window.confirm(
      `${review.reviewer_name}님의 리뷰를 삭제하시겠습니까?\n삭제된 리뷰는 복구할 수 없습니다.`
    )
    
    if (!confirmed) return
    
    try {
      const result = await reviewApi.delete(review.id)
      
      if (result.success) {
        setReviews(prev => prev.filter(r => r.id !== review.id))
        success('리뷰가 삭제되었습니다', '리뷰가 성공적으로 삭제되었습니다.')
      } else {
        error('리뷰 삭제 실패', result.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      error('리뷰 삭제 실패', '네트워크 오류가 발생했습니다.')
    }
  }


  const platformOptions = [
    { value: '', label: '모든 플랫폼' },
    ...PLATFORMS.map(platform => ({ value: platform, label: platform }))
  ]

  const sortOptions = [
    { value: 'display_order', label: '표시 순서' },
    { value: 'created_at', label: '생성일' },
    { value: 'rating', label: '평점' },
    { value: 'reviewer_name', label: '리뷰어 이름' }
  ]

  // Redirect if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  const visibleReviewsCount = reviews.filter(r => r.is_visible).length
  const hiddenReviewsCount = reviews.length - visibleReviewsCount

  const renderReviewCard = (review: Review) => (
    <Card key={review.id} className={`relative group ${!review.is_visible ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
              {review.reviewer_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {review.reviewer_name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <PlatformBadge platform={review.source as any} />
                {review.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{review.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!review.is_visible && (
              <Badge variant="outline" className="text-xs">
                숨김
              </Badge>
            )}
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(review)}
                className="h-8 w-8 p-0"
              >
                {review.is_visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 w-8 p-0"
              >
                <Link href={`/dashboard/edit-review/${review.id}`}>
                  <Edit3 className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteReview(review)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {review.review_text}
        </p>
        {review.external_link && (
          <div className="mt-3">
            <Button variant="ghost" size="sm" className="gap-1 h-6 px-2 text-xs" asChild>
              <a href={review.external_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                원본 보기
              </a>
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
          <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
          <span>순서: {review.display_order}</span>
        </div>
      </CardContent>
    </Card>
  )

  const renderReviewRow = (review: Review) => (
    <Card key={review.id} className={`p-4 ${!review.is_visible ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {review.reviewer_name[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
            <PlatformBadge platform={review.source as any} />
            {review.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{review.rating}</span>
              </div>
            )}
            {!review.is_visible && (
              <Badge variant="outline" className="text-xs">
                숨김
              </Badge>
            )}
          </div>
          <p className="text-gray-700 text-sm line-clamp-2">{review.review_text}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:block">
            {new Date(review.created_at).toLocaleDateString('ko-KR')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleVisibility(review)}
            className="h-8 w-8 p-0"
          >
            {review.is_visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <Link href={`/dashboard/edit-review/${review.id}`}>
              <Edit3 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Container>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <Container>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">리뷰 관리</h1>
                <p className="text-gray-600 mt-1">
                  총 {reviews.length}개 리뷰 (공개 {visibleReviewsCount}개, 숨김 {hiddenReviewsCount}개)
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link href="/dashboard/add-review">
                  <Plus className="h-4 w-4" />
                  새 리뷰 추가
                </Link>
              </Button>
            </div>

            {/* Filters and Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="리뷰어 이름이나 리뷰 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      options={platformOptions}
                      className="w-32"
                    />
                    
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      options={sortOptions}
                      className="w-32"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>

                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none border-0 px-3"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none border-0 px-3"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {filteredReviews.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  {reviews.length === 0 ? (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        아직 리뷰가 없습니다
                      </h3>
                      <p className="text-gray-600 mb-6">
                        첫 번째 리뷰를 추가하여 포트폴리오를 시작해보세요
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/add-review">
                          첫 리뷰 추가하기
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        검색 결과가 없습니다
                      </h3>
                      <p className="text-gray-600">
                        다른 검색어나 필터를 시도해보세요
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredReviews.map(review => 
                  viewMode === 'grid' ? renderReviewCard(review) : renderReviewRow(review)
                )}
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  )
}