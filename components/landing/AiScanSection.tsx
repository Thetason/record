'use client'

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Reveal, SPRING } from './motion'
import { SCAN_DEMO_REVIEWS } from './content'
import { getPlatformBadgeStyle } from './shared'

// Autoplaying cinema: screenshot → scanline → extracted card → proof badge.
// Four acts on a 7s loop, cycling through three demo reviews. Pauses offscreen.
const ACT = { idle: 0, scanning: 1, extracted: 2, verified: 3 } as const
type Act = (typeof ACT)[keyof typeof ACT]

export function AiScanSection({ ocrImportLimit }: { ocrImportLimit: number }) {
  const reduce = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { amount: 0.45 })
  const [act, setAct] = useState<Act>(ACT.idle)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [imported, setImported] = useState(0)
  const review = SCAN_DEMO_REVIEWS[reviewIndex]

  useEffect(() => {
    if (reduce) {
      setAct(ACT.verified)
      setImported(3)
      return
    }
    if (!inView) return

    const timers: number[] = []
    const play = () => {
      setAct(ACT.idle)
      timers.push(window.setTimeout(() => setAct(ACT.scanning), 600))
      timers.push(window.setTimeout(() => setAct(ACT.extracted), 2200))
      timers.push(
        window.setTimeout(() => {
          setAct(ACT.verified)
          setImported((n) => Math.min(n + 1, 99))
        }, 3400)
      )
      timers.push(
        window.setTimeout(() => {
          setReviewIndex((i) => (i + 1) % SCAN_DEMO_REVIEWS.length)
          play()
        }, 7000)
      )
    }
    play()
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [inView, reduce])

  const lineLit = (line: number) =>
    act >= ACT.extracted || (act === ACT.scanning && line < 3)

  return (
    <section className="bg-white px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center">
          <Reveal>
            <span className="text-sm font-bold tracking-[0.14em] text-[#FF6B35]">AI REVIEW IMPORT</span>
            <h2 className="mt-3 break-keep text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold tracking-[-0.05em] text-[#191f28]">
              스크린샷을 올리면,
              <br className="sm:hidden" /> AI가 리뷰를 읽습니다
            </h2>
            <p className="mx-auto mt-5 max-w-2xl break-keep text-[0.98rem] leading-8 text-gray-600 md:text-lg">
              플랫폼에 흩어진 후기를 캡처 한 장으로. 작성자·별점·날짜까지 그대로 옮기고,
              원문 캡처를 증거로 함께 보관합니다. 첫 세팅 기준 최대 {ocrImportLimit}개까지 한 번에.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            ref={stageRef}
            className="mx-auto mt-12 max-w-4xl rounded-[2rem] border border-gray-100 bg-[#f8f9fa] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.1)] md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {/* Act 1-2: the screenshot being scanned */}
              <div className="relative overflow-hidden rounded-[1.4rem] border border-gray-200 bg-white p-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={reviewIndex}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, x: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* badge lives inside the keyed block so platform and
                        content can never mismatch mid-transition */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getPlatformBadgeStyle(review.platform)}`}>
                        {review.platform} 리뷰 캡처
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">screenshot.png</span>
                    </div>
                    <div className="space-y-2.5">
                    <div className={`rounded-lg px-3 py-2 transition-colors duration-500 ${lineLit(0) ? 'bg-[#FF6B35]/10' : 'bg-gray-50'}`}>
                      <p className="text-xs font-bold text-gray-800">{review.author}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {review.rating ? '⭐'.repeat(review.rating) + ' · ' : ''}
                        {review.date}
                      </p>
                    </div>
                    <div className={`rounded-lg px-3 py-2 transition-colors duration-500 ${lineLit(1) ? 'bg-[#FF6B35]/10' : 'bg-gray-50'}`}>
                      <p className="break-keep text-[11px] leading-5 text-gray-600">{review.content}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 opacity-50">
                      <p className="text-[10px] text-gray-400">사장님 답글 — AI가 자동으로 제외</p>
                    </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {act === ACT.scanning && !reduce && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-transparent via-[#FF6B35]/25 to-transparent"
                    initial={{ y: '-3.5rem' }}
                    animate={{ y: '110%' }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                    style={{ willChange: 'transform' }}
                  />
                )}
              </div>

              {/* Act 3-4: the assembled Re:cord card */}
              <div className="flex flex-col justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {act >= ACT.extracted ? (
                    <motion.div
                      key={`card-${reviewIndex}`}
                      initial={reduce ? false : { opacity: 0, y: -16, scale: 1.03 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduce ? undefined : { opacity: 0, y: 8 }}
                      transition={SPRING}
                      className="relative rounded-[1.4rem] border border-gray-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getPlatformBadgeStyle(review.platform)}`}>
                            {review.platform}
                          </span>
                          {review.rating && (
                            <span className="flex items-center gap-0.5 text-[#FF6B35]">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </span>
                          )}
                        </div>
                        {act === ACT.verified && (
                          <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                            className="rounded-full bg-[#3182f6]/10 px-2.5 py-1 text-[11px] font-bold text-[#3182f6]"
                          >
                            ✓ 원문 캡처 보관
                          </motion.span>
                        )}
                      </div>
                      <p className="mt-3 break-keep text-[13px] font-semibold leading-6 text-[#191f28]">“{review.content}”</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>{review.author}</span>
                        <span>{review.date}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={false}
                      exit={{ opacity: 0 }}
                      className="flex h-40 items-center justify-center rounded-[1.4rem] border-2 border-dashed border-gray-200 text-sm font-medium text-gray-300"
                    >
                      {act === ACT.scanning ? 'AI가 읽는 중…' : 'Re:cord 카드 자리'}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex items-center justify-between rounded-full bg-white px-4 py-2.5 shadow-sm">
                  <span className="text-xs font-semibold text-gray-500">가져온 리뷰</span>
                  <span className="text-sm font-extrabold tabular-nums text-[#191f28]">{imported}개</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col justify-center gap-3 text-center sm:flex-row sm:gap-8">
            {['① 스크린샷 올리기', '② AI가 읽어내기', '③ 내 링크에 정리'].map((step) => (
              <span key={step} className="text-sm font-semibold text-gray-500">
                {step}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
