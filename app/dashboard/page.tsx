"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  HomeIcon,
  PersonIcon,
  BarChartIcon,
  ExitIcon,
  Share2Icon,
  LockClosedIcon,
  Link2Icon,
} from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"

interface Review {
  id: string
  platform: string
  business: string
  content: string
  author: string
  reviewDate: string
  createdAt: string
}

interface DashboardStats {
  overview: {
    totalReviews: number
    featuredReviews: number
    platforms: number
    thisMonth: number
    profileViews: number
  }
  recent: {
    reviews: Review[]
  }
}

interface ProfileSnapshot {
  name: string
  username: string
  bio: string
  location?: string
  website?: string
  phone?: string
  portfolioImages?: string[]
  isPublic: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (!session) return

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [statsRes, profileRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/users/me"),
        ])

        if (!statsRes.ok) {
          const data = await statsRes.json().catch(() => ({}))
          throw new Error(data.error || `서버 오류 (${statsRes.status})`)
        }

        if (!profileRes.ok) {
          const data = await profileRes.json().catch(() => ({}))
          throw new Error(data.error || `프로필 오류 (${profileRes.status})`)
        }

        const statsData = await statsRes.json() as DashboardStats
        const profileData = await profileRes.json() as ProfileSnapshot

        setStats(statsData)
        setProfile(profileData)
      } catch (loadError) {
        console.error("Failed to load dashboard workspace:", loadError)
        setError(loadError instanceof Error ? loadError.message : "대시보드를 불러오지 못했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleCopyProfileLink = async () => {
    const username = profile?.username || session?.user?.username
    if (!username || typeof window === "undefined") return

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${username}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (copyError) {
      console.error("Failed to copy profile link:", copyError)
    }
  }

  const profileUrl = useMemo(() => {
    const username = profile?.username || session?.user?.username
    if (!username) return "recordyours.com/yourname"

    if (typeof window !== "undefined") {
      return `${window.location.origin.replace(/\/$/, "")}/${username}`
    }

    return `recordyours.com/${username}`
  }, [profile?.username, session?.user?.username])

  const checklist = useMemo(() => {
    const featuredReviews = stats?.overview.featuredReviews || 0

    return [
      {
        label: "고유 링크가 준비되어 있다",
        done: Boolean(profile?.username),
        href: "/dashboard/profile",
        button: "사용자명 확인",
      },
      {
        label: "소개 문장이 3초 안에 읽힌다",
        done: Boolean(profile?.bio?.trim()),
        href: "/dashboard/profile",
        button: "소개 다듬기",
      },
      {
        label: "상담 버튼이 연결되어 있다",
        done: Boolean(profile?.website?.trim() || profile?.phone?.trim()),
        href: "/dashboard/profile",
        button: "상담 링크 연결",
      },
      {
        label: "대표 후기 3개가 골라져 있다",
        done: featuredReviews >= 3,
        href: "/dashboard/reviews",
        button: "대표 후기 정리",
      },
      {
        label: "작업 사진이 2장 이상 올라가 있다",
        done: Array.isArray(profile?.portfolioImages) && profile.portfolioImages.length >= 2,
        href: "/dashboard/profile",
        button: "작업 사진 올리기",
      },
      {
        label: "외부에 공개 상태다",
        done: profile?.isPublic === true,
        href: "/dashboard/profile",
        button: "공개 상태 확인",
      },
    ]
  }, [profile, stats?.overview.featuredReviews])

  const completionCount = checklist.filter((item) => item.done).length
  const completionPercent = Math.round((completionCount / checklist.length) * 100)

  const sendActions = [
    {
      title: "내 링크 복사",
      description: "상담 전 문자, 카톡, DM에 바로 보낼 링크를 복사합니다.",
      onClick: handleCopyProfileLink,
      primary: true,
    },
    {
      title: "공유 화면 열기",
      description: "카카오톡, 인스타, QR 공유를 바로 준비합니다.",
      href: "/dashboard/share",
    },
    {
      title: "프로필 완성하기",
      description: "작업 사진, 소개, 상담 버튼까지 채워서 바로 보낼 링크로 만듭니다.",
      href: "/dashboard/profile",
    },
  ]

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:border-r md:border-gray-200 md:block" />
        <div className="md:pl-64 p-4 md:p-8">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-200" />
          <div className="mt-4 h-36 animate-pulse rounded-3xl bg-gray-200" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />
            <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-3xl border border-red-100 shadow-sm">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-900">작업 공간을 불러오지 못했습니다</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
            <div className="mt-5 flex flex-col gap-3">
              <Button className="bg-[#FF6B35] hover:bg-[#E55A2B]" onClick={() => window.location.reload()}>
                다시 시도
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/profile")}>
                프로필 편집으로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:border-r md:border-gray-200 md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 p-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
            <p className="mt-2 text-xs leading-5 text-gray-500">링크 하나로 상담 전에 신뢰를 보여주는 작업실</p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            <NavItem icon={<HomeIcon />} label="작업실" href="/dashboard" active />
            <NavItem icon={<PersonIcon />} label="내 링크" href="/dashboard/profile" />
            <NavItem icon={<BarChartIcon />} label="대표 후기" href="/dashboard/reviews" />
            <NavItem icon={<Share2Icon />} label="공유하기" href="/dashboard/share" />
            {(session?.user?.role === "admin" || session?.user?.role === "super_admin") && (
              <NavItem icon={<LockClosedIcon />} label="관리자 센터" href="/admin" />
            )}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-[#FF6B35]">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{session?.user?.name || "사용자"}</p>
                <p className="truncate text-xs text-gray-500">@{session?.user?.username || "user"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <ExitIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35]">*</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <ExitIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pb-20 pt-16 md:pl-64 md:pt-0">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900 md:text-3xl">
              오늘 할 일은 링크를 완성하고 한 명에게 보내는 것입니다.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              보기 좋은 대시보드보다 중요한 건, 고객이 30초 안에 믿을 수 있는 공개 페이지를 만드는 일입니다.
            </p>
          </div>

          <Card className="overflow-hidden rounded-[32px] border border-[#eed8cf] bg-white shadow-[0_24px_70px_rgba(60,28,16,0.06)]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C76243]">
                    Sales Link Workspace
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em] text-slate-900 md:text-[2rem]">
                    이 링크 하나가 소개받을 때의 첫인상을 결정합니다.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                    이름, 전문성, 대표 후기, 상담 버튼만 또렷하면 됩니다. 나머지는 그 다음입니다.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                  <div className="rounded-2xl border border-[#eadfd7] bg-[#fcfaf8] px-4 py-3 text-sm text-slate-700">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B27B68]">
                      Public URL
                    </span>
                    <span className="mt-1 block break-all font-medium">{profileUrl}</span>
                  </div>
                  <Button className="h-12 rounded-full bg-[#221A24] px-5 text-white hover:bg-[#3a2d3d]" onClick={handleCopyProfileLink}>
                    <Link2Icon className="mr-2 h-4 w-4" />
                    {copied ? "복사 완료" : "링크 복사"}
                  </Button>
                  <Button variant="outline" className="h-12 rounded-full border-[#d8cfc8]" asChild>
                    <Link href="/dashboard/share">공유하기</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <Card className="rounded-[28px] border border-[#eadfd7] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>30초 신뢰 체크리스트</CardTitle>
                  <CardDescription>
                    프로필 완성률보다 중요한 건, 고객이 실제로 보는 핵심 정보가 다 채워졌는지입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl bg-[#fcfaf8] p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">현재 준비도</p>
                        <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-slate-900">
                          {completionPercent}%
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {completionCount} / {checklist.length} 완료
                      </p>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#efe6e0]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E45F3C] transition-all"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                item.done
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.done ? "완료" : "확인 필요"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{item.label}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0 text-[#FF6B35] hover:bg-transparent hover:text-[#E55A2B]" asChild>
                          <Link href={item.href}>{item.button}</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-[#eadfd7] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>최근 정리한 후기</CardTitle>
                  <CardDescription>
                    고객에게 먼저 보여줄 만한 증거부터 점검하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recent.reviews?.length ? (
                    <div className="space-y-3">
                      {stats.recent.reviews.slice(0, 4).map((review) => (
                        <div key={review.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#fff0ea] px-2.5 py-1 text-[11px] font-semibold text-[#C76243]">
                              {review.platform}
                            </span>
                            <span className="text-sm font-medium text-slate-700">{review.business}</span>
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{review.content}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>{review.author}</span>
                            <span>{new Date(review.reviewDate).toLocaleDateString("ko-KR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#eadfd7] bg-[#fcfaf8] p-6 text-center">
                      <p className="text-sm font-medium text-slate-900">아직 대표 후기가 없습니다.</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        먼저 3개만 정리해도 링크의 설득력이 확 달라집니다.
                      </p>
                      <Button className="mt-4 bg-[#FF6B35] hover:bg-[#E55A2B]" asChild>
                        <Link href="/dashboard/share">리뷰 요청 링크 보내기</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[28px] border border-[#eadfd7] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>지금 바로 할 수 있는 일</CardTitle>
                  <CardDescription>
                    관리 기능보다 실제 전송 행동이 먼저입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sendActions.map((action) =>
                    action.href ? (
                      <Link key={action.title} href={action.href} className="block rounded-2xl border border-slate-200 px-4 py-4 transition hover:bg-slate-50">
                        <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                      </Link>
                    ) : (
                      <button
                        key={action.title}
                        type="button"
                        onClick={action.onClick}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                          action.primary
                            ? "border-[#FF6B35] bg-[#fff3ee] hover:bg-[#ffe9df]"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                      </button>
                    )
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-[#eadfd7] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>현재 링크 상태</CardTitle>
                  <CardDescription>
                    링크가 설득하는 데 필요한 핵심 신호만 간단히 확인합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <MetricCard label="대표 후기" value={`${stats?.overview.featuredReviews || 0}개`} />
                  <MetricCard label="작업 사진" value={`${profile?.portfolioImages?.length || 0}장`} />
                  <MetricCard label="공개 상태" value={profile?.isPublic ? "공개" : "비공개"} />
                  <MetricCard label="프로필 열람" value={`${stats?.overview.profileViews || 0}회`} />
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-[#eadfd7] bg-[#fff7f3] shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C76243]">Focus</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">
                    지금은 더 많은 기능보다, 더 자주 공유되는 링크가 중요합니다.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    핵심은 기능이 아니라 공개 링크입니다. 이름, 소개, 대표 후기, 작업 사진, 상담 버튼이 30초 안에 읽히면 충분합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}

function NavItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
        active ? "bg-[#FF6B35] text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#fcfaf8] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900">{value}</p>
    </div>
  )
}
