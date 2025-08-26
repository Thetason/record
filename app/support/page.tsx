'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'

export default function SupportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: 'bug',
    subject: '',
    description: '',
    priority: 'normal'
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/login')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">문의가 접수되었습니다!</h2>
          <p className="text-gray-600">
            빠른 시일 내에 답변 드리겠습니다.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">고객 지원</h1>
            <p className="text-gray-600">
              문의사항이나 문제를 알려주세요. 빠르게 도와드리겠습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">문의 유형</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="bug">버그 신고</option>
                <option value="feature">기능 요청</option>
                <option value="payment">결제 문의</option>
                <option value="account">계정 문제</option>
                <option value="review">리뷰 관련</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">우선순위</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">낮음</option>
                <option value="normal">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="문의 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">상세 내용</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="자세한 내용을 설명해주세요..."
                rows={6}
                required
              />
            </div>

            {formData.priority === 'urgent' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">긴급 문의 안내</p>
                    <p className="text-xs text-orange-700 mt-1">
                      긴급 문의는 24시간 내에 우선 처리됩니다.
                      정말 긴급한 경우에만 선택해주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-1" />
                {submitting ? '전송 중...' : '문의 보내기'}
              </Button>
            </div>
          </form>
        </Card>

        {/* FAQ 섹션 */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">리뷰는 어떻게 업로드하나요?</h3>
              <p className="text-sm text-gray-600">
                대시보드에서 "리뷰 추가" 버튼을 클릭하고 스크린샷을 업로드하면 자동으로 분석됩니다.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">무료 플랜의 제한은 무엇인가요?</h3>
              <p className="text-sm text-gray-600">
                무료 플랜은 최대 50개의 리뷰를 저장할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">환불은 가능한가요?</h3>
              <p className="text-sm text-gray-600">
                결제 후 7일 이내에 고객센터로 문의하시면 전액 환불이 가능합니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}