"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  HomeIcon,
  PersonIcon,
  BarChartIcon,
  ExitIcon,
  CameraIcon,
  Share1Icon,
  Link2Icon,
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { PublicProfile } from "@/lib/profile"
import { toImageSrc } from "@/lib/utils"
import ProfileClient from "@/app/[username]/ProfileClient"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"

type CareerEntry = {
  period: string
  title: string
  detail: string
}

interface ProfileStats {
  totalReviews: number
  featuredReviews: number
  profileViews: number
  thisMonthReviews: number
  recentWeekReviews: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    profession: "",
    experience: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    portfolioImages: [] as string[],
    careerTimeline: [] as CareerEntry[],
    isPublic: true
  })
  const [stats, setStats] = useState<ProfileStats>({
    totalReviews: 0,
    featuredReviews: 0,
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
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [expandedCareerIndex, setExpandedCareerIndex] = useState<number | null>(0)

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
      const res = await fetch("/api/users/me")
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          profession: data.profession || "",
          experience: data.experience || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          phone: data.phone || "",
          portfolioImages: Array.isArray(data.portfolioImages) ? data.portfolioImages : [],
          careerTimeline: Array.isArray(data.careerTimeline) ? data.careerTimeline : [],
          isPublic: data.isPublic !== false
        })
        const avatarSrc = toImageSrc(data.avatar)
        if (avatarSrc) {
          setPreviewImage(avatarSrc)
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
      const res = await fetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json() as {
          overview?: {
            totalReviews?: number
            featuredReviews?: number
            profileViews?: number
            thisMonth?: number
          }
          trends?: {
            thisWeekReviews?: number
          }
        }

        setStats(prev => ({
          ...prev,
          totalReviews: data.overview?.totalReviews || 0,
          featuredReviews: data.overview?.featuredReviews || 0,
          profileViews: data.overview?.profileViews || prev.profileViews || 0,
          thisMonthReviews: data.overview?.thisMonth || 0,
          recentWeekReviews: data.trends?.thisWeekReviews || 0
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
          setPreviewImage(toImageSrc(data.avatar))
        } catch (error) {
          console.error('Upload error:', error)
          setError('이미지 업로드 중 오류가 발생했습니다.')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remainingSlots = Math.max(0, 6 - formData.portfolioImages.length)
    const selectedFiles = files.slice(0, remainingSlots)

    if (selectedFiles.length === 0) {
      setError("포트폴리오 이미지는 최대 6장까지 등록할 수 있습니다.")
      return
    }

    try {
      const uploaded = await Promise.all(
        selectedFiles.map(async (file) => {
          if (file.size > 5 * 1024 * 1024) {
            throw new Error("포트폴리오 이미지는 5MB 이하만 업로드할 수 있습니다.")
          }

          const uploadData = new FormData()
          uploadData.append("file", file)
          uploadData.append("kind", "portfolio")

          const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadData
          })

          if (!res.ok) {
            throw new Error("포트폴리오 이미지 업로드에 실패했습니다.")
          }

          const data = await res.json() as { url?: string }
          if (!data.url) {
            throw new Error("포트폴리오 이미지 주소를 받지 못했습니다.")
          }

          return data.url
        })
      )

      setFormData((prev) => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, ...uploaded].slice(0, 6)
      }))
    } catch (uploadError) {
      console.error("Portfolio upload error:", uploadError)
      setError(uploadError instanceof Error ? uploadError.message : "포트폴리오 업로드 중 오류가 발생했습니다.")
    } finally {
      e.target.value = ""
    }
  }

  const removePortfolioImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleCareerEntryChange = (index: number, field: keyof CareerEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      careerTimeline: prev.careerTimeline.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      ),
    }))
  }

  const handleAddCareerEntry = () => {
    const nextIndex = formData.careerTimeline.length
    setFormData((prev) => ({
      ...prev,
      careerTimeline: [
        ...prev.careerTimeline,
        { period: "", title: "", detail: "" },
      ].slice(0, 6),
    }))
    setExpandedCareerIndex(nextIndex)
  }

  const handleRemoveCareerEntry = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      careerTimeline: prev.careerTimeline.filter((_, index) => index !== indexToRemove),
    }))
    setExpandedCareerIndex((current) => {
      if (current === null) return null
      if (current === indexToRemove) return null
      if (current > indexToRemove) return current - 1
      return current
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          avatar: previewImage,
          portfolioImages: formData.portfolioImages
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error || "프로필 업데이트 실패")
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
  const profileChecklist = [
    {
      label: "이름과 사용자명이 정리되어 있다",
      done: Boolean(formData.name.trim() && formData.username.trim()),
    },
    {
      label: "직업과 경력 요약이 정리되어 있다",
      done: Boolean(formData.profession.trim() && formData.experience.trim()),
    },
    {
      label: "소개 문장이 비어 있지 않다",
      done: Boolean(formData.bio.trim()),
    },
    {
      label: "상담 링크 또는 전화가 연결되어 있다",
      done: Boolean(formData.website.trim() || formData.phone.trim()),
    },
    {
      label: "작업 사진이 2장 이상 올라가 있다",
      done: formData.portfolioImages.length >= 2,
    },
    {
      label: "대표 후기 3개가 선택되어 있다",
      done: stats.featuredReviews >= 3,
    },
    {
      label: "공개 상태로 열려 있다",
      done: formData.isPublic,
    },
  ]
  const checklistDone = profileChecklist.filter((item) => item.done).length
  const checklistPercent = Math.round((checklistDone / profileChecklist.length) * 100)

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
            <NavItem icon={<BarChartIcon />} label="대표 후기" href="/dashboard/reviews" />
            <NavItem icon={<PersonIcon />} label="내 프로필" href="/dashboard/profile" active />
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">내 프로필</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              고객이 30초 안에 믿을 수 있는 링크를 만드는 공간입니다.
            </p>
          </div>

          <Card className="mb-6 border border-[#eadfd7] bg-[#fff7f3] shadow-sm">
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Launch Checklist</p>
                  <h2 className="mt-2 text-xl font-bold tracking-[-0.04em] text-slate-900 md:text-2xl">
                    30분 안에, 바로 보낼 링크까지 여는 흐름
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    이름, 전문영역, 경력 요약, 대표 후기 3개, 상담 버튼, 작업 사진 2장만 먼저 정리해도 고객에게 보낼 준비가 됩니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#eadfd7] bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  현재 준비도 {checklistDone} / {profileChecklist.length}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3">
                <div className="rounded-2xl border border-[#eadfd7] bg-white px-3 py-3 md:px-4 md:py-4">
                  <p className="text-sm font-semibold text-slate-900">1. 프로필 첫 화면</p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-600 md:text-sm md:leading-6">이름, 전문영역, 경력 요약이 먼저 보여야 고객이 5초 안에 이해합니다.</p>
                </div>
                <div className="rounded-2xl border border-[#eadfd7] bg-white px-3 py-3 md:px-4 md:py-4">
                  <p className="text-sm font-semibold text-slate-900">2. 리뷰 신뢰</p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-600 md:text-sm md:leading-6">대표 리뷰와 원문 캡처가 앞에 오면 고객이 바로 안심합니다.</p>
                </div>
                <div className="rounded-2xl border border-[#eadfd7] bg-white px-3 py-3 md:px-4 md:py-4">
                  <p className="text-sm font-semibold text-slate-900">3. 경력과 문의</p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-600 md:text-sm md:leading-6">포트폴리오와 커리어, 문의 링크까지 이어져야 보내는 링크가 완성됩니다.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "프로필 첫 화면",
                  "대표 리뷰",
                  "포트폴리오 & 경력",
                  "상담 링크",
                ].map((item) => (
                  <span
                    key={`profile-flow-${item}`}
                    className="rounded-full border border-[#eadfd7] bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg md:text-2xl">공개 프로필 미리보기</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  지금 입력한 정보가 실제 고객의 모바일 화면에서 어떻게 보이는지 바로 확인하세요.
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
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 md:hidden">
                <div>
                  <p className="text-sm font-semibold text-slate-900">실제 공개 화면 미리보기</p>
                  <p className="mt-1 text-xs text-slate-500">모바일에서 너무 길면 접었다가 다시 열 수 있어요.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobilePreview((prev) => !prev)}
                  className="shrink-0"
                >
                  {showMobilePreview ? "접기" : "열기"}
                </Button>
              </div>

              {!showMobilePreview && (
                <div className="border-t border-slate-100 px-4 pb-4 md:hidden">
                  <div className="rounded-2xl border border-[#eadfd7] bg-[#fcfaf8] px-4 py-3 text-xs leading-5 text-slate-600">
                    이름, 대표 리뷰, 포트폴리오, 문의 버튼이 고객에게 어떻게 보이는지 바로 확인할 수 있습니다.
                  </div>
                </div>
              )}

              <div className={showMobilePreview ? "block" : "hidden md:block"}>
              {previewLoading ? (
                <div className="flex min-h-[400px] items-center justify-center bg-slate-100">
                  <div className="text-sm text-gray-500">미리보기를 불러오는 중입니다...</div>
                </div>
              ) : previewProfile ? (
                <div className="bg-slate-100">
                  <div className="mx-auto w-full max-w-[1280px] px-4 pb-8">
                    <div className="relative max-h-[720px] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
                      <ProfileClient profile={previewProfile} embedded />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  {previewError || '사용자명을 입력하고 저장하면 공개 프로필 미리보기가 표시됩니다.'}
                </div>
              )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    링크를 처음 여는 고객이 바로 읽게 될 핵심 정보입니다.
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

                    <div className="space-y-4 rounded-3xl border border-[#eadfd7] bg-[#fffaf6] p-4 md:p-5">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Profile First Screen</p>
                        <div>
                          <p className="text-base font-semibold text-slate-900">이름 아래에서 바로 읽히는 정보</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            고객이 링크를 열자마자 누구인지 이해하게 만드는 첫 화면 정보입니다.
                          </p>
                        </div>
                      </div>

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
                          카톡, 인스타, 소개글에 그대로 붙는 고유 주소입니다: {shortProfileUrl}
                        </p>
                      </div>

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

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="profession" className="text-sm font-medium">
                            전문영역
                          </label>
                          <Input
                            id="profession"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            placeholder="예: 보컬트레이너"
                          />
                          <p className="text-xs text-gray-500">
                            이름 아래에 가장 먼저 보이는 직함입니다.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="experience" className="text-sm font-medium">
                            경력 요약
                          </label>
                          <Input
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="예: 10년차"
                          />
                          <p className="text-xs text-gray-500">
                            고객이 바로 읽을 수 있게 짧게 적어주세요.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          소개
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder={"고객이 링크를 열었을 때 10초 안에 이해할 소개를 적어보세요.\n예: 발성 교정과 1:1 맞춤 보컬 레슨을 진행합니다."}
                        />
                        <p className="text-xs text-gray-500">
                          이름 아래 직함은 위의 전문영역·경력에 따로 표시됩니다. 여기는 분위기와 강점을 설명하는 공간입니다.
                        </p>
                      </div>

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
                    </div>

                    <div className="space-y-4 rounded-3xl border border-[#eadfd7] bg-white p-4 md:p-5">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Contact</p>
                        <div>
                          <p className="text-base font-semibold text-slate-900">문의가 바로 이어지는 링크</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            리뷰를 보고 신뢰가 생긴 뒤 바로 누를 수 있는 상담 동선을 연결하세요.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="website" className="text-sm font-medium">
                          예약·상담 링크
                        </label>
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://booking-link.com"
                        />
                        <p className="text-xs text-gray-500">
                          공개 프로필의 대표 CTA로 노출됩니다. 네이버 예약, 카카오채널, 상담 링크를 넣어두세요.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          전화 상담 연락처
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
                          입력하면 공개 프로필에 `전화 문의` 버튼이 함께 표시됩니다.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-gray-200 bg-[#fcfaf8] p-4 md:p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Career Tree</p>
                          <label className="mt-2 block text-sm font-medium text-gray-900">커리어 트리</label>
                          <p className="mt-1 text-xs text-gray-500">
                            고객이 리뷰 다음으로 읽게 될 업력 흐름입니다. 연도, 활동, 설명을 짧고 분명하게 적어주세요.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddCareerEntry}
                          disabled={formData.careerTimeline.length >= 6}
                        >
                          커리어 항목 추가
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {formData.careerTimeline.map((entry, index) => (
                          <div key={`career-entry-${index}`} className="rounded-2xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">커리어 {index + 1}</p>
                                <p className="mt-1 text-xs text-gray-500 md:hidden">
                                  {[entry.period || '기간 미정', entry.title || '단계 제목 미정'].join(' · ')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedCareerIndex((current) => (current === index ? null : index))}
                                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 md:hidden"
                                >
                                  {expandedCareerIndex === index ? "접기" : "열기"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCareerEntry(index)}
                                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:text-red-600"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>

                            <div className={`${expandedCareerIndex === index ? "mt-4 block" : "hidden"} md:mt-4 md:block`}>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600">기간</label>
                                <Input
                                  value={entry.period}
                                  onChange={(e) => handleCareerEntryChange(index, "period", e.target.value)}
                                  placeholder="예: 2016 - 2018"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600">단계 제목</label>
                                <Input
                                  value={entry.title}
                                  onChange={(e) => handleCareerEntryChange(index, "title", e.target.value)}
                                  placeholder="예: Foundation"
                                />
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <label className="text-xs font-medium text-gray-600">설명</label>
                              <textarea
                                rows={3}
                                className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                                value={entry.detail}
                                onChange={(e) => handleCareerEntryChange(index, "detail", e.target.value)}
                                placeholder="예: 발성과 기본기 지도 경험을 쌓으며 레슨의 방향성을 다진 시기입니다."
                              />
                            </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {formData.careerTimeline.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#FF6B35]/30 bg-white px-4 py-5 text-sm text-gray-500">
                          아직 커리어 항목이 없습니다. 최소 2~3개 정도만 적어도 고객이 업력을 훨씬 빨리 이해합니다.
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-3xl border border-[#eadfd7] bg-[#fffaf6] p-4 md:p-5">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C76243]">Portfolio</p>
                        <label className="text-sm font-medium">포트폴리오 이미지</label>
                        <p className="text-xs text-gray-500">
                          고객이 리뷰 다음으로 보게 될 작업 이미지입니다. 최대 6장까지 올릴 수 있습니다.
                        </p>
                      </div>

                      <input
                        id="portfolio-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioUpload}
                        className="hidden"
                      />

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {formData.portfolioImages.map((imageUrl, index) => (
                          <div key={`${imageUrl}-${index}`} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                            <div className="relative aspect-[4/5] w-full">
                              <Image
                                src={imageUrl}
                                alt={`포트폴리오 ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 240px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePortfolioImage(index)}
                              className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm"
                            >
                              삭제
                            </button>
                          </div>
                        ))}

                        {formData.portfolioImages.length < 6 && (
                          <label
                            htmlFor="portfolio-images"
                            className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#FF6B35]/40 bg-[#fff7f3] px-4 text-center transition hover:bg-[#fff1ea]"
                          >
                            <CameraIcon className="h-5 w-5 text-[#FF6B35]" />
                            <span className="mt-3 text-sm font-medium text-[#C76243]">작업 이미지 추가</span>
                            <span className="mt-1 text-xs text-gray-500">{formData.portfolioImages.length}/6</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">공개 프로필 상태</p>
                          <p className="text-xs text-gray-500 mt-1">
                            비공개로 전환하면 외부 방문자와 후기 요청 링크에서 프로필이 보이지 않습니다.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                          className={`inline-flex items-center justify-between gap-3 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            formData.isPublic
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                          aria-pressed={formData.isPublic}
                        >
                          <span>{formData.isPublic ? '공개 중' : '비공개'}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              formData.isPublic ? 'bg-white' : 'bg-gray-500'
                            }`}
                          />
                        </button>
                      </div>
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
                  <CardTitle>30초 신뢰 체크리스트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl bg-[#fcfaf8] p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">준비도</p>
                        <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-gray-900">{checklistPercent}%</p>
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {checklistDone} / {profileChecklist.length} 완료
                      </p>
                    </div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#efe6e0]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E55A2B]"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {profileChecklist.map((item) => (
                      <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                        <span
                          className={`mt-0.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.done ? '완료' : '점검'}
                        </span>
                        <p className="text-sm leading-6 text-gray-700">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                  <CardDescription>
                    꾸미기보다 공유와 대표 후기 정리가 우선입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/share">
                      <Share1Icon className="w-4 h-4 mr-2" /> 링크 공유 화면 열기
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/reviews">
                      <BarChartIcon className="w-4 h-4 mr-2" /> 대표 후기 다시 고르기
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
                    프로필을 저장한 뒤엔 꼭 공유 화면에서 링크를 복사해서 실제 소개나 상담 메시지에 붙여보세요.
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
