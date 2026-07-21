'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { PublicProfile } from '@/lib/profile'
import { SPRING } from './motion'
import { getPlatformBadgeStyle, getReviewProofBadge, sortReviewsForShowcase } from './shared'

// Compact device frame showing the real profile — the hero's proof object.
export function PhoneMockup({ profile }: { profile: PublicProfile }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const reviews = useMemo(() => sortReviewsForShowcase(profile.reviews).slice(0, 5), [profile])
  const review = reviews[index % Math.max(reviews.length, 1)]

  useEffect(() => {
    if (reduce || reviews.length <= 1) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [reviews, reduce])

  return (
    <div className="relative mx-auto w-[15.4rem] sm:w-[16.6rem]">
      <div className="relative z-10 aspect-[719/1500] w-full rounded-[2.6rem] bg-[#191f28] p-[0.66rem] shadow-[0_32px_80px_rgba(25,31,40,0.28)]">
        <div className="absolute left-1/2 top-[0.7rem] z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2.05rem] bg-[#f7f8f9]">
          <div className="relative h-[15%] min-h-[4.2rem] shrink-0">
            <Image
              src={profile.coverImage || '/sample.png'}
              alt={`${profile.name} 커버`}
              fill
              className="object-cover"
              sizes="17rem"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/45" />
          </div>

          <div className="relative flex flex-1 flex-col px-3 pb-3 pt-8">
            <div className="absolute left-1/2 top-0 h-[3.6rem] w-[3.6rem] -translate-x-1/2 -translate-y-[46%] overflow-hidden rounded-full border-[3px] border-[#f7f8f9] bg-white shadow-lg">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.name} fill className="object-cover" sizes="64px" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#FFEEE8] text-xl font-bold text-[#FF6B35]">
                  {profile.name.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-[1.22rem] font-bold tracking-[-0.04em] text-[#191f28]">{profile.name}</p>
              <p className="mt-0.5 text-[10px] font-medium text-gray-500">
                {profile.profession.split('·')[0]?.trim() || profile.profession}
              </p>
              <div className="mx-auto mt-2 flex w-fit items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[9px] font-semibold text-gray-600">recordyours.com/{profile.username}</span>
              </div>
            </div>

            <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between gap-2">
              <div className="relative min-h-[7.2rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={review?.id ?? 'empty'}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -10, transition: { duration: 0.18 } }}
                    transition={SPRING}
                    className="rounded-[1.05rem] bg-white px-3 py-2.5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${getPlatformBadgeStyle(review?.platform ?? 'Re:cord')}`}>
                          {review?.platform ?? 'Re:cord'}
                        </span>
                        <span className="inline-flex rounded-full bg-[#f2f4f6] px-2 py-0.5 text-[9px] font-semibold text-gray-500">
                          {getReviewProofBadge(review)}
                        </span>
                      </div>
                      <span className="flex shrink-0 items-center gap-0.5 text-[#FF6B35]">
                        {Array.from({ length: Math.min(review?.rating ?? 5, 5) }).map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 fill-current" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-3 break-keep text-[10.5px] font-semibold leading-4 text-[#191f28]">
                      “{review?.content ?? ''}”
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-gray-400">
                      <span>{review?.author}</span>
                      <span>
                        {index + 1} / {reviews.length} · 총 {profile.totalReviews}개
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {profile.portfolioImages.slice(0, 2).map((src, i) => (
                  <div key={i} className="relative h-[3rem] overflow-hidden rounded-[0.85rem] bg-white">
                    <Image src={src} alt={`포트폴리오 ${i + 1}`} fill className="object-cover" sizes="110px" unoptimized />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <span className="flex items-center justify-center rounded-full bg-[#191f28] px-2 py-2 text-center text-[10px] font-semibold text-white">
                  리뷰 {profile.totalReviews}개 보기
                </span>
                <span className="flex items-center justify-center rounded-full bg-white px-2 py-2 text-center text-[10px] font-semibold text-[#191f28] shadow-sm">
                  상담 문의
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
