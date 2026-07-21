'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { PublicProfile } from '@/lib/profile'
import { Button } from '@/components/ui/button'
import { CountUp, Reveal, SPRING } from './motion'
import { SHOWCASE_AUDIENCES, type ShowcaseAudienceKey, LIVE_VOCAL_PROFILE_URL } from './content'
import { countPlatforms, getPlatformBadgeStyle, sortReviewsForShowcase, type LandingReview } from './shared'

type LiveDemoSectionProps = {
  profiles: Record<ShowcaseAudienceKey, PublicProfile>
  activeAudience: ShowcaseAudienceKey
  onAudienceChange: (key: ShowcaseAudienceKey) => void
  onExpandImage: (url: string) => void
}

function ReviewCard({ review, onExpandImage }: { review: LandingReview; onExpandImage: (url: string) => void }) {
  return (
    <div className="flex h-full flex-col rounded-[1.15rem] border border-gray-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getPlatformBadgeStyle(review.platform)}`}>
            {review.platform}
          </span>
          <p className="mt-2 text-[13px] font-semibold text-gray-900">{review.business}</p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-[#FF6B35]">
          {Array.from({ length: Math.min(review.rating ?? 5, 5) }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
        </span>
      </div>

      {review.imageUrl && (
        <button
          type="button"
          onClick={() => onExpandImage(review.imageUrl!)}
          className="relative mt-3 block h-24 w-full overflow-hidden rounded-[0.9rem] border border-gray-100 bg-[#fafafa]"
        >
          <Image src={review.imageUrl} alt={`${review.author} 캡처`} fill className="object-contain p-2" sizes="18rem" unoptimized />
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-gray-500 shadow-sm">
            원문
          </span>
        </button>
      )}

      <p className="mt-3 line-clamp-3 break-keep text-[12.5px] leading-6 text-gray-600">“{review.content}”</p>
      <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-gray-400">
        <span>{review.author}</span>
        <span>{new Date(review.reviewDate).toLocaleDateString('ko-KR')}</span>
      </div>
    </div>
  )
}

export function LiveDemoSection({ profiles, activeAudience, onAudienceChange, onExpandImage }: LiveDemoSectionProps) {
  const reduce = useReducedMotion()
  const profile = profiles[activeAudience]
  const meta = SHOWCASE_AUDIENCES.find((a) => a.key === activeAudience) ?? SHOWCASE_AUDIENCES[0]
  const reviews = useMemo(() => sortReviewsForShowcase(profile.reviews), [profile])
  const platforms = useMemo(() => countPlatforms(profile.reviews), [profile])
  const verifiedCount = profile.reviews.filter((r) => r.verified).length
  const [showAll, setShowAll] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)

  const visibleDesktop = reviews.slice(0, 6)
  const visibleMobile = showAll ? reviews : reviews.slice(0, 4)
  const profileHref = activeAudience === 'vocal' ? LIVE_VOCAL_PROFILE_URL : null

  return (
    <section id="live-demo" className="bg-[#f2f4f6] px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <Reveal>
            <span className="text-sm font-bold tracking-[0.14em] text-[#FF6B35]">LIVE DEMO</span>
            <h2 className="mt-3 break-keep text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold tracking-[-0.05em] text-[#191f28]">
              고객이 실제로 보게 될 화면
            </h2>
            <p className="mx-auto mt-5 max-w-2xl break-keep text-[0.98rem] leading-8 text-gray-600 md:text-lg">
              데모가 아니라 실제 공개 프로필입니다. 이름, 대표 리뷰, 원문 캡처, 문의 버튼까지 —
              링크 하나가 이렇게 일합니다.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="mt-9 flex justify-center">
            <div className="flex gap-1 rounded-full bg-white p-1.5 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
              {SHOWCASE_AUDIENCES.map((audience) => {
                const isActive = audience.key === activeAudience
                return (
                  <button
                    key={audience.key}
                    type="button"
                    onClick={() => onAudienceChange(audience.key)}
                    className={`relative rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors sm:px-6 sm:text-sm ${
                      isActive ? 'text-white' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="audience-pill"
                        className="absolute inset-0 rounded-full bg-[#FF6B35] shadow-[0_8px_22px_rgba(255,107,53,0.32)]"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 32 }}
                      />
                    )}
                    <span className="relative">{audience.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        <div className="mx-auto mt-8 max-w-5xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeAudience}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-3 gap-2.5 md:gap-4">
                <div className="rounded-[1.3rem] bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.04)] md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 md:text-xs">총 리뷰</p>
                  <p className="mt-1.5 text-2xl font-extrabold tabular-nums tracking-[-0.03em] text-[#191f28] md:text-4xl">
                    <CountUp to={profile.totalReviews} />
                  </p>
                </div>
                <div className="rounded-[1.3rem] bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.04)] md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 md:text-xs">검증 완료</p>
                  <p className="mt-1.5 text-2xl font-extrabold tabular-nums tracking-[-0.03em] text-[#191f28] md:text-4xl">
                    <CountUp to={verifiedCount} />
                  </p>
                </div>
                <div className="rounded-[1.3rem] bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.04)] md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 md:text-xs">플랫폼</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {platforms.slice(0, 3).map(({ name, count }) => (
                      <span key={name} className={`rounded-full px-2 py-1 text-[10px] font-bold md:text-xs ${getPlatformBadgeStyle(name)}`}>
                        {name} {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-[1.6rem] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
                <div className="relative h-[180px] md:h-[240px]">
                  <Image
                    src={profile.coverImage || '/sample.png'}
                    alt={`${profile.name} 커버`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 64rem"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                    <div className="flex items-end gap-3.5">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-xl md:h-20 md:w-20">
                        {profile.avatar ? (
                          <Image src={profile.avatar} alt={profile.name} fill className="object-cover" sizes="80px" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#FFEEE8] text-2xl font-bold text-[#FF6B35]">
                            {profile.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="pb-0.5 text-white">
                        <p className="text-2xl font-extrabold tracking-[-0.04em] md:text-4xl">{profile.name}</p>
                        <p className="mt-1 text-xs font-medium text-white/80 md:text-sm">{profile.profession}</p>
                      </div>
                    </div>
                    <span className="hidden rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md sm:inline-flex">
                      {meta.eyebrow}
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-7">
                  {/* Mobile: swipeable deck. Desktop: grid. */}
                  <div ref={deckRef} className="overflow-hidden md:hidden" style={{ touchAction: 'pan-y' }}>
                    <motion.div
                      className="flex gap-3"
                      drag="x"
                      dragConstraints={{ left: -(visibleMobile.length - 1) * 264, right: 0 }}
                      dragElastic={0.12}
                    >
                      {visibleMobile.map((review) => (
                        <div key={review.id} className="w-[248px] shrink-0">
                          <ReviewCard review={review} onExpandImage={onExpandImage} />
                        </div>
                      ))}
                    </motion.div>
                    <p className="mt-3 text-center text-[11px] font-medium text-gray-400">← 옆으로 넘겨보세요</p>
                    {!showAll && reviews.length > 4 && (
                      <div className="mt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowAll(true)}
                          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600"
                        >
                          리뷰 {reviews.length - 4}개 더 보기
                        </button>
                      </div>
                    )}
                  </div>

                  <motion.div
                    className="hidden gap-3.5 md:grid md:grid-cols-2 xl:grid-cols-3"
                    initial={reduce ? false : 'hidden'}
                    whileInView="show"
                    viewport={{ once: true, margin: '-10% 0px' }}
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                  >
                    {visibleDesktop.map((review) => (
                      <motion.div
                        key={review.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: SPRING } }}
                      >
                        <ReviewCard review={review} onExpandImage={onExpandImage} />
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-[1.2rem] bg-[#f8f9fa] px-5 py-4 md:flex-row">
                    <p className="break-keep text-center text-[13px] leading-6 text-gray-500 md:text-left">{meta.description}</p>
                    {profileHref ? (
                      <Link href={profileHref}>
                        <Button className="rounded-full bg-[#191f28] px-6 font-bold text-white hover:bg-[#333d4b]">
                          세타쓴님 실제 프로필 열기
                        </Button>
                      </Link>
                    ) : (
                      <span className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-400">
                        구조 미리보기
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
