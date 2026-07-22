'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { LaunchOfferSnapshot } from '@/lib/launch-offer-config'
import { Button } from '@/components/ui/button'
import { CountUp, Magnetic, Reveal, SPRING } from './motion'
import { HERO_PLATFORMS } from './content'

type SetupSectionProps = {
  launchOffer: LaunchOfferSnapshot
  isLoggedIn: boolean
}

export function SetupSection({ launchOffer, isLoggedIn }: SetupSectionProps) {
  const reduce = useReducedMotion()
  const workspaceHref = isLoggedIn ? '/dashboard/profile' : '/signup'

  const steps = [
    {
      no: '01',
      title: '캡처 올리면 끝',
      body: `위에서 본 그 AI가 최대 ${launchOffer.ocrImportLimit}개까지 읽어 드립니다. PC에서는 스크롤 캡처 도우미가 캡처까지 대신 찍어드려요.`,
      tint: 'from-[#fff4ef] to-white',
    },
    {
      no: '02',
      title: '리뷰 옮겨드림',
      body: '자료만 보내 주시면 저희가 먼저 정리해 드립니다. 바쁘신 분들의 시작 방식.',
      tint: 'from-[#f3f0ff] to-white',
    },
    {
      no: '03',
      title: '직접 리뷰 받기',
      body: '이제부턴 Re:cord 링크로 새 후기를 계속 쌓으세요. 리뷰가 리뷰를 부릅니다.',
      tint: 'from-[#eef4ff] to-white',
    },
  ]

  return (
    <section id="setup" className="bg-white px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center">
          <Reveal>
            <span className="text-sm font-bold tracking-[0.14em] text-[#FF6B35]">START</span>
            <h2 className="mt-3 break-keep text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold tracking-[-0.05em] text-[#191f28]">
              시작은 5분이면 충분합니다
            </h2>
          </Reveal>
        </div>

        <motion.div
          className="mt-12 grid gap-4 md:grid-cols-3"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.no}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: SPRING } }}
              className={`rounded-[1.8rem] border border-gray-100 bg-gradient-to-b p-7 shadow-[0_14px_40px_rgba(15,23,42,0.05)] ${step.tint}`}
            >
              <p className="text-sm font-extrabold text-[#FF6B35]">{step.no}</p>
              <h3 className="mt-3 text-xl font-extrabold tracking-[-0.02em] text-[#191f28]">{step.title}</h3>
              <p className="mt-3 break-keep text-sm leading-7 text-gray-500">{step.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA — the hero's scattered platforms reconverge and the page closes */}
        <Reveal delay={0.1}>
          <motion.div
            initial={reduce ? false : { scale: 0.98 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={SPRING}
            className="relative mt-14 overflow-hidden rounded-[2rem] bg-[#191f28] px-6 py-12 text-center md:px-12 md:py-16"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.14]">
              {HERO_PLATFORMS.map((platform, i) => (
                <span
                  key={platform}
                  className="absolute rounded-full border border-white/40 px-3 py-1 text-xs font-bold text-white"
                  style={{
                    left: `${8 + i * 19}%`,
                    top: i % 2 === 0 ? '12%' : '78%',
                    transform: `rotate(${(i - 2) * 7}deg)`,
                  }}
                >
                  {platform}
                </span>
              ))}
            </div>

            <h3 className="relative break-keep text-[clamp(1.6rem,3.8vw,2.6rem)] font-extrabold tracking-[-0.04em] text-white">
              흩어진 리뷰, 오늘 한 줄로 모으세요
            </h3>
            {launchOffer.active && (
              <p className="relative mt-4 text-[15px] font-semibold text-white/70">
                오픈 기념, 첫 {launchOffer.maxUsers}명 프로 {launchOffer.trialMonths}개월 무료 — 남은{' '}
                <span className="font-extrabold tabular-nums text-[#FF6B35]">
                  <CountUp to={launchOffer.remaining} duration={1} />
                </span>
                자리
              </p>
            )}
            <div className="relative mt-8 flex justify-center">
              <Magnetic>
                <Link href={workspaceHref}>
                  <Button size="lg" className="rounded-full bg-[#FF6B35] px-10 py-7 text-lg font-extrabold shadow-[0_18px_50px_rgba(255,107,53,0.4)] hover:bg-[#E55A2B]">
                    {isLoggedIn ? '내 링크 다듬기' : '무료로 내 링크 만들기'}
                  </Button>
                </Link>
              </Magnetic>
            </div>
            <p className="relative mt-5 text-xs font-medium text-white/40">
              가입 1분 · 카드 등록 없음 · recordyours.com/나만의이름
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
