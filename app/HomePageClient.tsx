'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import {
  Link2,
  MessageCircle,
  Send,
  Star,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import type { PublicProfile } from "@/lib/profile"
import { MobileMenu } from "@/components/ui/mobile-menu"
import type { LaunchOfferSnapshot } from "@/lib/launch-offer-config"

const REVIEW_IMPORT_METHODS = [
  {
    step: "01",
    title: "스크린샷 직접 가져오기",
    description: "기존 플랫폼 리뷰를 가장 빠르게 옮기는 기본 방식",
    accent: "from-rose-50 via-white to-[#fff8f6]",
    preview: "stack",
    eyebrow: "기본",
  },
  {
    step: "02",
    title: "리뷰 옮겨드림",
    description: "스크린샷과 링크 자료를 보내주시면 먼저 정리해드립니다",
    accent: "from-violet-50 via-white to-[#faf7ff]",
    preview: "concierge",
    eyebrow: "도움받기",
  },
  {
    step: "03",
    title: "직접 리뷰 받기",
    description: "이후에는 Re:cord 링크로 새 리뷰를 계속 쌓아가세요",
    accent: "from-sky-50 via-white to-[#f7fbff]",
    preview: "direct",
    eyebrow: "성장",
  }
] as const

const LIVE_VOCAL_PROFILE_URL = "https://www.recordyours.com/syb2020"
const LEGACY_AUDIENCE_POOL = [
  "실용음악강사",
  "미용사",
  "강사",
  "네일샵 사장님",
  "자영업자",
  "필라테스 강사",
  "요가 선생님",
  "트레이너",
  "헤어디자이너",
  "네일아티스트",
  "메이크업 아티스트",
  "카페 사장님",
  "레스토랑 셰프",
  "바리스타",
  "플로리스트",
  "인테리어 디자이너",
  "사진작가"
] as const
const PRIMARY_AUDIENCE_SET = new Set(["헤어디자이너", "실용음악강사", "필라테스 강사"])
const PRIMARY_AUDIENCES = LEGACY_AUDIENCE_POOL.filter((item) => PRIMARY_AUDIENCE_SET.has(item))

const SHOWCASE_AUDIENCES = [
  {
    key: "vocal",
    label: "실용음악강사",
    eyebrow: "실제 사용자",
    description: "세타쓴님의 실제 공개 프로필을 기준으로 실용음악강사가 Re:cord를 어떻게 쓸 수 있는지 보여줍니다."
  },
  {
    key: "hair",
    label: "헤어디자이너",
    eyebrow: "데모 예시",
    description: "샵을 옮기거나 1인샵을 준비하는 디자이너가 상담 전에 보내는 링크 예시입니다."
  },
  {
    key: "pilates",
    label: "필라테스 강사",
    eyebrow: "데모 예시",
    description: "프라이빗 레슨과 체형 교정 중심의 필라테스 강사가 쓸 수 있는 구조를 같은 레이아웃으로 보여줍니다."
  }
] as const

type ShowcaseAudienceKey = (typeof SHOWCASE_AUDIENCES)[number]["key"]

const SHOWCASE_CAREER_CONTENT: Record<
  ShowcaseAudienceKey,
  {
    headline: string
    intro: string
    entries: Array<{
      year: string
      title: string
      detail: string
    }>
  }
> = {
  vocal: {
    headline: "2016년부터 이어온 보컬 커리어",
    intro: "후기만으로 다 담기지 않는 활동 이력과 레슨 업력을 한눈에 보여주는 섹션입니다.",
    entries: [
      {
        year: "2016",
        title: "서울에서 보컬 트레이닝 활동 시작",
        detail: "취미 보컬과 기초 발성 중심으로 레슨을 시작했습니다."
      },
      {
        year: "2019",
        title: "1:1 맞춤 보컬 코칭 확장",
        detail: "개인별 발성 교정과 오디션·입시 상담 비중을 높였습니다."
      },
      {
        year: "2022",
        title: "후기 기반 소개와 재문의 루프 정착",
        detail: "직접 받은 후기와 플랫폼 리뷰가 꾸준히 쌓이기 시작했습니다."
      },
      {
        year: "2026",
        title: "Re:cord 공개 프로필 운영",
        detail: "리뷰, 포트폴리오, 문의 링크를 한 화면으로 연결합니다."
      }
    ]
  },
  hair: {
    headline: "샵 이동 후에도 이어지는 헤어 커리어",
    intro: "이직과 독립 이후에도 고객이 바로 이해할 수 있게, 활동 흐름과 결과물을 함께 보여줍니다.",
    entries: [
      {
        year: "2017",
        title: "살롱 커리어 시작",
        detail: "커트와 기본 컬러 시술 중심으로 현장 경험을 쌓았습니다."
      },
      {
        year: "2020",
        title: "레이어드컷·톤다운 컬러 집중",
        detail: "재방문 고객이 늘며 전문 스타일이 분명해졌습니다."
      },
      {
        year: "2023",
        title: "상담형 디자이너로 자리잡음",
        detail: "얼굴형·손질 방식까지 함께 안내하는 흐름이 강점이 됐습니다."
      },
      {
        year: "2026",
        title: "Re:cord로 신뢰 링크 운영",
        detail: "샵을 옮겨도 리뷰와 포트폴리오를 한 링크로 전달합니다."
      }
    ]
  },
  pilates: {
    headline: "체형 교정 경험이 쌓인 필라테스 커리어",
    intro: "수업 전문성과 레슨 분위기를 함께 보여줘, 첫 상담 전에 신뢰가 생기게 합니다.",
    entries: [
      {
        year: "2018",
        title: "필라테스 지도 시작",
        detail: "기초 체형 교정과 프라이빗 수업 중심으로 활동을 시작했습니다."
      },
      {
        year: "2021",
        title: "호흡 코칭과 자세 교정 집중",
        detail: "수업 만족도가 높아지며 소개 문의가 늘어났습니다."
      },
      {
        year: "2024",
        title: "프라이빗 레슨 운영 안정화",
        detail: "직접 받은 후기와 전후 수업 흐름이 강한 소개 포인트가 됐습니다."
      },
      {
        year: "2026",
        title: "Re:cord로 공개 신뢰 프로필 운영",
        detail: "리뷰, 포트폴리오, 문의 링크를 한 번에 전달합니다."
      }
    ]
  }
}

