"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Loader2 } from "lucide-react"

interface ReviewRequestFormProps {
  username: string
  name: string
  bio?: string | null
  avatar?: string | null
}

export function ReviewRequestForm({ username, name, bio, avatar }: ReviewRequestFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [customerName, setCustomerName] = useState("")
  const [serviceName, setServiceName] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [contact, setContact] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!agreed) {
      toast({
        title: '동의가 필요합니다',
        description: '리뷰 공개 및 이용 약관에 동의해주세요.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/public/reviews/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, serviceName, reviewContent, contact })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: '알 수 없는 오류가 발생했습니다.' }))
        throw new Error(error.error || '리뷰 저장에 실패했습니다.')
      }

      setIsCompleted(true)
      toast({
        title: '리뷰가 접수되었습니다',
        description: '검토 후 담당자가 프로필에 반영할 예정입니다.'
      })
      setCustomerName("")
      setServiceName("")
      setReviewContent("")
      setContact("")
      setAgreed(false)
    } catch (error) {
      console.error('review request error:', error)
      toast({
        title: '제출에 실패했습니다',
        description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#FF6B35]/10">
              {avatar ? (
                <Image src={avatar} alt={name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#FF6B35]">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}에게 리뷰 남기기</h1>
              {bio ? (
                <p className="text-sm text-gray-500 line-clamp-2">{bio}</p>
              ) : (
                <p className="text-sm text-gray-500">소중한 경험을 나눠주시면 큰 도움이 됩니다.</p>
              )}
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">감사합니다! 리뷰가 접수되었습니다.</p>
              <p className="mt-1">검토 후 공개 프로필에 반영되며, 추가 정보가 필요하면 담당자가 연락드릴 수 있습니다.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="customerName">
                이름 또는 닉네임
              </label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="예: 김리뷰"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="serviceName">
                이용하신 서비스 / 상품명
              </label>
              <Input
                id="serviceName"
                value={serviceName}
                onChange={(event) => setServiceName(event.target.value)}
                placeholder="예: 1:1 보컬 트레이닝"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="reviewContent">
              리뷰 내용
            </label>
            <Textarea
              id="reviewContent"
              value={reviewContent}
              onChange={(event) => setReviewContent(event.target.value)}
              placeholder="어떤 점이 좋았는지, 추천하고 싶은 이유 등을 자유롭게 작성해주세요. (최소 10자)"
              rows={8}
              required
            />
            <p className="mt-1 text-xs text-gray-500">최대 2000자까지 입력할 수 있습니다.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="contact">
              연락처 (선택)
            </label>
            <Input
              id="contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="담당자가 확인을 위해 연락드릴 수 있어요."
            />
          </div>

          <label className="flex items-start gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1"
            />
            <span>
              본 리뷰는 Re:cord 고객 포트폴리오에 활용될 수 있으며, 허위 사실 기재 시 삭제될 수 있음을 동의합니다.
            </span>
          </label>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-gray-500">
              제출 후에는 담당자가 내용을 검토한 뒤 프로필에 공개합니다.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/${username}`)}
              >
                프로필 보기
              </Button>
              <Button type="submit" disabled={isSubmitting || !agreed} className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  '리뷰 제출'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewRequestForm
