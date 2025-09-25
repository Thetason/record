"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { 
  HomeIcon, 
  PersonIcon, 
  PlusIcon, 
  BarChartIcon,
  GearIcon,
  ExitIcon,
  ChevronLeftIcon,
  CheckIcon
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Review {
  id: string
  platform: string
  business: string
  content: string
  author: string
  reviewDate: string
  createdAt: string
}

export default function EditReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const reviewId = params?.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [review, setReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    platform: "",
    business: "",
    content: "",
    author: "",
    reviewDate: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchReview = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`)
      if (res.ok) {
        const data = await res.json()
        setReview(data)
        setFormData({
          platform: data.platform,
          business: data.business,
          content: data.content,
          author: data.author,
          reviewDate: data.reviewDate.split('T')[0] // Format for date input
        })
      } else if (res.status === 404) {
        alert("리뷰를 찾을 수 없습니다.")
        router.push("/dashboard/reviews")
      }
    } catch (error) {
      console.error("Failed to fetch review:", error)
      alert("리뷰를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [reviewId, router])

  useEffect(() => {
    if (session && reviewId) {
      fetchReview()
    }
  }, [session, reviewId, fetchReview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert("리뷰가 성공적으로 수정되었습니다.")
        router.push("/dashboard/reviews")
      } else {
        const error = await res.json()
        alert(error.message || error.error || "리뷰 수정에 실패했습니다.")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("리뷰 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    const { signOut } = await import("next-auth/react")
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  if (!review) {
    return <div className="min-h-screen flex items-center justify-center">리뷰를 찾을 수 없습니다.</div>
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
        <div className="p-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/reviews")}
              className="mb-4"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              리뷰 목록으로 돌아가기
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">리뷰 수정</h1>
            <p className="text-gray-600 mt-2">
              리뷰 정보를 수정하세요
            </p>
          </div>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>리뷰 정보</CardTitle>
              <CardDescription>
                아래 정보를 수정한 후 저장 버튼을 클릭하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="platform">플랫폼</Label>
                    <select
                      id="platform"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      required
                    >
                      <option value="">플랫폼 선택</option>
                      <option value="네이버">네이버</option>
                      <option value="카카오맵">카카오맵</option>
                      <option value="구글">구글</option>
                      <option value="크몽">크몽</option>
                      <option value="인스타그램">인스타그램</option>
                      <option value="당근">당근</option>
                      <option value="Re:cord">Re:cord</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="business">업체명/서비스명</Label>
                    <Input
                      id="business"
                      type="text"
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="reviewDate">리뷰 작성일</Label>
                    <Input
                      id="reviewDate"
                      type="date"
                      value={formData.reviewDate}
                      onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="author">작성자명</Label>
                    <Input
                      id="author"
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="고객님이 남긴 이름 또는 닉네임"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">리뷰 내용</Label>
                  <textarea
                    id="content"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                    rows={6}
                    maxLength={2000}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="고객님이 남긴 리뷰 내용을 입력하세요 (최대 2000자)"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/reviews")}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#FF6B35] hover:bg-[#E55A2B]"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                </div>
              </form>
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