const getReviewScore = (review: PublicProfile["reviews"][number]) => {
  let currentScore = 0
  if (review.isFeatured) currentScore += 8
  if (review.imageUrl) currentScore += 3
  if (review.originalUrl) currentScore += 2
  if (review.proofType === "direct") currentScore += 2
  if (review.verified) currentScore += 1
  if (review.rating && review.rating >= 5) currentScore += 1
  return currentScore
}

const getReviewTime = (review: PublicProfile["reviews"][number]) => {
  const time = new Date(review.reviewDate).getTime()
  return Number.isFinite(time) ? time : 0
}

const sortReviewsForHomeShowcase = (reviews: PublicProfile["reviews"]) =>
  [...reviews].sort((a, b) => {
    const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
    if (featuredDiff !== 0) return featuredDiff

    const directDiff =
      Number(b.platform === "Re:cord" || b.proofType === "direct") -
      Number(a.platform === "Re:cord" || a.proofType === "direct")
    if (directDiff !== 0) return directDiff

    const timeDiff = getReviewTime(b) - getReviewTime(a)
    if (timeDiff !== 0) return timeDiff

    return getReviewScore(b) - getReviewScore(a)
  })

const formatPlatformLabel = (platform: string, count: number) => {
  if (platform === "Re:cord") {
    return `${platform} 요청 ${count}건`
  }

  return `${platform} ${count}개`
}

