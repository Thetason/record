"use client"

import { useState, useEffect } from "react"
import type { CSSProperties } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Share1Icon,
  CheckIcon,
  CalendarIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  DownloadIcon
} from "@radix-ui/react-icons"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { ExternalLink, MapPin, PhoneCall, Sparkles, Star } from "lucide-react"
import type { PublicProfile as ProfileData, PublicReview as Review } from "@/lib/profile"

const DEFAULT_ACCENT = "#FF6B35"

function hexToRgba(value: string | undefined, alpha: number) {
  if (!value) {
    return `rgba(255, 107, 53, ${alpha})`
  }

  const hex = value.replace("#", "")
  const normalized = hex.length === 3
    ? hex.split("").map(char => char + char).join("")
    : hex

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `rgba(255, 107, 53, ${alpha})`
  }

  const intValue = Number.parseInt(normalized, 16)
  const red = (intValue >> 16) & 255
  const green = (intValue >> 8) & 255
  const blue = intValue & 255
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getIntroVideoEmbedUrl(value: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./, "")

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId = url.searchParams.get("v")
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (hostname === "vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean)[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }
  } catch {
    return null
  }

  return null
}

function renderRatingStars(rating: number | null, accentColor: string, size = "w-3.5 h-3.5") {
  if (!rating || rating <= 0) return null

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`${size} ${index < Math.round(rating) ? "fill-current" : "text-gray-300"}`}
            style={index < Math.round(rating) ? { color: accentColor } : undefined}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function ProfileClient({
  profile,
  embedded = false
}: {
  profile: ProfileData
  // embedded: rendered inside the dashboard preview frame, so the floating
  // header must stay inside the frame instead of overlaying the app shell
  embedded?: boolean
}) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [copied, setCopied] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeReview, setActiveReview] = useState<Review | null>(null)
  const [coverError, setCoverError] = useState(false)
  const [isEmbedMode, setIsEmbedMode] = useState(false)

  useEffect(() => {
    // Check for embed mode
    const params = new URLSearchParams(window.location.search)
    setIsEmbedMode(params.get('embed') === 'true')
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setCoverError(false)
  }, [profile.coverImage])

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ${profile.profession}`,
          text: `${profile.totalReviews}개의 리뷰로 증명하는 실력`,
          url: url
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const filteredReviews = selectedPlatform === "all" 
    ? profile.reviews 
    : profile.reviews.filter(r => r.platform === selectedPlatform)

  const directReviews = profile.reviews.filter(review => review.proofType === 'direct')
  const archivedReviews = profile.reviews.filter(review => review.proofType === 'archived')
  const imageProofCount = profile.reviews.filter(review => Boolean(review.imageUrl)).length
  const averageRating = (() => {
    const ratings = profile.reviews
      .map(review => review.rating)
      .filter((rating): rating is number => typeof rating === "number" && rating > 0)

    if (ratings.length === 0) return null
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  })()
  const accentColor = profile.accentColor || DEFAULT_ACCENT
  const accentSoft = hexToRgba(accentColor, 0.12)
  const accentStrong = hexToRgba(accentColor, 0.18)
  const introVideoEmbedUrl = getIntroVideoEmbedUrl(profile.introVideo)
  const actionButtonStyle: CSSProperties = {
    backgroundColor: accentColor,
    borderColor: accentColor
  }
  const actionOutlineStyle: CSSProperties = {
    borderColor: accentStrong,
    color: accentColor
  }
  const scoreReview = (review: Review) => {
    let currentScore = 0
    if (review.isFeatured) currentScore += 10
    if (review.proofType === 'direct') currentScore += 4
    if (review.verified) currentScore += 2
    if (review.imageUrl) currentScore += 2
    if (review.originalUrl) currentScore += 1
    if (review.rating && review.rating >= 5) currentScore += 1
    return currentScore
  }

  const prioritizedReviews = [...filteredReviews]
    .sort((a, b) => {
      const scoreDiff = scoreReview(b) - scoreReview(a)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
    })
  const pinnedReviews = prioritizedReviews.filter((review) => review.isFeatured).slice(0, 3)
  const pinnedReviewIds = new Set(pinnedReviews.map((review) => review.id))
  const allReviewSource = pinnedReviews.length > 0
    ? prioritizedReviews.filter((review) => !pinnedReviewIds.has(review.id))
    : prioritizedReviews
  const initialVisibleReviewCount = pinnedReviews.length > 0 ? 6 : 9
  const visibleAllReviews = showAllReviews ? allReviewSource : allReviewSource.slice(0, initialVisibleReviewCount)
  const hiddenReviewCount = Math.max(allReviewSource.length - visibleAllReviews.length, 0)
  const archivePlatforms = Array.from(new Set(archivedReviews.map(review => review.platform)))
  const bookingUrl = profile.socialLinks.website
  const phoneHref = profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, '')}` : null
  const hasCareerContext = Boolean(
    profile.experience ||
    profile.location ||
    profile.careerTimeline.length > 0 ||
    profile.specialties.length > 0 ||
    profile.certifications.length > 0
  )
  const hasPortfolioSection = profile.portfolioImages.length > 0 || hasCareerContext
  const salesSignals = [
    profile.specialties?.[0] ?? null,
    profile.specialties?.[1] ?? null,
    profile.portfolioImages.length > 0 ? `작업 사진 ${profile.portfolioImages.length}장` : null,
    imageProofCount > 0 ? `리뷰 캡처 ${imageProofCount}개` : null,
    archivedReviews.length > 0 ? `${archivePlatforms.slice(0, 2).join(" · ")} 후기` : null,
    directReviews.length > 0 ? `직접 후기 ${directReviews.length}개` : null,
    averageRating ? `평균 ${averageRating.toFixed(1)}` : null
  ].filter((item): item is string => Boolean(item))
  const primaryAction = bookingUrl
    ? {
        href: bookingUrl,
        label: "예약·상담 바로 가기",
        icon: <ExternalLink className="w-4 h-4 mr-2" />,
        external: true
      }
    : phoneHref
    ? {
        href: phoneHref,
        label: "전화로 바로 상담하기",
        icon: <PhoneCall className="w-4 h-4 mr-2" />,
        external: false
      }
    : null
  const mobileHeroReview = pinnedReviews[0] ?? prioritizedReviews[0] ?? null
  const mobileHeroChips = [profile.experience, profile.location]
    .filter((item): item is string => Boolean(item))
    .slice(0, 2)
  const mobilePortfolioPreview = profile.portfolioImages.slice(0, 2)
  const scrollToSection = (id: string) => {
    if (typeof window === "undefined") return
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  const openPrimaryAction = () => {
    if (typeof window === "undefined") return
    if (!primaryAction) {
      scrollToSection("contact-cta")
      return
    }

    if (primaryAction.external) {
      window.open(primaryAction.href, "_blank", "noopener,noreferrer")
      return
    }

    window.location.href = primaryAction.href
  }
  const portfolioSummarySignals = [
    profile.experience,
    profile.location,
    ...profile.certifications.slice(0, 2),
  ].filter((item): item is string => Boolean(item))
  const trustActions = [
    {
      key: "reviews",
      label: "대표 리뷰 보기",
      onClick: () => scrollToSection("reviews-section"),
      variant: "outline" as const,
    },
    ...(hasPortfolioSection
      ? [{
          key: "portfolio",
          label: "포트폴리오 & 경력",
          onClick: () => scrollToSection("portfolio-career-section"),
          variant: "outline" as const,
        }]
      : []),
  ]

  const platformColors: Record<string, string> = {
    네이버: "from-green-500 to-green-600",
    카카오: "from-yellow-400 to-yellow-500",
    카카오맵: "from-yellow-400 to-yellow-500",
    구글: "from-blue-500 to-blue-600",
    인스타: "from-purple-500 to-pink-500",
    인스타그램: "from-purple-500 to-pink-500",
    당근: "from-orange-400 to-orange-500",
    'Re:cord': "from-[#FF6B35] to-[#F97316]"
  }

  const platformIcons: Record<string, string> = {
    네이버: "N",
    카카오: "K",
    카카오맵: "K",
    구글: "G",
    인스타: "I",
    인스타그램: "I",
    당근: "D",
    'Re:cord': "R"
  }

  const getProofBadge = (review: Review) => {
    if (review.proofType === 'direct') {
    return {
      label: '직접 받은 후기',
        className: '',
        style: {
          backgroundColor: accentSoft,
          color: accentColor
        } satisfies CSSProperties
      }
    }

    return {
      label: '플랫폼 후기',
      className: 'bg-slate-100 text-slate-600',
      style: undefined
    }
  }

  const renderReviewCard = (review: Review, options?: { compact?: boolean }) => {
    const proofBadge = getProofBadge(review)
    const compact = options?.compact === true

    return (
      <Card className="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
        {review.imageUrl && (
          <div className="relative h-44 overflow-hidden border-b border-gray-100 bg-[#f7f7f5]">
            <Image
              src={review.imageUrl}
              alt={`${review.author} 리뷰 이미지`}
              fill
              className="object-contain object-top p-3"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 28vw"
              unoptimized
            />
            <button
              type="button"
              onClick={() => {
                setActiveImage(review.imageUrl as string)
                setActiveReview(review)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-white"
            >
              이미지 확대
            </button>
          </div>
        )}

        <CardContent className={`${compact ? "p-5" : "p-6"} flex flex-col gap-4`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${(platformColors[review.platform] ?? 'from-gray-400 to-gray-500')} text-lg font-bold text-white shadow-sm`}>
                {platformIcons[review.platform] ?? review.platform.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-gray-900">{review.business}</p>
                <p className="mt-1 text-sm text-gray-500">{review.platform}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {review.isFeatured && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: accentSoft, color: accentColor }}
                >
                  <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                  추천
                </span>
              )}
              {review.verified && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  <CheckIcon className="mr-1 h-3 w-3" />
                  인증됨
                </span>
              )}
            </div>
          </div>

          {renderRatingStars(review.rating, accentColor, "w-4 h-4")}

          <div className="space-y-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${proofBadge.className}`}
              style={proofBadge.style}
            >
              {proofBadge.label}
            </span>
            <p className={`${compact ? "text-[0.98rem] leading-8" : "text-[1.04rem] leading-8"} whitespace-pre-wrap text-gray-700`}>
              {review.content}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{review.author}</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {new Date(review.reviewDate).toLocaleDateString()}
            </span>
          </div>

          {review.originalUrl && (
            <a
              href={review.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: accentColor }}
            >
              <ExternalLink className="h-4 w-4" />
              원문 리뷰 보기
            </a>
          )}
        </CardContent>
      </Card>
    )
  }

  // Embed mode: Simplified layout for iframe embedding
  if (isEmbedMode) {
    return (
      <div className="min-h-screen bg-white" style={{ backgroundColor: profile.bgColor || "#ffffff" }}>
        {/* Compact Profile Header */}
        <div
          className="p-6"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.95)}, ${hexToRgba(accentColor, 0.72)})`
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              {profile.profession && (
                <p className="text-sm text-white/80">{profile.profession}</p>
              )}
              <p className="text-xs text-white/60 mt-1">{profile.totalReviews}개의 리뷰</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid - Compact */}
        <div className="p-4">
          {/* Platform Filter */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex bg-gray-100 rounded-full p-1 text-xs">
              <button
                onClick={() => setSelectedPlatform("all")}
                className={`px-3 py-1 rounded-full transition-all ${
                  selectedPlatform === "all"
                    ? "bg-white shadow-sm font-medium"
                    : "text-gray-600"
                }`}
                style={selectedPlatform === "all" ? { color: accentColor } : undefined}
              >
                전체
              </button>
              {profile.platforms.slice(0, 4).map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      selectedPlatform === platform
                        ? "bg-white shadow-sm font-medium"
                        : "text-gray-600"
                    }`}
                    style={selectedPlatform === platform ? { color: accentColor } : undefined}
                  >
                    {platform}
                  </button>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-3">
            {filteredReviews.slice(0, 6).map((review) => (
              <Card key={review.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${(platformColors[review.platform] ?? 'from-gray-400 to-gray-500')} flex items-center justify-center text-white text-xs font-bold`}>
                        {platformIcons[review.platform] ?? review.platform.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{review.business}</p>
                        <p className="text-xs text-gray-500">{review.platform}</p>
                      </div>
                    </div>
                    {review.verified && (
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {review.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{review.author}</span>
                    <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View Full Profile Link */}
          <div className="mt-6 text-center">
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: accentColor }}
            >
              페이지 전체 보기 →
            </a>
          </div>

          {/* Watermark for Free Plan */}
          {profile.plan === 'free' && (
            <div className="mt-6 pt-4 border-t text-center">
              <a 
                href="/?ref=widget" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF6B35] transition-colors"
              >
                <span>Powered by</span>
                <span className="font-bold">Re:cord</span>
                <span className="text-[#FF6B35]">*</span>
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          background:
            profile.theme === "dark"
              ? "linear-gradient(to bottom, #111827, #0f172a)"
              : `linear-gradient(to bottom, ${hexToRgba(accentColor, 0.06)}, ${profile.bgColor || "#ffffff"})`
        }}
      >
      {/* Floating Header */}
      <header className={`${embedded ? "absolute" : "fixed"} top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-xl shadow-lg" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-1 md:gap-2">
              <span className="text-lg md:text-xl font-bold">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>
            <Button
              onClick={handleShare}
              size="sm"
              className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#E55A2B] hover:to-[#D54A1B] text-white shadow-lg text-xs md:text-sm"
            >
              {copied ? (
                <>
                  <CheckIcon className="mr-2" />
                  복사됨!
                </>
              ) : (
                <>
                  <Share1Icon className="mr-2" />
                  공유하기
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="relative h-[19vh] md:h-[30vh] overflow-hidden">
        {/* Cover Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/70 z-10" />
          {profile.coverImage && !coverError ? (
            <Image
              src={profile.coverImage}
              alt=""
              fill
              className="object-cover"
              priority
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1f2937] via-[#2d3a4b] to-[#111827]" />
          )}
        </div>

        {/* Profile Content */}
        <div className="relative z-20 hidden h-full items-center pb-4 md:flex md:pb-6">
          <div className="container mx-auto px-3 md:px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      width={160}
                      height={160}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center md:text-left flex-1"
              >
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-2">
                  {profile.name}
                </h1>
                {(profile.profession || profile.experience || profile.location) && (
                  <p className="text-base md:text-lg lg:text-xl text-white/90 mb-3 flex items-center gap-2 justify-center md:justify-start">
                    {profile.profession && <span>{profile.profession}</span>}
                    {profile.profession && (profile.experience || profile.location) && <span>·</span>}
                    {profile.experience && <span>{profile.experience}</span>}
                    {profile.experience && profile.location && <span>·</span>}
                    {profile.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </span>
                    )}
                  </p>
                )}
                <p className="text-sm md:text-base text-white/80 max-w-2xl mb-2">
                  {profile.bio}
                </p>
                {salesSignals.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    {salesSignals.slice(0, 4).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-12 px-4 md:hidden">
        <div className="mx-auto max-w-[21rem] rounded-[2.1rem] border border-[#2d2431]/10 bg-[#faf6f2] px-4 pb-4 pt-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="relative -mt-14 flex justify-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-700">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-center">
            <h1 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#2b2230]">
              {profile.name}
            </h1>
            {profile.profession && (
              <p className="mt-1 text-sm font-medium text-[#6b6270]">{profile.profession}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {mobileHeroChips.map((item) => (
              <span
                key={`mobile-hero-chip-${item}`}
                className="rounded-full border border-[#e6dde6] bg-white px-3 py-1 text-[11px] font-semibold text-[#6b6270] shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => scrollToSection("reviews-section")}
              className="rounded-full bg-[#231b25] px-4 py-3 text-sm font-semibold text-white"
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={openPrimaryAction}
              className="rounded-full px-4 py-3 text-sm font-semibold text-[#7b7380]"
            >
              Contact
            </button>
          </div>

          {mobileHeroReview && (
            <button
              type="button"
              onClick={() => scrollToSection("reviews-section")}
              className="mt-4 block w-full rounded-[1.75rem] border border-[#efe5e7] bg-white px-4 py-4 text-left shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: accentSoft, color: accentColor }}
                  >
                    {mobileHeroReview.platform}
                  </span>
                  {(mobileHeroReview.imageUrl || mobileHeroReview.originalUrl) && (
                    <span className="rounded-full border border-[#ece4ea] bg-[#faf7fb] px-3 py-1 text-[11px] font-semibold text-[#7f7383]">
                      원문 캡처
                    </span>
                  )}
                </div>
                {renderRatingStars(mobileHeroReview.rating, accentColor, "w-4 h-4")}
              </div>

              <div className={`mt-3 ${mobileHeroReview.imageUrl ? "grid grid-cols-[1fr,4.5rem] gap-3" : ""}`}>
                <div className="min-w-0">
                  <p className="line-clamp-4 text-[1.03rem] font-semibold leading-7 text-[#2d2431]">
                    “{mobileHeroReview.content}”
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#7b7380]">
                    <span className="truncate">{mobileHeroReview.author}</span>
                    <span>총 {prioritizedReviews.length}개</span>
                  </div>
                </div>

                {mobileHeroReview.imageUrl && (
                  <div className="relative h-[5.4rem] overflow-hidden rounded-[1.2rem] border border-[#eee4dd] bg-[#faf7f4]">
                    <Image
                      src={mobileHeroReview.imageUrl}
                      alt={`${mobileHeroReview.author} 리뷰 캡처`}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                    <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 px-2 py-1 text-center text-[10px] font-semibold text-[#7b7380]">
                      원문
                    </span>
                  </div>
                )}
              </div>
            </button>
          )}

          {hasPortfolioSection && (
            <button
              type="button"
              onClick={() => scrollToSection("portfolio-career-section")}
              className="mt-4 block w-full rounded-[1.75rem] border border-[#d9ddff] bg-white px-4 py-4 text-left shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[1.02rem] font-bold leading-6 text-[#2d2431]">포트폴리오 &amp; 경력</p>
                  <p className="mt-1 text-xs text-[#7b7380]">업력과 결과물을 한눈에 보기</p>
                </div>
                <span className="rounded-full bg-[#eef1ff] px-3 py-2 text-[11px] font-bold text-[#4c5ef7]">
                  CAREER TREE
                </span>
              </div>

              {mobilePortfolioPreview.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {mobilePortfolioPreview.map((imageUrl, index) => (
                    <div
                      key={`mobile-portfolio-${imageUrl}-${index}`}
                      className="relative h-[5.2rem] overflow-hidden rounded-[1.05rem] border border-[#f1ebe6] bg-[#f7f3ef]"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${profile.name} 포트폴리오 ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </button>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => scrollToSection("all-reviews")}
              className="rounded-[1.55rem] bg-[#231b25] px-4 py-4 text-left text-white shadow-[0_14px_28px_rgba(35,27,37,0.18)]"
            >
              <p className="text-base font-bold">리뷰 전체보기</p>
              <p className="mt-1 text-xs text-white/75">전체 후기와 원문 캡처</p>
            </button>

            <button
              type="button"
              onClick={openPrimaryAction}
              className="rounded-[1.55rem] border border-[#ebe1e7] bg-white px-4 py-4 text-left shadow-sm"
            >
              <p className="text-base font-bold text-[#2d2431]">상담 링크 열기</p>
              <p className="mt-1 text-xs text-[#7b7380]">
                {bookingUrl ? "카톡, 전화, 예약 링크로 이동" : "문의할 수 있는 방법 보기"}
              </p>
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-8 md:-mt-10 px-4 hidden md:block">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: accentColor }}>신뢰 포트폴리오</p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  고객이 실제로 보게 될 신뢰 포트폴리오
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  이름, 대표 리뷰, 작업 분위기, 상담 버튼까지. 새 고객에게 보낼 때 필요한 것만 남겼습니다.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
                총 {prioritizedReviews.length}개 공개 리뷰
              </span>
            </div>
            {salesSignals.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {salesSignals.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {trustActions.map((action) => (
                <Button
                  key={action.key}
                  type="button"
                  variant={action.variant}
                  onClick={action.onClick}
                  className="rounded-full border-gray-200 bg-white text-xs text-gray-700 hover:border-current hover:bg-white md:text-sm"
                  style={action.variant === "outline" ? actionOutlineStyle : undefined}
                >
                  {action.label}
                </Button>
              ))}
              {primaryAction && (
                <a
                  href={primaryAction.href}
                  target={primaryAction.external ? "_blank" : undefined}
                  rel={primaryAction.external ? "noopener noreferrer" : undefined}
                >
                  <Button className="rounded-full text-white" style={actionButtonStyle}>
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {introVideoEmbedUrl && (
        <section className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: accentColor }}>Intro Video</p>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                    이 전문가의 분위기와 설명 방식을 먼저 확인해보세요
                  </h3>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black">
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    src={introVideoEmbedUrl}
                    title={`${profile.name} 소개 영상`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasPortfolioSection && (
        <section id="portfolio-career-section" className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: accentColor }}>Portfolio &amp; Career</p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900 md:text-xl">
                    포트폴리오 &amp; 경력
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      후기만으로 다 담기지 않는 작업 분위기와 업력까지, 고객이 한 번에 이해할 수 있게 보여줍니다.
                    </p>
                  </div>
                {profile.portfolioImages.length > 0 && (
                  <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                    {profile.portfolioImages.length}장
                  </span>
                )}
              </div>

              {portfolioSummarySignals.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {portfolioSummarySignals.map((item) => (
                    <span
                      key={`portfolio-summary-${item}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {profile.specialties.length > 0 && (
                <div className="mb-5 rounded-[1.35rem] border border-gray-200 bg-[#faf8f6] px-4 py-4">
                  <p className="text-sm font-semibold text-gray-900">고객이 먼저 이해할 핵심 분야</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.specialties.map((item) => (
                      <span
                        key={`specialty-${item}`}
                        className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.careerTimeline.length > 0 && (
                <div className="mb-5 rounded-[1.5rem] border border-gray-200 bg-[#faf8f6] px-4 py-4 md:px-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Career Tree</p>
                      <p className="mt-2 text-base font-bold text-gray-900">어디서 어떻게 쌓아왔는지</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-gray-500 shadow-sm">
                      {profile.careerTimeline.length} 단계
                    </span>
                  </div>

                  <div className="space-y-4">
                    {profile.careerTimeline.map((entry, index) => (
                      <div key={`${entry.period}-${entry.title}-${index}`} className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3">
                        <div className="relative flex flex-col items-center">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: accentColor }}>
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          {index < profile.careerTimeline.length - 1 && (
                            <div className="mt-2 h-full w-px bg-[#ddd3da]" />
                          )}
                        </div>
                        <div className="rounded-[1.2rem] border border-white bg-white px-4 py-4 shadow-sm">
                          <span className="rounded-full bg-[#faf5f1] px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                            {entry.period}
                          </span>
                          <p className="mt-3 text-sm font-semibold text-gray-900 md:text-base">{entry.title}</p>
                          <p className="mt-2 text-sm leading-6 text-gray-600">{entry.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.portfolioImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {profile.portfolioImages.slice(0, 6).map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => {
                        setActiveImage(imageUrl)
                        setActiveReview(null)
                      }}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-gray-200 bg-[#f7f7f5]"
                    >
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={imageUrl}
                          alt={`${profile.name} 포트폴리오 ${index + 1}`}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          unoptimized
                        />
                      </div>
                      <div className="absolute inset-x-3 bottom-3 rounded-full bg-white/92 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                        이미지 확대
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews-section" className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              고객이 남긴 진짜 리뷰
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-500 md:text-base">
              총 {prioritizedReviews.length}개 리뷰가 공개되어 있습니다. 먼저 보는 리뷰로 분위기를 확인하고, 아래에서 전체 후기를 이어서 볼 수 있어요.
            </p>
          </div>

          {pinnedReviews.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                  <h3 className="text-lg font-bold text-gray-900 md:text-xl">먼저 보는 리뷰</h3>
                </div>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
                  대표로 먼저 보여드리는 후기
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {pinnedReviews.map((review) => (
                  <div key={`featured-${review.id}`}>
                    {renderReviewCard(review)}
                  </div>
                ))}
              </div>
              {allReviewSource.length > 0 && (
                <div className="mt-5 rounded-[1.5rem] border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600">
                  아래에서 나머지 리뷰 {allReviewSource.length}개를 이어서 볼 수 있습니다.
                </div>
              )}
            </div>
          )}

          {/* Platform Filter */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full bg-white p-1 shadow-lg">
              <button
                onClick={() => setSelectedPlatform("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedPlatform === "all"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={selectedPlatform === "all" ? actionButtonStyle : undefined}
              >
                전체
              </button>
              {profile.platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedPlatform === platform
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  style={selectedPlatform === platform ? actionButtonStyle : undefined}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {visibleAllReviews.length > 0 && (
            <>
              <div id="all-reviews" className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">전체 후기</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {pinnedReviews.length > 0
                      ? "대표 리뷰 아래에서 전체 후기를 그대로 이어서 확인할 수 있습니다."
                      : "등록된 리뷰를 최신성과 신뢰도 기준으로 먼저 보여드립니다."}
                  </p>
                </div>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-500">
                  전체 {prioritizedReviews.length}개
                </span>
              </div>

              <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
                {visibleAllReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="mb-5 break-inside-avoid"
                  >
                    {renderReviewCard(review, { compact: true })}
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Load More */}
          {allReviewSource.length > initialVisibleReviewCount && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllReviews(prev => !prev)}
                className="border-2 transition-all"
                style={actionOutlineStyle}
              >
                {showAllReviews ? '리뷰 접기' : `리뷰 ${hiddenReviewCount}개 더 보기`}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact-cta" className="py-20" style={{ background: `linear-gradient(135deg, ${accentColor}, ${hexToRgba(accentColor, 0.82)})` }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            내 이름의 신뢰 포트폴리오 만들기
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            대표 리뷰, 작업 분위기, 상담 버튼을 한 링크에 담아 예비고객에게 바로 전달해보세요.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-[#FF6B35] hover:bg-gray-100 shadow-2xl text-lg px-8 py-6"
            >
              내 링크 만들기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Re:cord</span>
              <span style={{ color: accentColor }}>*</span>
              <span className="text-sm text-gray-500">
                - 상담 전에 보내는 신뢰 포트폴리오
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {profile.plan === 'free' ? "Powered by Re:cord · " : ""}© 2024 Re:cord. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      </div>

      <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && (setActiveImage(null), setActiveReview(null))}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {activeReview ? `${activeReview.platform} · ${activeReview.business}` : '리뷰 첨부 이미지'}
            </DialogTitle>
          </DialogHeader>
          {activeImage && (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              doubleClick={{ mode: "zoomIn" }}
              wheel={{ step: 0.1 }}
              pinch={{ step: 5 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="relative">
                  {/* 컨트롤 버튼 */}
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => zoomIn()}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ZoomInIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => zoomOut()}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ZoomOutIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => resetTransform()}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <ResetIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = activeImage
                        link.download = `review-image-${Date.now()}.jpg`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 이미지 영역 */}
                  <TransformComponent
                    wrapperClass="!w-full !h-[70vh] overflow-hidden rounded-xl border bg-gray-100"
                    contentClass="!w-full !h-full flex items-center justify-center"
                  >
                    <Image
                      src={activeImage}
                      alt="리뷰 첨부 이미지 확대"
                      width={1200}
                      height={800}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  </TransformComponent>

                  {/* 사용 안내 */}
                  <div className="mt-3 text-center text-sm text-gray-500">
                    💡 드래그로 이동 · 더블클릭/휠로 확대/축소 · 핀치 제스처 지원
                  </div>
                </div>
              )}
            </TransformWrapper>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
