"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  DownloadIcon,
  CheckIcon
} from "@radix-ui/react-icons"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PublicProfile as ProfileData, PublicReview as Review } from "@/lib/profile"

// Record orange is the single accent. A per-profile accentColor still wins,
// but the legacy defaults map onto the brand orange for consistency.
const ORANGE = "#ff6b35"
const LEGACY_DEFAULTS = new Set(["#ff6b35", "#f97316", ""])

function resolveAccent(value: string | undefined | null) {
  const v = (value || "").trim().toLowerCase()
  if (!v || LEGACY_DEFAULTS.has(v)) return ORANGE
  return value as string
}

// Soft tinted badge per platform (no harsh brand fills).
function platformBadge(platform: string): { bg: string; color: string } {
  const p = platform.toLowerCase()
  if (p.includes("네이버")) return { bg: "#eaf6ec", color: "#0a8a3c" }
  if (p.includes("카카오")) return { bg: "#f6efd6", color: "#7a5f00" }
  if (p.includes("구글") || p.includes("google")) return { bg: "#eaf0fe", color: "#1a56db" }
  if (p.includes("인스타") || p.includes("instagram")) return { bg: "#fcebf3", color: "#b83280" }
  if (p.includes("당근")) return { bg: "#fff0e6", color: "#c2410c" }
  if (p.includes("re:cord") || p.includes("record") || p.includes("리코드"))
    return { bg: "rgba(255,107,53,0.1)", color: "#d4501f" }
  return { bg: "#f1f3f5", color: "#4e5968" }
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

function formatReviewDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating || rating <= 0) return null
  const filled = Math.min(Math.round(rating), 5)
  return (
    <span className="rc-star" aria-label={`별점 ${rating.toFixed(1)}점`}>
      {"★".repeat(filled)}
      <span style={{ opacity: 0.28 }}>{"★".repeat(5 - filled)}</span>
    </span>
  )
}