const getPlatformBadgeStyle = (platform: string) => {
  switch (platform) {
    case "네이버":
      return "bg-green-50 text-green-700"
    case "카카오":
    case "카카오맵":
      return "bg-yellow-50 text-yellow-700"
    case "구글":
      return "bg-blue-50 text-blue-700"
    case "인스타":
    case "인스타그램":
      return "bg-fuchsia-50 text-fuchsia-700"
    case "당근":
      return "bg-orange-50 text-orange-700"
    case "Re:cord":
      return "bg-[#FF6B35]/10 text-[#FF6B35]"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

const getReviewProofBadge = (review?: PublicProfile["reviews"][number]) => {
  if (!review) return "실제 후기"
  if (review.imageUrl) return "원문 캡처"
  if (review.originalUrl) return "원문 링크"
  if (review.proofType === "direct") return "직접 받은 후기"
  return "실제 후기"
}

interface HomePageClientProps {
  showcaseProfiles: Record<ShowcaseAudienceKey, PublicProfile>
  launchOffer: LaunchOfferSnapshot
}

export default function HomePageClient({ showcaseProfiles, launchOffer }: HomePageClientProps) {
  const { data: session, status } = useSession()
  const [activeAudience, setActiveAudience] = useState<ShowcaseAudienceKey>("vocal")
  const [expandedPreviewImage, setExpandedPreviewImage] = useState<string | null>(null)
  const [heroReviewIndex, setHeroReviewIndex] = useState(0)
  const [showAllMobileReviews, setShowAllMobileReviews] = useState(false)
  const activeShowcase = showcaseProfiles[activeAudience]
  const activeAudienceMeta = SHOWCASE_AUDIENCES.find((item) => item.key === activeAudience) ?? SHOWCASE_AUDIENCES[0]
  const heroPalette = {
    bgStart: "#FFF7FA",
    bgEnd: "#FFFDFC",
    glowWarm: "rgba(228, 95, 60, 0.18)",
    glowSoft: "rgba(226, 98, 154, 0.18)",
    textStrong: "#1F1720",
    textBody: "#5E5160",
    textMuted: "#8D7C8F",
    accent: "#E45F3C",
    accentStrong: "#C55235",
    accentSoft: "#FCE6E1",
    shell: "#F6EDF2",
    surface: "#FFFDFC",
    surfaceSoft: "#F8F2F6",
    line: "#EADDE5",
    cta: "#221A24",
  } as const
  const workspaceHref = session ? "/dashboard/profile" : "/signup"
  const workspaceLabel = session ? "내 링크 다듬기" : "내 링크 만들기"
  const showcasePlatformDisplay = useMemo(() => {
    const counts = activeShowcase.reviews.reduce<Record<string, number>>((acc, review) => {
      acc[review.platform] = (acc[review.platform] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [activeShowcase])
  const showcaseVisibleReviews = useMemo(
    () => sortReviewsForHomeShowcase(activeShowcase.reviews),
    [activeShowcase]
  )
  const heroPreviewReviews = useMemo(
    () => sortReviewsForHomeShowcase(activeShowcase.reviews).slice(0, 5),
    [activeShowcase]
  )
  const activeHeroReview = heroPreviewReviews[heroReviewIndex % Math.max(heroPreviewReviews.length, 1)] ?? activeShowcase.reviews[0]
  const showcaseVerifiedCount = useMemo(
    () => activeShowcase.reviews.filter((review) => review.verified).length,
    [activeShowcase]
  )
  const heroReviewProofBadge = getReviewProofBadge(activeHeroReview)
  const activeShowcaseHref =
    activeAudience === "vocal"
      ? LIVE_VOCAL_PROFILE_URL
      : activeShowcase.id.startsWith("demo-")
        ? null
        : `/${activeShowcase.username}`
  const heroProfessionLabel =
    activeAudience === "vocal"
      ? "보컬트레이너"
      : activeShowcase.profession.split("·")[0]?.trim() || activeShowcase.profession || activeShowcase.bio
  const heroExperienceLabel =
    activeAudience === "vocal"
      ? "10년차"
      : activeShowcase.experience || activeShowcase.profession.split("·")[1]?.trim() || ""
  const heroSummaryChips = [heroExperienceLabel, activeShowcase.location].filter(Boolean)
  const heroTotalReviewCount = activeShowcase.reviews.length
  const heroPortfolioPreview = activeShowcase.portfolioImages.slice(0, 2)
  const heroShareTargets = ["카톡", "인스타", "스레드"]
  const activeCareerContent = SHOWCASE_CAREER_CONTENT[activeAudience]
  const mobilePreviewLimit = 5
  const mobilePreviewReviews = showcaseVisibleReviews.slice(0, mobilePreviewLimit)
  const mobileRenderedReviews = showAllMobileReviews ? showcaseVisibleReviews : mobilePreviewReviews
  const hasMoreMobileReviews = showcaseVisibleReviews.length > mobilePreviewLimit
  const remainingMobileReviewCount = Math.max(showcaseVisibleReviews.length - mobilePreviewLimit, 0)

  useEffect(() => {
    setHeroReviewIndex(0)
    setShowAllMobileReviews(false)
  }, [activeAudience])

  useEffect(() => {
    if (heroPreviewReviews.length <= 1) return

    const interval = window.setInterval(() => {
      setHeroReviewIndex((current) => (current + 1) % heroPreviewReviews.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [heroPreviewReviews])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToLiveDemo = () => scrollToSection("live-demo")
  const scrollToCareerTree = () => scrollToSection("career-tree")
  const scrollToShareFlow = () => scrollToSection("share-flow")
  const scrollToSetup = () => scrollToSection("setup")

  const heroPhoneMockup = (
    <div className="relative mx-auto w-full max-w-[16.4rem] overflow-visible px-0 sm:max-w-[21rem] sm:px-2 md:max-w-[24rem] md:px-6 xl:max-w-[25rem]">
      <div className="relative z-10 mx-auto w-[13.75rem] aspect-[719/1500] rounded-[2.55rem] bg-[#20181E] p-[0.68rem] shadow-[0_28px_68px_rgba(31,23,32,0.22)] sm:w-[15.8rem] sm:rounded-[2.7rem] sm:p-[0.72rem] md:w-[16.9rem] xl:w-[17.6rem]">
        <div className="absolute left-1/2 top-[0.72rem] z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70 shadow-[0_6px_18px_rgba(0,0,0,0.24)]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2.05rem] bg-[#F7F1EB]">
          <div className="relative h-[16.8%] min-h-[4.55rem] shrink-0">
            <Image
              src={activeShowcase.coverImage || "/sample.png"}
              alt={`${activeShowcase.name} 미리보기`}
              fill
              className="object-cover"
              sizes="19rem"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
          </div>

          <div className="relative flex flex-1 flex-col px-3 pb-2.5 pt-7">
            <div className="absolute left-1/2 top-0 h-[3.7rem] w-[3.7rem] -translate-x-1/2 -translate-y-[44%] overflow-hidden rounded-full border-[3px] border-[#F7F1EB] bg-white shadow-xl">
              {activeShowcase.avatar ? (
                <Image
                  src={activeShowcase.avatar}
                  alt={`${activeShowcase.name} 프로필`}
                  fill
                  className="object-cover"
                  sizes="72px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#FFEEE8] text-xl font-bold text-[#FF6B35]">
                  {activeShowcase.name.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-[1.3rem] font-bold tracking-[-0.05em] text-[#1F1720]">{activeShowcase.name}</p>
              <p className="mt-0.5 text-[10px] text-gray-600">{heroProfessionLabel}</p>
              <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                {heroSummaryChips.map((chip) => (
                  <span
                    key={`hero-summary-${activeAudience}-${chip}`}
                    className="rounded-full border border-[#E9DFE5] bg-white px-2 py-0.5 text-[8px] font-semibold text-[#6A5563]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-full bg-white/85 p-1">
              <button
                type="button"
                onClick={scrollToLiveDemo}
                className="rounded-full bg-[#1F1720] px-4 py-1.5 text-center text-[11px] font-semibold text-white transition hover:bg-[#2A2129]"
              >
                Reviews
              </button>
              <button
                type="button"
                onClick={scrollToShareFlow}
                className="rounded-full px-4 py-1.5 text-center text-[11px] font-semibold text-gray-500 transition hover:bg-[#F4EEF1] hover:text-[#1F1720]"
              >
                Contact
              </button>
            </div>

            <div className="mt-1.5 flex min-h-0 flex-1 flex-col gap-1.5">
              <div
                key={`hero-review-${activeAudience}-${activeHeroReview?.id ?? "empty"}`}
                className="rounded-[1.05rem] bg-white px-3 py-2 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${getPlatformBadgeStyle(activeHeroReview?.platform ?? "Re:cord")}`}>
                      {activeHeroReview?.platform ?? "Re:cord"}
                    </span>
                    <span className="inline-flex rounded-full border border-[#E9DFE5] bg-[#F8F3F6] px-2 py-1 text-[9px] font-semibold text-[#6A5563]">
                      {heroReviewProofBadge}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 pt-0.5 text-[#FF6B35]">
                    {Array.from({ length: Math.min(activeHeroReview?.rating ?? 5, 5) }).map((_, index) => (
                      <Star key={`hero-star-${activeHeroReview?.id ?? "default"}-${index}`} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>

                {activeHeroReview?.imageUrl ? (
                  <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_3.15rem] gap-2">
                    <p className="line-clamp-2 text-[10.5px] font-semibold leading-4.5 text-[#1F1720]">
                      “{(activeHeroReview.content ?? "").slice(0, 38)}{(activeHeroReview.content?.length ?? 0) > 38 ? "..." : ""}”
                    </p>
                    <button
                      type="button"
                      onClick={() => setExpandedPreviewImage(activeHeroReview.imageUrl ?? null)}
                      className="relative block h-[3.25rem] w-[3.15rem] overflow-hidden rounded-[0.9rem] border border-[#EFE4DB] bg-[#FBF7F3]"
                    >
                      <Image
                        src={activeHeroReview.imageUrl}
                        alt={`${activeHeroReview.author} 리뷰 캡처`}
                        fill
                        className="object-contain p-1.5"
                          sizes="52px"
                          unoptimized
                      />
                      <span className="absolute bottom-1 left-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-[#6A5563] shadow-sm">
                        원문
                      </span>
                    </button>
                  </div>
                ) : (
                  <p className="mt-1.5 line-clamp-2 text-[10.5px] font-semibold leading-4.5 text-[#1F1720]">
                    “{(activeHeroReview?.content ?? "").slice(0, 38)}{(activeHeroReview?.content?.length ?? 0) > 38 ? "..." : ""}”
                  </p>
                )}

                <div className="mt-1.5 flex items-center justify-between gap-3 text-[9px] text-gray-500">
                  <span>{activeHeroReview?.author}</span>
                  <span>{heroReviewIndex + 1} / {heroPreviewReviews.length} · 총 {heroTotalReviewCount}개</span>
                </div>
              </div>

              <button
                type="button"
                onClick={scrollToCareerTree}
                className="rounded-[1.05rem] border border-[#D9D2DA] bg-white px-3 py-2 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#1F1720]">포트폴리오 &amp; 경력</p>
                  </div>
                  <span className="rounded-full bg-[#EEF4FF] px-2 py-1 text-[9px] font-semibold text-[#315EF8]">
                    CAREER TREE
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {heroPortfolioPreview.map((imageSrc, index) => (
                    <div
                      key={`hero-portfolio-${activeAudience}-${index}`}
                      className="relative h-[2.9rem] overflow-hidden rounded-[0.9rem] border border-[#EFE4DB] bg-[#FBF7F3]"
                    >
                      <Image
                        src={imageSrc}
                        alt={`${activeShowcase.name} 포트폴리오 ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="90px"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={scrollToLiveDemo}
                  className="flex min-h-[3.8rem] flex-col justify-between rounded-[1.05rem] bg-[#1F1720] px-3 py-2.5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:bg-[#2A2129]"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 p-1.5">
                      <Star className="h-3.5 w-3.5 text-white" />
                    </span>
                    <p className="text-[12px] font-semibold text-white">리뷰 전체보기</p>
                  </div>
                  <p className="mt-1 text-[9px] font-medium text-white/70">전체 리뷰 화면으로 이동</p>
                </button>
                <button
                  type="button"
                  onClick={scrollToShareFlow}
                  className="flex min-h-[3.8rem] flex-col justify-between rounded-[1.05rem] border border-[#D9D2DA] bg-white px-3 py-2.5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#F8F3F6] p-1.5">
                      <Send className="h-3.5 w-3.5 text-[#6A5563]" />
                    </span>
                    <p className="text-[12px] font-semibold text-[#1F1720]">링크 보내기</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {heroShareTargets.slice(0, 2).map((target) => (
                      <span
                        key={`hero-share-${activeAudience}-${target}`}
                        className="rounded-full border border-[#E9DFE5] bg-[#F8F3F6] px-2 py-0.5 text-[8px] font-semibold text-[#6A5563]"
                      >
                        {target}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderImportPreview = (preview: typeof REVIEW_IMPORT_METHODS[number]["preview"]) => {
    switch (preview) {
      case "stack":
        return (
          <div className="relative h-28">
            <div className="absolute left-3 top-5 h-16 w-20 rounded-2xl border border-white/70 bg-white shadow-md" />
            <div className="absolute left-10 top-3 h-16 w-20 rounded-2xl border border-orange-100 bg-orange-50 shadow-md" />
            <div className="absolute left-[4.5rem] top-7 h-16 w-20 rounded-2xl border border-gray-100 bg-white shadow-lg" />
          </div>
        )
      case "concierge":
        return (
          <div className="flex h-28 items-center justify-center">
            <div className="w-full max-w-[11rem] rounded-[1.5rem] border border-violet-100 bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-600">리뷰 옮겨드림</span>
                <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-600">빠른 세팅</span>
              </div>
              <div className="rounded-[1.1rem] bg-violet-50 p-3">
                <div className="h-2 rounded-full bg-violet-200" />
                <div className="mt-2 h-2 w-4/5 rounded-full bg-violet-100" />
                <div className="mt-3 flex gap-2">
                  <div className="h-8 flex-1 rounded-xl bg-white" />
                  <div className="h-8 flex-1 rounded-xl bg-white" />
                </div>
              </div>
            </div>
          </div>
        )
      case "direct":
        return (
          <div className="flex h-28 items-center justify-center">
            <div className="w-full max-w-[11rem] rounded-[1.5rem] border border-emerald-100 bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">리뷰 요청 링크</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-[1.1rem] bg-emerald-50 p-3">
                <div className="h-2 rounded-full bg-emerald-200" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-emerald-100" />
                <div className="mt-3 h-8 rounded-xl bg-white" />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderShowcaseReviewCard = (
    review: PublicProfile["reviews"][number],
    compact = false
  ) => (
    <div
      key={`${activeAudience}-${compact ? "mobile" : "desktop"}-${review.id}`}
      className={`rounded-[1.15rem] border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)] ${
        compact ? "p-3.5" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPlatformBadgeStyle(review.platform)}`}>
            {review.platform}
          </span>
          <p className={`mt-2.5 font-semibold text-gray-900 ${compact ? "text-[13px]" : "text-sm"}`}>{review.business}</p>
        </div>
        <div className="flex items-center gap-0.5 text-[#FF6B35]">
          {Array.from({ length: Math.min(review.rating ?? 5, 5) }).map((_, index) => (
            <Star key={`${review.id}-${compact ? "mobile" : "desktop"}-star-${index}`} className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} fill-current`} />
          ))}
        </div>
      </div>

      {review.imageUrl && (
        <button
          type="button"
          onClick={() => setExpandedPreviewImage(review.imageUrl ?? null)}
          className={`relative mt-3 block w-full overflow-hidden rounded-[1rem] border border-gray-200 bg-[#FAFAF9] ${
            compact ? "h-28" : "h-36"
          }`}
        >
          <Image
            src={review.imageUrl}
            alt={`${review.author} 리뷰 이미지`}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 100vw, 20rem"
            unoptimized
          />
        </button>
      )}

      <p className={`mt-3 text-gray-700 ${compact ? "text-[13px] leading-6" : "text-sm leading-7"}`}>
        “{review.content.slice(0, compact ? 105 : 150)}{review.content.length > (compact ? 105 : 150) ? "..." : ""}”
      </p>

      <div className={`mt-3 flex items-center justify-between gap-3 text-gray-500 ${compact ? "text-[11px]" : "text-xs"}`}>
        <span>{review.author}</span>
        <span>{new Date(review.reviewDate).toLocaleDateString("ko-KR")}</span>
      </div>
    </div>
  )
  return (
    <main className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl md:text-2xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/guide"
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
              >
                사용 가이드
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
              >
                요금 안내
              </Link>
              <button
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
                onClick={scrollToLiveDemo}
              >
                실제 사용 화면
              </button>
              <button
                className="text-gray-600 hover:text-[#FF6B35] transition-colors"
                onClick={scrollToSetup}
              >
                시작 방법
              </button>
            </div>

            <div className="hidden md:flex gap-3">
              {status === "loading" ? (
                <Button variant="ghost" size="sm" disabled>로딩중...</Button>
              ) : session ? (
                <Link href="/dashboard/profile">
                  <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                    내 링크 다듬기
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">로그인</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                      무료 시작하기
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <MobileMenu session={session} status={status} />
          </div>
        </div>
      </nav>

      <section className="px-4 pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.22fr)_minmax(300px,360px)] lg:items-center xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,390px)]">
            <div className="text-center lg:pr-4 lg:text-left">
              <div className="mb-8">
                <p className="text-lg font-semibold text-[#FF6B35]">
                  후기 찾게 하지 말고
                </p>
              </div>

              {launchOffer.active && (
                <div className="mb-6 rounded-[1.4rem] border border-[#FFD9CF] bg-[#FFF4EF] p-4 text-left shadow-sm">
                  <p className="text-sm font-semibold text-[#FF6B35]">
                    오픈 기념 · 첫 {launchOffer.maxUsers}명 프로 {launchOffer.trialMonths}개월 무료
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-700">
                    남은 {launchOffer.remaining}자리 · 기존 플랫폼 리뷰는 스크린샷으로 최대 {launchOffer.ocrImportLimit}개까지 빠르게 가져올 수 있어요.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={workspaceHref}>
                      <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B]">
                        {session ? "내 링크 바로 열기" : "지금 시작하기"}
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="sm" variant="outline">
                        혜택 자세히 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <h1 className="text-[clamp(2rem,4.35vw,4.2rem)] font-bold leading-[1.05] tracking-[-0.055em] text-gray-900 lg:whitespace-nowrap">
                링크 하나로, 바로 믿게 하세요
              </h1>

              <div className="mt-5 lg:hidden">
                {heroPhoneMockup}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 md:mt-8 md:flex md:flex-wrap md:items-center md:justify-center md:gap-3 lg:justify-start">
                {PRIMARY_AUDIENCES.map((audience) => (
                  <span
                    key={`hero-primary-audience-${audience}`}
                    className="inline-flex w-full items-center justify-center rounded-full border-2 border-gray-200 bg-white px-2 py-2 text-[0.82rem] font-bold text-[#FF6B35] shadow-sm whitespace-nowrap md:w-auto md:px-7 md:py-3 md:text-2xl"
                  >
                    {audience}
                  </span>
                ))}
              </div>

              <h2 className="mt-5 text-lg font-bold leading-tight text-gray-900 sm:text-2xl md:mt-8 md:text-3xl">
                각 플랫폼에 흩어진 리뷰를 한 곳에 모아
                <br />
                <span className="text-[#FF6B35]">"이 사람 잘하네?"가 바로 느껴지게</span>
              </h2>

              <p className="mx-auto mt-4 max-w-3xl text-[0.97rem] leading-8 text-gray-700 md:mt-5 md:text-xl lg:mx-0">
                나의 전문성으로 고객에게 좋은 변화를 드리고, 그 소중한 마음과 리뷰를 여러 곳에 흩어두지 마세요.
                한 링크에 모아 예비고객에게 바로 전달해보세요.
              </p>

              <div className="mx-auto mt-8 grid max-w-5xl grid-cols-3 gap-2.5 md:mt-10 md:gap-4 lg:mx-0">
                <div className="flex min-h-[112px] flex-col items-center justify-center rounded-[1.35rem] bg-blue-50 px-2.5 py-3 text-center sm:min-h-[132px] sm:px-3.5 sm:py-4 md:min-h-[184px] md:rounded-[2rem] md:px-4 md:py-7">
                  <p className="text-balance text-[0.82rem] font-bold leading-[1.2] tracking-[-0.05em] text-blue-600 sm:text-[0.95rem] md:whitespace-nowrap md:text-[clamp(1.1rem,1.9vw,1.65rem)]">바로 보이는 신뢰</p>
                  <p className="mt-2 text-[0.68rem] leading-3.5 text-gray-600 sm:text-[0.8rem] sm:leading-4.5 md:mt-3 md:text-base md:leading-7">리뷰와 작업 사진을 한 화면에서 확인</p>
                </div>
                <div className="flex min-h-[112px] flex-col items-center justify-center rounded-[1.35rem] bg-green-50 px-2.5 py-3 text-center sm:min-h-[132px] sm:px-3.5 sm:py-4 md:min-h-[184px] md:rounded-[2rem] md:px-4 md:py-7">
                  <p className="text-balance text-[0.82rem] font-bold leading-[1.2] tracking-[-0.05em] text-green-600 sm:text-[0.95rem] md:whitespace-nowrap md:text-[clamp(1.1rem,1.9vw,1.65rem)]">바로 이어지는 문의</p>
                  <p className="mt-2 text-[0.68rem] leading-3.5 text-gray-600 sm:text-[0.8rem] sm:leading-4.5 md:mt-3 md:text-base md:leading-7">보고 바로 카톡, 전화, 예약 링크로 이동</p>
                </div>
                <div className="flex min-h-[112px] flex-col items-center justify-center rounded-[1.35rem] bg-orange-50 px-2.5 py-3 text-center sm:min-h-[132px] sm:px-3.5 sm:py-4 md:min-h-[184px] md:rounded-[2rem] md:px-4 md:py-7">
                  <p className="text-balance text-[0.82rem] font-bold leading-[1.2] tracking-[-0.05em] text-[#FF6B35] sm:text-[0.95rem] md:whitespace-nowrap md:text-[clamp(1.1rem,1.85vw,1.6rem)]">내 리뷰는 나의 자산</p>
                  <p className="mt-2 text-[0.68rem] leading-3.5 text-gray-600 sm:text-[0.8rem] sm:leading-4.5 md:mt-3 md:text-base md:leading-7">좋은 리뷰를 이직 후에도 계속 보관</p>
                </div>
              </div>

              <div className="mt-10 flex flex-col justify-center gap-3 px-4 sm:flex-row sm:gap-4 lg:justify-start lg:px-0">
                <Link href={workspaceHref} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-[#FF6B35] px-8 py-6 text-base hover:bg-[#E55A2B] md:text-lg">
                    {session ? workspaceLabel : "내 링크 만들기"}
                    <ArrowRightIcon className="ml-2 hidden sm:inline" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full px-8 py-6 text-base md:text-lg sm:w-auto"
                  onClick={scrollToLiveDemo}
                >
                  실제 사용 화면 보기
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 lg:justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>예비고객이 덜 헤맴</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>문의까지 바로 연결</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>내 리뷰 자산은 계속 보관</span>
                </div>
              </div>

            </div>

            <div className="hidden lg:block">
              {heroPhoneMockup}
            </div>
          </div>
        </div>
      </section>

      <section id="live-demo" className="bg-[#F7F7F5] px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <span className="mb-2 block text-sm font-medium text-[#FF6B35]">LIVE DEMO</span>
            <h2 className="text-[1.9rem] font-bold tracking-[-0.05em] text-gray-900 sm:text-3xl md:text-4xl">
              고객이 실제로
              <span className="text-[#FF6B35]"> 보게 될 화면</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base md:text-lg">
              이름, 대표 리뷰, 원문 캡처, 포트폴리오, 문의 버튼까지. 고객은 이 링크 하나로 당신을 더 빠르게 이해합니다.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-2 text-center text-[11px] font-medium text-gray-600 sm:px-4 sm:text-sm">
              1. 먼저 보는 신뢰 카드
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-2 text-center text-[11px] font-medium text-gray-600 sm:px-4 sm:text-sm">
              2. 아래에서 전체 리뷰
            </span>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            {SHOWCASE_AUDIENCES.map((audience) => {
              const isActive = audience.key === activeAudience

              return (
                <button
                  key={audience.key}
                  type="button"
                  onClick={() => setActiveAudience(audience.key)}
                  className="rounded-full px-3 py-2 text-[11px] font-semibold transition-all sm:px-5 sm:py-3 sm:text-sm md:text-base"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#FF6B35",
                          color: "#ffffff",
                          boxShadow: "0 12px 30px rgba(255, 107, 53, 0.24)"
                        }
                      : {
                          backgroundColor: "#ffffff",
                          color: "#4B5563",
                          borderWidth: 1,
                          borderColor: "#E5E7EB"
                        }
                  }
                >
                  {audience.label}
                </button>
              )
            })}
          </div>

          <div className="mx-auto mt-8 max-w-5xl rounded-[1.35rem] border border-gray-200 bg-white p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:rounded-[2rem] md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    activeAudience === "vocal" ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {activeAudienceMeta.eyebrow}
                </span>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-gray-900">
                  {activeAudienceMeta.label}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                  {activeAudienceMeta.description}
                </p>
              </div>
              {activeShowcaseHref ? (
                <Link href={activeShowcaseHref}>
                  <Button className="rounded-full bg-[#FF6B35] px-5 text-white hover:bg-[#E55A2B]">
                    프로필 열기
                  </Button>
                </Link>
              ) : (
                <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                  홈에서 구조만 미리보기
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 md:gap-4">
              <div className="rounded-[1rem] bg-[#FAFAF9] p-2.5 md:rounded-[1.5rem] md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 md:text-xs md:tracking-[0.2em]">총 리뷰</p>
                <p className="mt-1 text-lg font-bold tracking-[-0.04em] text-gray-900 md:mt-2 md:text-3xl">
                  {activeShowcase.totalReviews}
                </p>
              </div>
              <div className="rounded-[1rem] bg-[#FAFAF9] p-2.5 md:rounded-[1.5rem] md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 md:text-xs md:tracking-[0.2em]">검증 완료</p>
                <p className="mt-1 text-lg font-bold tracking-[-0.04em] text-gray-900 md:mt-2 md:text-3xl">
                  {showcaseVerifiedCount}
                </p>
              </div>
              <div className="rounded-[1rem] bg-[#FAFAF9] p-2.5 md:rounded-[1.5rem] md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 md:text-xs md:tracking-[0.2em]">주요 플랫폼</p>
                <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
                  {showcasePlatformDisplay.slice(0, 3).map(({ name, count }) => (
                    <span
                      key={`showcase-platform-${activeAudience}-${name}`}
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold md:px-3 md:text-xs ${getPlatformBadgeStyle(name)}`}
                    >
                      {formatPlatformLabel(name, count)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[1.45rem] border border-[#E5E7EB] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)] md:rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 md:px-6">
              <div className="flex items-center gap-1 text-lg font-bold text-[#161616]">
                <span>Re:cord</span>
                <span className="text-[#FF6B35]">*</span>
              </div>
              <span className="rounded-full bg-[#FF6B35] px-3 py-1 text-xs font-semibold text-white">
                공유하기
              </span>
            </div>

            <div className="relative h-[220px] overflow-hidden md:h-[320px]">
              <Image
                src={activeShowcase.coverImage || "/sample.png"}
                alt={`${activeShowcase.name} 커버 이미지`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80rem"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/70" />

              <div className="relative z-10 flex h-full items-end px-5 pb-6 pt-6 md:px-8 md:pb-8">
                <div className="flex w-full flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full border-4 border-white bg-white shadow-xl md:h-24 md:w-24">
                      {activeShowcase.avatar ? (
                        <Image
                          src={activeShowcase.avatar}
                          alt={`${activeShowcase.name} 프로필 이미지`}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#FFEEE8] text-2xl font-bold text-[#FF6B35]">
                          {activeShowcase.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="pb-1 text-white">
                      <p className="text-[1.9rem] font-bold tracking-[-0.05em] md:text-5xl">{activeShowcase.name}</p>
                      <p className="mt-1.5 text-sm font-medium text-white/80 md:mt-2 md:text-lg">
                        {heroProfessionLabel}
                      </p>
                    </div>
                  </div>

                  <div className="w-fit rounded-[1.15rem] border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md md:rounded-[1.5rem] md:px-5 md:py-4">
                    <p className="text-xs font-medium text-white/70">총 리뷰</p>
                    <p className="mt-1 text-2xl font-bold tracking-[-0.04em] md:text-3xl">{activeShowcase.totalReviews}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-7 md:px-8 md:py-10">
              <div className="text-center">
                <h3 className="text-[1.9rem] font-bold tracking-[-0.05em] text-gray-900 md:text-4xl">
                  고객이 남긴 <span className="text-[#FF6B35]">진짜 리뷰</span>
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-500 md:text-base">
                  모바일에서는 먼저 5개를 보고, 원하면 전체 리뷰를 이어서 펼쳐볼 수 있습니다
                </p>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-[#FF6B35] px-4 py-2 text-xs font-semibold text-white">
                  전체
                </span>
                {showcasePlatformDisplay.slice(0, 3).map(({ name }) => (
                  <span
                    key={`showcase-filter-${activeAudience}-${name}`}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500"
                  >
                    {name}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:hidden">
                {mobileRenderedReviews.map((review) => renderShowcaseReviewCard(review, true))}
              </div>

              {hasMoreMobileReviews && (
                <div className="mt-4 flex justify-center md:hidden">
                  <button
                    type="button"
                    onClick={() => setShowAllMobileReviews((current) => !current)}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#FF6B35] hover:text-[#FF6B35]"
                  >
                    {showAllMobileReviews ? "리뷰 접기" : `리뷰 ${remainingMobileReviewCount}개 더 보기`}
                  </button>
                </div>
              )}

              <div className="mt-8 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                {showcaseVisibleReviews.map((review) => renderShowcaseReviewCard(review))}
              </div>

              <div className="mt-6 rounded-[1.2rem] border border-gray-200 bg-[#FAFAF9] px-4 py-4 md:rounded-[1.5rem] md:px-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm leading-6 text-gray-600">
                    공개된 리뷰를 그대로 보고, 원문 캡처가 있는 리뷰는 바로 확대해서 확인할 수 있습니다. 원하면 실제 공개 프로필로 이어서 볼 수도 있습니다.
                  </p>
                  {activeShowcaseHref ? (
                    <Link href={activeShowcaseHref}>
                      <Button variant="outline" className="rounded-full border-gray-300 bg-white text-sm text-gray-700 hover:border-[#FF6B35] hover:text-[#FF6B35]">
                        전체 리뷰 보기
                      </Button>
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500">
                      홈에서 구조 미리보기
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="career-tree" className="bg-white px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <span className="mb-2 block text-sm font-medium text-[#FF6B35]">CAREER TREE</span>
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-gray-900 md:text-4xl">
              어디서 어떻게 쌓아왔는지도
              <span className="text-[#FF6B35]"> 한 번에</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              후기만으로 다 담기지 않는 활동 이력과 업력을, 고객이 한눈에 이해할 수 있게 보여줍니다.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="rounded-[2rem] border border-gray-200 bg-[#FAFAF9] p-5 md:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Career timeline</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-gray-900">
                  {activeCareerContent.headline}
                </h3>
              </div>

              <div className="space-y-4">
                {activeCareerContent.entries.map((entry, index) => (
                  <div key={`career-${activeAudience}-${entry.year}`} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4">
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F1720] text-sm font-bold text-white">
                        {entry.year}
                      </div>
                      {index < activeCareerContent.entries.length - 1 && (
                        <div className="absolute left-5 top-12 h-[calc(100%-2rem)] w-px bg-[#DDD3DA]" />
                      )}
                    </div>
                    <div className="rounded-[1.25rem] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                      <p className="text-base font-semibold text-gray-900">{entry.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Portfolio</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-gray-900">
                    포트폴리오 미리보기
                  </h3>
                </div>
                <span className="rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-semibold text-[#FF6B35]">
                  {heroProfessionLabel}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {activeShowcase.portfolioImages.slice(0, 4).map((imageSrc, index) => (
                  <div
                    key={`career-portfolio-${activeAudience}-${index}`}
                    className={`relative overflow-hidden rounded-[1.3rem] border border-[#EFE4DB] bg-[#FBF7F3] ${
                      index === 0 ? "col-span-2 h-44" : "h-32"
                    }`}
                  >
                    <Image
                      src={imageSrc}
                      alt={`${activeShowcase.name} 포트폴리오 미리보기 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.25rem] bg-[#FAFAF9] px-4 py-4">
                <p className="text-sm font-semibold text-gray-900">고객이 먼저 보는 핵심 정보</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {heroSummaryChips.map((chip) => (
                    <span
                      key={`career-chip-${activeAudience}-${chip}`}
                      className="rounded-full border border-[#E9DFE5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6A5563]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="share-flow" className="bg-[#F7F7F5] px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-2 block text-sm font-medium text-[#FF6B35]">SHARE FLOW</span>
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-gray-900 md:text-4xl">
              고객에게 보내는 순간도
              <span className="text-[#FF6B35]"> 쉽게 이어집니다</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600 md:text-lg">
              카톡으로 바로 보내고, 인스타나 스레드 소개 링크에도 자연스럽게 붙일 수 있게 준비된 구조입니다.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#FFF0E8] p-2.5">
                  <MessageCircle className="h-5 w-5 text-[#FF6B35]" />
                </span>
                <p className="text-lg font-bold tracking-[-0.03em] text-gray-900">카톡으로 바로</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                상담 전에 링크 한 번만 보내면, 리뷰와 포트폴리오를 한 화면으로 전달할 수 있습니다.
              </p>
            </Card>

            <Card className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#F3F0FF] p-2.5">
                  <Link2 className="h-5 w-5 text-[#6A5563]" />
                </span>
                <p className="text-lg font-bold tracking-[-0.03em] text-gray-900">소개 링크에 붙이기</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                인스타 프로필, 스레드 소개, DM 응답에 같은 링크를 반복해서 쓸 수 있습니다.
              </p>
            </Card>

            <Card className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#EEF4FF] p-2.5">
                  <Send className="h-5 w-5 text-[#315EF8]" />
                </span>
                <p className="text-lg font-bold tracking-[-0.03em] text-gray-900">보낸 뒤 바로 문의</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                고객은 링크를 보고 더 빨리 믿고, 상담 버튼이나 연락 수단으로 자연스럽게 이어집니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="setup" className="bg-white px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-2 block text-sm font-medium" style={{ color: heroPalette.accent }}>START FAST</span>
            <h2 className="text-3xl font-bold tracking-[-0.05em] md:text-4xl" style={{ color: heroPalette.textStrong }}>
              시작은 가볍게
            </h2>
            <p className="mt-4 text-base leading-7 md:text-lg" style={{ color: heroPalette.textBody }}>
              스크린샷으로 먼저 가져오거나, 리뷰 옮겨드림으로 빠르게 시작할 수 있습니다. 직접 가져오기는 첫 세팅 기준 최대 {launchOffer.ocrImportLimit}개까지 추천합니다.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {REVIEW_IMPORT_METHODS.map((item) => (
              <Card
                key={item.step}
                className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${item.accent} p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]`}
                style={{ borderColor: heroPalette.line, borderWidth: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: heroPalette.accent }}>{item.step}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#B69A89" }}>
                      {item.eyebrow}
                    </p>
                  </div>
                  <span
                    className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium"
                    style={{ borderColor: heroPalette.line, color: heroPalette.textMuted, borderWidth: 1 }}
                  >
                    {item.title}
                  </span>
                </div>
                <div className="mt-5">{renderImportPreview(item.preview)}</div>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.03em]" style={{ color: heroPalette.textStrong }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6" style={{ color: heroPalette.textBody }}>
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={Boolean(expandedPreviewImage)} onOpenChange={(open) => !open && setExpandedPreviewImage(null)}>
        <DialogContent className="max-w-3xl border-[#ead8cd] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#38271f]">이미지 확대 보기</DialogTitle>
          </DialogHeader>
          {expandedPreviewImage && (
            <div className="overflow-hidden rounded-[1.75rem] border border-[#efe2d6] bg-[#fbf8f4] p-4">
              <div className="relative h-[26rem] w-full">
                <Image
                  src={expandedPreviewImage}
                  alt="확대 이미지"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 48rem"
                  unoptimized
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      </main>
  )
}
