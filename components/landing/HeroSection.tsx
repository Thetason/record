'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import type { PublicProfile } from '@/lib/profile'
import type { LaunchOfferSnapshot } from '@/lib/launch-offer-config'
import { Button } from '@/components/ui/button'
import { CountUp, Magnetic, SPRING, SPRING_SOFT } from './motion'
import { HERO_PLATFORMS } from './content'
import { getPlatformBadgeStyle } from './shared'
import { PhoneMockup } from './PhoneMockup'

// Scattered platform chips converge into the phone's link capsule — the
// product story ("흩어진 리뷰 → 링크 하나") acted out in the first 3 seconds.
const CHIP_START = [
  { x: -130, y: -40, r: -10 },
  { x: 120, y: -110, r: 8 },
  { x: -150, y: 150, r: -6 },
  { x: 150, y: 90, r: 12 },
  { x: -60, y: -160, r: 5 },
]

function ConvergingChips() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {HERO_PLATFORMS.map((platform, i) => (
        <motion.span
          key={platform}
          className={`absolute left-1/2 top-1/2 rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${getPlatformBadgeStyle(platform)}`}
          initial={{ x: CHIP_START[i].x, y: CHIP_START[i].y, rotate: CHIP_START[i].r, opacity: 0, scale: 0.8 }}
          animate={{
            x: [CHIP_START[i].x, CHIP_START[i].x, 0],
            y: [CHIP_START[i].y, CHIP_START[i].y, -148],
            rotate: [CHIP_START[i].r, CHIP_START[i].r, 0],
            opacity: [0, 1, 0],
            scale: [0.8, 1, 0.45],
          }}
          transition={{
            duration: 1.5,
            times: [0, 0.45, 1],
            delay: 0.7 + i * 0.14,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {platform}
        </motion.span>
      ))}
    </div>
  )
}

type HeroSectionProps = {
  profile: PublicProfile
  launchOffer: LaunchOfferSnapshot
  isLoggedIn: boolean
  onJumpTo: (id: string) => void
  onPickAudience: (key: 'vocal' | 'hair' | 'pilates') => void
}

const AUDIENCE_PILLS = [
  { key: 'hair', label: '헤어디자이너' },
  { key: 'vocal', label: '보컬트레이너' },
  { key: 'pilates', label: '필라테스 강사' },
] as const

export function HeroSection({ profile, launchOffer, isLoggedIn, onJumpTo, onPickAudience }: HeroSectionProps) {
  const reduce = useReducedMotion()
  const verifiedCount = profile.reviews.filter((r) => r.verified).length
  const workspaceHref = isLoggedIn ? '/dashboard/profile' : '/signup'

  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { ...SPRING, delay },
  })

  return (
    <section className="overflow-hidden bg-[#f2f4f6] px-4 pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,420px)]">
          <div className="text-center lg:text-left">
            {launchOffer.active ? (
              <motion.div {...rise(0)} className="mb-7 inline-block">
                {/* Offer "ticket": punch-holes + shimmer + slot numbers */}
                <div className="relative overflow-hidden rounded-2xl border border-[#FFD9CF] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(255,107,53,0.12)]">
                  <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#f2f4f6]" />
                  <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#f2f4f6]" />
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#FF6B35]/10 to-transparent"
                      animate={{ x: ['-120%', '420%'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                    />
                  )}
                  <p className="relative text-sm font-bold text-[#FF6B35]">
                    오픈 기념 · 첫 {launchOffer.maxUsers}명 프로 {launchOffer.trialMonths}개월 무료
                  </p>
                  <p className="relative mt-0.5 text-xs font-semibold text-gray-500">
                    남은 <span className="tabular-nums text-[#191f28]"><CountUp to={launchOffer.remaining} duration={1} /></span>자리
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div {...rise(0)} className="mb-7 flex flex-wrap justify-center gap-2 lg:justify-start">
                {AUDIENCE_PILLS.map((pill) => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => onPickAudience(pill.key)}
                    className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-bold text-[#FF6B35] shadow-sm transition hover:border-[#FF6B35]"
                  >
                    {pill.label}
                  </button>
                ))}
              </motion.div>
            )}

            <h1 className="break-keep text-[clamp(2.5rem,6.4vw,4.6rem)] font-extrabold leading-[1.08] tracking-[-0.055em] text-[#191f28]">
              <motion.span className="block" {...rise(0.05)}>
                흩어진 리뷰를
              </motion.span>
              <motion.span className="block" {...rise(0.13)}>
                <span className="text-[#FF6B35]">한 줄의 링크</span>로.
              </motion.span>
            </h1>

            <motion.p
              {...rise(0.24)}
              className="mx-auto mt-6 max-w-xl break-keep text-[1.02rem] leading-8 text-gray-600 md:text-lg lg:mx-0"
            >
              네이버·카카오·당근·숨고에 쌓인 진짜 후기, AI가 스크린샷에서 읽어 옮겨 드립니다.
              샵을 옮겨도, 독립해도 — 리뷰는 당신의 자산이니까요.
            </motion.p>

            <motion.div {...rise(0.34)} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Magnetic>
                <Link href={workspaceHref}>
                  <Button size="lg" className="rounded-full bg-[#FF6B35] px-9 py-6 text-base font-bold shadow-[0_14px_36px_rgba(255,107,53,0.32)] hover:bg-[#E55A2B] md:text-lg">
                    {isLoggedIn ? '내 링크 다듬기' : '내 링크 만들기'}
                    <ArrowRightIcon className="ml-1.5" />
                  </Button>
                </Link>
              </Magnetic>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-7 py-6 text-base font-semibold text-gray-600 hover:bg-white md:text-lg"
                onClick={() => onJumpTo('live-demo')}
              >
                실제 화면 30초 구경
              </Button>
            </motion.div>

            <motion.p {...rise(0.44)} className="mt-8 text-sm font-medium text-gray-400">
              지금 <span className="font-semibold text-gray-600">recordyours.com/{profile.username}</span>에 모인 리뷰{' '}
              <span className="font-bold tabular-nums text-[#191f28]">
                <CountUp to={profile.totalReviews} />개
              </span>{' '}
              · 검증{' '}
              <span className="font-bold tabular-nums text-[#191f28]">
                <CountUp to={verifiedCount} />건
              </span>
            </motion.p>
          </div>

          <motion.div
            className="relative hidden lg:block"
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING_SOFT, delay: 0.3 }}
          >
            <ConvergingChips />
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
            >
              <PhoneMockup profile={profile} />
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-10 lg:hidden">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={SPRING_SOFT}
          >
            <PhoneMockup profile={profile} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
