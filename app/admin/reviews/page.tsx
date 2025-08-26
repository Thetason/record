'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Filter,
  Eye,
  Shield,
  Clock,
  Flag
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Review {
  id: string
  platform: string
  business: string
  rating: number
  content: string
  author: string
  reviewDate: string
  imageUrl?: string
  verificationStatus: string
  qualityScore?: number
  user: {
    username: string
    email: string
  }
  createdAt: string
  _count: {
    reports: number
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected, flagged
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/reviews?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReviewStatus = async (reviewId: string, status: string, note?: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationStatus: status,
          verificationNote: note 
        })
      })

      if (res.ok) {
        fetchReviews()
        setSelectedReview(null)
      }
    } catch (error) {
      console.error('Failed to update review:', error)
    }
  }

  const calculateQualityScore = (review: Review) => {
    let score = 50 // 기본 점수
    
    // 리뷰 길이에 따른 점수
    if (review.content.length > 200) score += 20
    else if (review.content.length > 100) score += 10
    
    // 이미지가 있으면 가산점
    if (review.imageUrl) score += 20
    
    // 평점이 극단적이지 않으면 가산점
    if (review.rating >= 2 && review.rating <= 4) score += 10
    
    return Math.min(score, 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        )
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            승인됨
          </span>
        )
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            거부됨
          </span>
        )
      case 'flagged':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
            <Flag className="w-3 h-3" />
            신고됨
          </span>
        )
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case '네이버':
        return 'bg-green-100 text-green-700'
      case '카카오':
        return 'bg-yellow-100 text-yellow-700'
      case '인스타':
      case '인스타그램':
        return 'bg-purple-100 text-purple-700'
      case '구글':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (searchTerm) {
      return review.content.includes(searchTerm) || 
             review.business.includes(searchTerm) ||
             review.user.username.includes(searchTerm)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">리뷰 데이터 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">리뷰 검증 관리</h1>
          <p className="text-gray-600">업로드된 리뷰를 검토하고 승인/거부를 결정합니다</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">대기중</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reviews.filter(r => r.verificationStatus === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">승인됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {reviews.filter(r => r.verificationStatus === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">거부됨</p>
                <p className="text-2xl font-bold text-red-600">
                  {reviews.filter(r => r.verificationStatus === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">신고됨</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reviews.filter(r => r._count.reports > 0).length}
                </p>
              </div>
              <Flag className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* 필터와 검색 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              대기중
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              승인됨
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
            >
              거부됨
            </Button>
            <Button
              variant={filter === 'flagged' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('flagged')}
            >
              신고됨
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="리뷰 내용, 업체명, 사용자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>

        {/* 리뷰 목록 */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  {review.imageUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={review.imageUrl}
                        alt="리뷰 이미지"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(review.platform)}`}>
                        {review.platform}
                      </span>
                      {getStatusBadge(review.verificationStatus)}
                      {review._count.reports > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          <AlertCircle className="w-3 h-3" />
                          신고 {review._count.reports}건
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        품질점수: {review.qualityScore || calculateQualityScore(review)}점
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{review.business}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>⭐ {review.rating}</span>
                      <span>{review.author}</span>
                      <span>{new Date(review.reviewDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2 mb-2">{review.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>업로더: {review.user.username}</span>
                      <span>업로드: {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ko })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReview(review)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    상세보기
                  </Button>
                  
                  {review.verificationStatus === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        거부
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </Card>
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">리뷰 상세 정보</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedReview(null)}
              >
                ✕
              </Button>
            </div>
            
            {selectedReview.imageUrl && (
              <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={selectedReview.imageUrl}
                  alt="리뷰 이미지"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">플랫폼</span>
                <p className="font-medium">{selectedReview.platform}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">업체명</span>
                <p className="font-medium">{selectedReview.business}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">평점</span>
                <p className="font-medium">⭐ {selectedReview.rating}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">리뷰 내용</span>
                <p className="font-medium">{selectedReview.content}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">품질 점수</span>
                <p className="font-medium">{selectedReview.qualityScore || calculateQualityScore(selectedReview)}점 / 100점</p>
              </div>
              
              <div className="pt-4 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'approved')
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  승인
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'rejected')
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  거부
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}