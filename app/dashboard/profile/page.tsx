"use client"

import { useState, useEffect, useCallback } from "react"
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
  CameraIcon,
  Share1Icon,
  Link2Icon,
  HamburgerMenuIcon
} from "@radix-ui/react-icons"
import { QuoteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { PublicProfile } from "@/lib/profile"
import ProfileClient from "@/app/[username]/ProfileClient"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"

interface ProfileStats {
  totalReviews: number
  profileViews: number
  thisMonthReviews: number
  recentWeekReviews: number
}

interface ReviewSummary {
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: ""
  })
  const [stats, setStats] = useState<ProfileStats>({
    totalReviews: 0,
    profileViews: 0,
    thisMonthReviews: 0,
    recentWeekReviews: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [previewProfile, setPreviewProfile] = useState<PublicProfile | null>(null)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [previewError, setPreviewError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchPreview = useCallback(async (username?: string | null) => {
    if (!username) {
      setPreviewProfile(null)
      setPreviewError('사용자명을 입력하면 공개 미리보기를 확인할 수 있습니다.')
      setPreviewLoading(false)
      return
    }

    setPreviewLoading(true)
    setPreviewError("")
    try {
      const res = await fetch('/api/users/me/preview')
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setPreviewProfile(null)
        setPreviewError(data.error || '프로필 미리보기를 불러오지 못했습니다.')
      } else {
        const data = await res.json() as PublicProfile
        setPreviewProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile preview:', error)
      setPreviewProfile(null)
      setPreviewError('프로필 미리보기를 불러오지 못했습니다.')
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  const fetchUserProfile = useCallback(async () => {
    if (!session) return

    try {
      const res = await fetch("/api/user")
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          phone: data.phone || ""
        })
        if (data.avatar) {
          setPreviewImage(data.avatar)
        }
        setStats(prev => ({
          ...prev,
          profileViews: data.profileViews || prev.profileViews || 0
        }))
        await fetchPreview(data.username)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }, [session, fetchPreview])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews")
      if (res.ok) {
        const data = await res.json() as { reviews?: ReviewSummary[] }
        const reviewsList = Array.isArray(data.reviews) ? data.reviews : []
        
        const total = reviewsList.length

        const thisMonth = reviewsList.filter((review) => {
          const reviewDate = new Date(review.createdAt)
          const now = new Date()
          return reviewDate.getMonth() === now.getMonth() && 
                 reviewDate.getFullYear() === now.getFullYear()
        }).length

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentWeek = reviewsList.filter((review) => {
          const reviewDate = new Date(review.createdAt)
          return reviewDate >= sevenDaysAgo
        }).length

        setStats(prev => ({
          ...prev,
          totalReviews: total,
          thisMonthReviews: thisMonth,
          recentWeekReviews: recentWeek
        }))
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }, [])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session, fetchStats])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCopyProfileUrl = async () => {
    const url = formData.username ? `https://recordyours.com/${formData.username}` : ''

    if (!url) {
      alert('먼저 사용자명을 입력하고 저장해주세요.')
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      alert('공유 링크가 복사되었습니다!')
    } catch (error) {
      console.error('Failed to copy profile URL:', error)
      alert('링크 복사에 실패했습니다. 브라우저 설정을 확인해주세요.')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 체크
      if (file.size > 5 * 1024 * 1024) {
        setError("파일 크기는 5MB 이하여야 합니다.")
        return
      }

      // 미리보기 설정
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        setPreviewImage(base64)
        
        // 즉시 서버에 업로드
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!res.ok) {
            throw new Error('이미지 업로드 실패')
          }
          
          const data = await res.json()
          setPreviewImage(data.avatar)
        } catch (error) {
          console.error('Upload error:', error)
          setError('이미지 업로드 중 오류가 발생했습니다.')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          avatar: previewImage
        })
      })

      if (!res.ok) {
        throw new Error("프로필 업데이트 실패")
      }

      alert("프로필이 성공적으로 업데이트되었습니다!")
      await fetchUserProfile()
    } catch (error) {
      console.error("Profile update error:", error)
      const message = error instanceof Error ? error.message : "프로필 업데이트 중 오류가 발생했습니다."
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  const shortProfileUrl = formData.username ? `recordyours.com/${formData.username}` : 'recordyours.com/yourname'

  return (
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
            <NavItem icon={<HomeIcon />} label="대시보드" href="/dashboard" />
            <NavItem icon={<BarChartIcon />} label="리뷰 관리" href="/dashboard/reviews" />
            <NavItem icon={<PersonIcon />} label="내 프로필" href="/dashboard/profile" active />
            <NavItem icon={<PlusIcon />} label="리뷰 추가" href="/dashboard/bulk-upload" />
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
      <div className="md:pl-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">내 프로필</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              공개 프로필 정보를 편집하고 관리하세요
            </p>
          </div>

          <Card className="overflow-hidden border-0 shadow-xl">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg md:text-2xl">공개 프로필 미리보기</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  현재 저장된 정보 기준으로 공유 페이지와 동일한 화면이 표시됩니다.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPreview(formData.username)}
                  disabled={previewLoading}
                  className="text-xs md:text-sm"
                >
                  새로고침
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyProfileUrl}
                  disabled={!formData.username}
                  className="text-xs md:text-sm"
                >
                  링크 복사
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={!formData.username}
                  className="text-xs md:text-sm"
                >
                  <Link href={formData.username ? `/${formData.username}` : '#'} target="_blank">
                    새 탭에서 보기
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm">
                  <Link href="/dashboard/share">
                    공유 설정 열기
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {previewLoading ? (
                <div className="flex min-h-[400px] items-center justify-center bg-slate-100">
                  <div className="text-sm text-gray-500">미리보기를 불러오는 중입니다...</div>
                </div>
              ) : previewProfile ? (
                <div className="bg-slate-100">
                  <div className="mx-auto w-full max-w-[1280px] px-4 pb-8">
                    <div className="max-h-[720px] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
                      <ProfileClient profile={previewProfile} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  {previewError || '사용자명을 입력하고 저장하면 공개 프로필 미리보기가 표시됩니다.'}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    다른 사용자에게 보여질 기본 프로필 정보입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">프로필 사진</label>
                      <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {previewImage ? (
                            <Image src={previewImage} alt="Profile" fill sizes="80px" className="object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">
                              {formData.name.charAt(0).toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="profile-image"
                          />
                          <label
                            htmlFor="profile-image"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <CameraIcon className="w-4 h-4" />
                            사진 변경
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG 파일만 업로드 가능합니다
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        이름 *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="실제 이름을 입력하세요"
                        required
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        사용자명 *
                      </label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="프로필 URL에 사용됩니다"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        공개 프로필 URL: {shortProfileUrl}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        이메일 *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="연락 가능한 이메일"
                        required
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        이메일은 변경할 수 없습니다
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">
                        소개
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="자신을 간단히 소개해주세요..."
                      />
                      <p className="text-xs text-gray-500">
                        {formData.bio.length}/500자
                      </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        위치
                      </label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="예: 서울, 한국"
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">
                        웹사이트
                      </label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://your-website.com"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        연락처
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                      />
                      <p className="text-xs text-gray-500">
                        연락처는 공개되지 않으며, 필요시에만 사용됩니다
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fetchUserProfile}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#FF6B35] hover:bg-[#E55A2B]"
                        disabled={isSaving}
                      >
                        {isSaving ? "저장 중..." : "변경사항 저장"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Side information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 리뷰</span>
                      <span className="font-medium">{stats.totalReviews}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">최근 7일 리뷰</span>
                      <span className="font-medium">{stats.recentWeekReviews}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">프로필 조회</span>
                      <span className="font-medium">{stats.profileViews}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">이번 달 리뷰</span>
                      <span className="font-medium">{stats.thisMonthReviews}개</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                  <CardDescription>
                    프로필 공유 및 리뷰 요청 기능을 빠르게 열 수 있어요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/share">
                      <Share1Icon className="w-4 h-4 mr-2" /> 리뷰 공유 설정 열기
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    disabled={!formData.username}
                    onClick={() => {
                      if (!formData.username) return
                      window.open(`/${formData.username}/review-request`, '_blank')
                    }}
                  >
                    <Link2Icon className="w-4 h-4 mr-2" /> 리뷰 요청 폼 열기
                  </Button>
                  <p className="text-xs text-gray-500">
                    공개 페이지에서 변경 사항이 보이지 않을 경우, 위 메뉴에서 즉시 공유 상태를 확인할 수 있습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
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