const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.5-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
    </svg>
  ),
  insta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  ext: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14L21 3" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-4.5-4.5L6 21" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  ),
  person: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  ),
  chev: (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

type PanelKey = "reviews" | "photos" | "video" | "about"

export default function ProfileClient({
  profile,
  embedded = false
}: {
  profile: ProfileData
  embedded?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeReview, setActiveReview] = useState<Review | null>(null)
  const [isEmbedMode, setIsEmbedMode] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsEmbedMode(params.get("embed") === "true")
    const onScroll = () => setIsScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>(".rc-rise"))
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in")
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [openPanel, showAllReviews, isEmbedMode])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ${profile.profession}`,
          text: `${profile.totalReviews}개의 리뷰로 증명하는 실력`,
          url
        })
        return
      } catch {
        // fall through
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const accent = resolveAccent(profile.accentColor)
  const accentStyle = { "--rc-accent": accent } as CSSProperties
  const introVideoEmbedUrl = getIntroVideoEmbedUrl(profile.introVideo)

  const scoreReview = (review: Review) => {
    let s = 0
    if (review.isFeatured) s += 10
    if (review.proofType === "direct") s += 4
    if (review.verified) s += 2
    if (review.imageUrl) s += 2
    if (review.originalUrl) s += 1
    if (review.rating && review.rating >= 5) s += 1
    return s
  }

  const prioritizedAll = useMemo(
    () =>
      [...profile.reviews].sort((a, b) => {
        const diff = scoreReview(b) - scoreReview(a)
        if (diff !== 0) return diff
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile.reviews]
  )

  const INITIAL_VISIBLE = 5
  const visibleReviews = showAllReviews ? prioritizedAll : prioritizedAll.slice(0, INITIAL_VISIBLE)
  const hiddenCount = Math.max(prioritizedAll.length - visibleReviews.length, 0)
  const topReviewId = prioritizedAll[0]?.id

  const averageRating = (() => {
    const ratings = profile.reviews
      .map((r) => r.rating)
      .filter((r): r is number => typeof r === "number" && r > 0)
    if (ratings.length === 0) return null
    return ratings.reduce((a, b) => a + b, 0) / ratings.length
  })()

  const bookingUrl = profile.socialLinks.website
  const instaUrl = profile.socialLinks.instagram
  const phoneHref = profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, "")}` : null
  const reviewRequestHref = `/${profile.username}/review-request`

  const journeyTags = [
    profile.experience,
    profile.location,
    ...profile.certifications,
    ...profile.specialties
  ].filter((t): t is string => Boolean(t && t.trim()))
  const hasAbout = journeyTags.length > 0 || profile.careerTimeline.length > 0

  const showMakeBlock = !profile.plan || profile.plan === "free"
  const roleLine = [profile.profession, profile.location].filter(Boolean).join(" · ")
  const sourceLabel = (review: Review) =>
    review.proofType === "direct" ? "Re:cord 후기" : review.platform

  const openImage = (url: string, review: Review | null) => {
    setActiveImage(url)
    setActiveReview(review)
  }

  const togglePanel = (key: PanelKey) => {
    setOpenPanel((prev) => (prev === key ? null : key))
  }

  const reviewCard = (review: Review, options?: { featured?: boolean }) => {
    const badge = platformBadge(review.platform)
    return (
      <div className={`rc-review ${options?.featured ? "is-featured" : ""}`} key={review.id}>
        {options?.featured && (
          <span className="rc-featured-label">
            <CheckIcon width={13} height={13} aria-hidden="true" /> 대표 후기
          </span>
        )}
        <div className="rc-rev-top">
          <span className="rc-badge" style={{ background: badge.bg, color: badge.color }}>
            {sourceLabel(review)}
          </span>
          <Stars rating={review.rating} />
          {review.verified && (
            <span className="rc-verify">
              <CheckIcon width={13} height={13} aria-hidden="true" /> 검증됨
            </span>
          )}
        </div>
        <p className="rc-rev-body">{review.content}</p>
        <div className="rc-rev-foot">
          <span className="rc-author">{review.author}</span>
          {formatReviewDate(review.reviewDate) && <span>{formatReviewDate(review.reviewDate)}</span>}
          <span className="rc-rev-proof">
            {review.imageUrl && (
              <button type="button" onClick={() => openImage(review.imageUrl!, review)}>
                캡처 보기
              </button>
            )}
            {review.originalUrl && (
              <a href={review.originalUrl} target="_blank" rel="noreferrer">
                원문 ↗
              </a>
            )}
          </span>
        </div>
      </div>
    )
  }

  const linkButton = (opts: {
    key: PanelKey | string
    icon: ReactNode
    label: string
    expandable?: boolean
    href?: string
    external?: boolean
    primary?: boolean
  }) => {
    const chev = opts.expandable ? (
      <span className="rc-link-chev">{Icon.chev}</span>
    ) : null
    const inner = (
      <>
        <span className="rc-link-ico">{opts.icon}</span>
        <span>{opts.label}</span>
        {chev}
      </>
    )
    const cls = `rc-link ${opts.primary ? "rc-link-primary" : ""}`
    if (opts.expandable) {
      return (
        <button
          type="button"
          className={cls}
          aria-expanded={openPanel === opts.key}
          onClick={() => togglePanel(opts.key as PanelKey)}
        >
          {inner}
        </button>
      )
    }
    return (
      <a
        className={cls}
        href={opts.href}
        {...(opts.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    )
  }

  // ── Embed widget (compact) ───────────────────────────────────────────────
  if (isEmbedMode) {
    return (
      <div className="rc" style={{ ...accentStyle, background: "transparent" }}>
        <div className="rc-sheet" style={{ minHeight: "auto", paddingBottom: 8 }}>
          <div className="rc-hero" style={{ paddingTop: 16, textAlign: "left" }}>
            <p className="rc-name" style={{ fontSize: 22 }}>
              {profile.name}
            </p>
            <p className="rc-role">{roleLine || "신뢰 페이지"}</p>
            <div className="rc-stats" style={{ justifyContent: "flex-start" }}>
              <span className="rc-stat">
                리뷰 <b>{profile.totalReviews}</b>
              </span>
              {averageRating && (
                <span className="rc-stat">
                  <span className="rc-star">★</span> <b>{averageRating.toFixed(1)}</b>
                </span>
              )}
            </div>
          </div>
          <div className="rc-section" style={{ paddingTop: 12 }}>
            <div className="rc-reviews">
              {prioritizedAll.slice(0, 3).map((review) => reviewCard(review))}
            </div>
            <a
              className="rc-more"
              style={{ textDecoration: "none", marginTop: 12 }}
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              페이지 전체 보기 →
            </a>
            {showMakeBlock && (
              <p className="rc-colophon" style={{ paddingTop: 12 }}>
                <a href="/?ref=widget" target="_blank" rel="noopener noreferrer">
                  Powered by Re:cord
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Full page: linktree layout ───────────────────────────────────────────
  return (
    <div className="rc" ref={rootRef} style={accentStyle} data-embedded={embedded ? "true" : undefined}>
      <div className="rc-sheet">
        <header className={`rc-bar ${isScrolled ? "is-stuck" : ""}`}>
          <Link className="rc-wordmark" href="/" aria-label="Re:cord 홈">
            Re<i>:</i>cord
          </Link>
          <button type="button" className="rc-iconbtn" onClick={handleShare} aria-label="이 페이지 공유하기">
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
            </svg>
          </button>
        </header>

        {/* hero */}
        <div className="rc-hero rc-rise">
          <div className="rc-avatar">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={`${profile.name} 프로필 사진`}
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="rc-avatar-initial">{profile.name.charAt(0)}</span>
            )}
          </div>
          <h1 className="rc-name">{profile.name}</h1>
          {roleLine && <p className="rc-role">{roleLine}</p>}
          {profile.bio && <p className="rc-bio">{profile.bio}</p>}
          {(instaUrl || phoneHref) && (
            <div className="rc-icons">
              {instaUrl && (
                <a className="rc-icon" href={instaUrl} target="_blank" rel="noopener noreferrer" aria-label="인스타그램">
                  {Icon.insta}
                </a>
              )}
              {phoneHref && (
                <a className="rc-icon" href={phoneHref} aria-label="전화 걸기">
                  {Icon.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* link stack */}
        <div className="rc-stack rc-rise">
          {bookingUrl
            ? linkButton({ key: "cta", icon: Icon.ext, label: "상담·예약 문의하기", href: bookingUrl, external: true, primary: true })
            : phoneHref
              ? linkButton({ key: "cta", icon: Icon.phone, label: "전화로 상담하기", href: phoneHref, primary: true })
              : linkButton({ key: "cta", icon: Icon.pen, label: "후기 남기기", href: reviewRequestHref, primary: true })}

          {prioritizedAll.length > 0 && (
            <>
              {linkButton({
                key: "reviews",
                icon: Icon.star,
                label: averageRating
                  ? `고객 후기 ${profile.totalReviews}개 · 평균 ${averageRating.toFixed(1)}`
                  : `고객 후기 ${profile.totalReviews}개`,
                expandable: true
              })}
              {openPanel === "reviews" && (
                <div className="rc-panel">
                  {visibleReviews.map((review) =>
                    reviewCard(review, { featured: review.id === topReviewId })
                  )}
                  {(hiddenCount > 0 || showAllReviews) && (
                    <button
                      type="button"
                      className={`rc-more ${showAllReviews ? "is-open" : ""}`}
                      aria-expanded={showAllReviews}
                      onClick={() => setShowAllReviews((prev) => !prev)}
                    >
                      {showAllReviews ? "접기" : `후기 ${hiddenCount}개 더 보기`}
                      <span className="rc-arw" aria-hidden="true">▾</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {profile.portfolioImages.length > 0 && (
            <>
              {linkButton({
                key: "photos",
                icon: Icon.photo,
                label: `작업 사진 ${profile.portfolioImages.length}장`,
                expandable: true
              })}
              {openPanel === "photos" && (
                <div className="rc-panel">
                  <div className="rc-frames">
                    {profile.portfolioImages.slice(0, 6).map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        className="rc-frame"
                        aria-label={`작업 사진 ${index + 1} 크게 보기`}
                        onClick={() => openImage(imageUrl, null)}
                      >
                        <Image
                          src={imageUrl}
                          alt={`${profile.name} 작업 사진 ${index + 1}`}
                          fill
                          sizes="(max-width: 480px) 50vw, 240px"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {introVideoEmbedUrl && (
            <>
              {linkButton({ key: "video", icon: Icon.play, label: "소개 영상", expandable: true })}
              {openPanel === "video" && (
                <div className="rc-panel">
                  <div className="rc-video" style={{ marginTop: 0 }}>
                    <iframe
                      src={introVideoEmbedUrl}
                      title={`${profile.name} 소개 영상`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {hasAbout && (
            <>
              {linkButton({ key: "about", icon: Icon.person, label: "소개 & 경력", expandable: true })}
              {openPanel === "about" && (
                <div className="rc-panel">
                  {journeyTags.length > 0 && (
                    <div className="rc-tags" style={{ marginBottom: 4 }}>
                      {journeyTags.slice(0, 8).map((tag) => (
                        <span className="rc-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {profile.careerTimeline.length > 0 && (
                    <div className="rc-card">
                      {profile.careerTimeline.map((entry, index) => (
                        <div className="rc-cstop" key={`${entry.period}-${index}`}>
                          <span className="rc-cyr">{entry.period}</span>
                          <div>
                            <h3>{entry.title}</h3>
                            {entry.detail && <p>{entry.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {(bookingUrl || phoneHref) &&
            linkButton({ key: "write", icon: Icon.pen, label: "후기 남기기", href: reviewRequestHref })}
        </div>

        {/* viral loop */}
        {showMakeBlock && (
          <div className="rc-make rc-rise">
            <h3>
              나도 이런 후기 페이지,
              <br />
              10분이면 만들어요
            </h3>
            <p>흩어진 후기를 한 링크로 · 무료로 시작</p>
            <a href={`/?ref=profile&via=${profile.username}`}>
              내 Re<i>:</i>cord 만들기 →
            </a>
          </div>
        )}

        <footer className="rc-colophon">
          <Link href="/">Re:cord로 만든 신뢰 페이지</Link>
        </footer>
      </div>

      <div className={`rc-toast ${copied ? "is-on" : ""}`} role="status" aria-live="polite">
        링크가 복사됐어요 ✓
      </div>

      {/* image lightbox */}
      <Dialog
        open={Boolean(activeImage)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveImage(null)
            setActiveReview(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {activeReview ? `${activeReview.platform} · ${activeReview.business}` : "작업 사진"}
            </DialogTitle>
          </DialogHeader>
          {activeImage && (
            <TransformWrapper minScale={0.5} maxScale={4} centerOnInit>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => zoomIn()} aria-label="확대">
                      <ZoomInIcon />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => zoomOut()} aria-label="축소">
                      <ZoomOutIcon />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => resetTransform()} aria-label="원래 크기">
                      <ResetIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="이미지 다운로드"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = activeImage
                        link.download = "record-review.png"
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                    >
                      <DownloadIcon />
                    </Button>
                  </div>
                  <TransformComponent
                    wrapperClass="!w-full !h-[60vh] bg-neutral-950 rounded-md"
                    contentClass="!w-full !h-full flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeImage} alt="리뷰 첨부 이미지" className="max-h-full max-w-full object-contain" />
                  </TransformComponent>
                </div>
              )}
            </TransformWrapper>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
