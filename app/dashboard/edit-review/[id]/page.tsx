'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { ReviewForm } from '@/components/ReviewForm'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'
import { reviewApi } from '@/lib/api'
import type { Review, ReviewFormData } from '@/types/database'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface EditReviewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditReviewPage(props: EditReviewPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const loadReview = async () => {
    try {
      setPageLoading(true)
      
      const params = await props.params
      
      // Get all user reviews and find the one with matching ID
      const result = await reviewApi.getCurrent()
      if (result.success && result.data) {
        const foundReview = result.data.find(r => r.id === params.id)
        if (foundReview) {
          setReview(foundReview)
        } else {
          error('리뷰를 찾을 수 없습니다', '존재하지 않거나 권한이 없는 리뷰입니다.')
          router.push('/dashboard/reviews')
        }
      } else {
        error('리뷰 로드 실패', result.error || '알 수 없는 오류가 발생했습니다.')
        router.push('/dashboard/reviews')
      }
    } catch (err) {
      console.error('Error loading review:', err)
      error('리뷰 로드 실패', '네트워크 오류가 발생했습니다.')
      router.push('/dashboard/reviews')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    loadReview()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (data: ReviewFormData) => {
    if (!review) return
    
    try {
      setLoading(true)
      
      const result = await reviewApi.update(review.id, data)
      
      if (result.success) {
        success('리뷰가 수정되었습니다', '리뷰 정보가 성공적으로 업데이트되었습니다.')
        router.push('/dashboard/reviews')
      } else {
        error('리뷰 수정 실패', result.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error updating review:', err)
      error('리뷰 수정 실패', '네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!review) return
    
    const confirmed = window.confirm(
      '정말로 이 리뷰를 삭제하시겠습니까?\n삭제된 리뷰는 복구할 수 없습니다.'
    )
    
    if (!confirmed) return
    
    try {
      setDeleteLoading(true)
      
      const result = await reviewApi.delete(review.id)
      
      if (result.success) {
        success('리뷰가 삭제되었습니다', '리뷰가 성공적으로 삭제되었습니다.')
        router.push('/dashboard/reviews')
      } else {
        error('리뷰 삭제 실패', result.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      error('리뷰 삭제 실패', '네트워크 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (pageLoading) {
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

  if (!review) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <Container>
            <Card className="max-w-md mx-auto text-center">
              <CardHeader>
                <CardTitle>리뷰를 찾을 수 없습니다</CardTitle>
                <CardDescription>
                  요청하신 리뷰가 존재하지 않거나 접근 권한이 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/reviews">리뷰 목록으로</Link>
                </Button>
              </CardContent>
            </Card>
          </Container>
        </main>
      </div>
    )
  }

  const initialData: ReviewFormData = {
    reviewer_name: review.reviewer_name,
    review_text: review.review_text,
    rating: review.rating || undefined,
    source: review.source as any,
    image_url: review.image_url || '',
    external_link: review.external_link || ''
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <Link href="/dashboard" className="hover:text-primary transition-base">
                대시보드
              </Link>
              <span>/</span>
              <Link href="/dashboard/reviews" className="hover:text-primary transition-base">
                리뷰 관리
              </Link>
              <span>/</span>
              <span className="text-gray-900">리뷰 편집</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link 
                    href="/dashboard/reviews"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-base"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      리뷰 편집
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {review.reviewer_name}님의 리뷰를 수정하거나 삭제할 수 있습니다
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  loading={deleteLoading}
                  disabled={loading || deleteLoading}
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </Button>
              </div>
            </div>

            {/* Warning */}
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900 text-lg">
                  ⚠️ 주의사항
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  <div className="space-y-2">
                    <p>• 리뷰 내용은 실제 고객이 작성한 내용과 일치해야 합니다</p>
                    <p>• 수정된 내용은 즉시 공개 프로필에 반영됩니다</p>
                    <p>• 삭제된 리뷰는 복구할 수 없으니 신중하게 결정해주세요</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Form */}
            <ReviewForm
              initialData={initialData}
              onSubmit={handleSubmit}
              submitLabel="리뷰 수정하기"
              loading={loading}
            />
          </div>
        </Container>
      </main>
    </div>
  )
}