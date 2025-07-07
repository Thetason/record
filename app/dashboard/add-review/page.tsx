'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { ReviewForm } from '@/components/ReviewForm'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'
import { reviewApi } from '@/lib/api'
import type { ReviewFormData } from '@/types/database'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddReviewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (data: ReviewFormData) => {
    try {
      setLoading(true)
      
      const result = await reviewApi.create(data)
      
      if (result.success) {
        success('리뷰가 추가되었습니다', '새로운 리뷰가 성공적으로 등록되었습니다.')
        router.push('/dashboard')
      } else {
        error('리뷰 추가 실패', result.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error creating review:', err)
      error('리뷰 추가 실패', '네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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
              <span className="text-gray-900">리뷰 추가</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Link 
                  href="/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-base"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    새 리뷰 추가
                  </h1>
                  <p className="text-gray-600 mt-1">
                    고객의 소중한 리뷰를 포트폴리오에 추가하세요
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">
                  💡 리뷰 추가 가이드
                </CardTitle>
                <CardDescription className="text-blue-700">
                  <div className="space-y-2">
                    <p>• <strong>정확한 정보 입력:</strong> 실제 고객의 리뷰 내용을 정확히 입력해주세요</p>
                    <p>• <strong>플랫폼 선택:</strong> 리뷰를 받은 플랫폼을 올바르게 선택해주세요</p>
                    <p>• <strong>이미지 첨부:</strong> 리뷰 스크린샷이나 관련 이미지를 첨부할 수 있습니다</p>
                    <p>• <strong>외부 링크:</strong> 원본 리뷰 페이지 링크를 추가하면 신뢰성이 높아집니다</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Form */}
            <ReviewForm
              onSubmit={handleSubmit}
              submitLabel="리뷰 추가하기"
              loading={loading}
            />
          </div>
        </Container>
      </main>
    </div>
  )
}