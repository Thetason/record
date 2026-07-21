'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import type { PublicProfile } from '@/lib/profile'
import { Reveal, SPRING } from './motion'
import { SHOWCASE_CAREER_CONTENT, type ShowcaseAudienceKey } from './content'

type CareerSectionProps = {
  profile: PublicProfile
  activeAudience: ShowcaseAudienceKey
}

export function CareerSection({ profile, activeAudience }: CareerSectionProps) {
  const reduce = useReducedMotion()
  const timelineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.8', 'end 0.45'],
  })
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const content = SHOWCASE_CAREER_CONTENT[activeAudience]

  return (
    <section id="career-tree" className="bg-white px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <Reveal>
            <span className="text-sm font-bold tracking-[0.14em] text-[#FF6B35]">CAREER TREE</span>
            <h2 className="mt-3 break-keep text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold tracking-[-0.05em] text-[#191f28]">
              샵이 바뀌어도, 기록은 이어집니다
            </h2>
            <p className="mx-auto mt-5 max-w-2xl break-keep text-[0.98rem] leading-8 text-gray-600 md:text-lg">
              플랫폼에 두고 온 후기는 그 가게의 것. Re:cord에 모은 후기와 커리어는
              어디로 가든 <span className="font-bold text-[#191f28]">당신의 것</span>입니다.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Reveal className="rounded-[1.8rem] border border-gray-100 bg-[#f8f9fa] p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Career timeline</p>
            <h3 className="mt-2 break-keep text-xl font-extrabold tracking-[-0.03em] text-[#191f28] md:text-2xl">
              {content.headline}
            </h3>

            <div ref={timelineRef} className="relative mt-7">
              {/* Self-drawing spine: scaleY follows scroll progress */}
              <div className="absolute left-[1.35rem] top-3 h-[calc(100%-1.5rem)] w-px bg-gray-200" />
              <motion.div
                className="absolute left-[1.35rem] top-3 h-[calc(100%-1.5rem)] w-px origin-top bg-[#FF6B35]"
                style={{ scaleY: reduce ? 1 : lineScale }}
              />

              <div className="space-y-5">
                {content.entries.map((entry, index) => (
                  <motion.div
                    key={entry.year}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4"
                    initial={reduce ? false : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-15% 0px' }}
                    transition={{ ...SPRING, delay: index * 0.06 }}
                  >
                    <motion.div
                      className="z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#191f28] text-[11px] font-extrabold text-white"
                      initial={reduce ? false : { scale: 0.6 }}
                      whileInView={{ scale: 1, backgroundColor: '#FF6B35' }}
                      viewport={{ once: true, margin: '-30% 0px' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.1 }}
                    >
                      {entry.year}
                    </motion.div>
                    <div className="rounded-[1.15rem] bg-white px-4 py-3.5 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
                      <p className="text-[15px] font-bold text-[#191f28]">{entry.title}</p>
                      <p className="mt-1.5 break-keep text-[13px] leading-6 text-gray-500">{entry.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-[1.8rem] border border-gray-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Portfolio</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#191f28] md:text-2xl">작업이 곧 증거</h3>
              </div>
              <span className="rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-bold text-[#FF6B35]">
                {profile.profession.split('·')[0]?.trim()}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {profile.portfolioImages.slice(0, 3).map((src, index) => (
                <div
                  key={`${activeAudience}-${index}`}
                  className={`group relative overflow-hidden rounded-[1.2rem] bg-[#f8f9fa] ${index === 0 ? 'col-span-2 h-44' : 'h-32'}`}
                >
                  <Image
                    src={src}
                    alt={`${profile.name} 포트폴리오 ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 26rem"
                    unoptimized
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.15rem] bg-[#f8f9fa] px-4 py-4">
              <p className="text-sm font-bold text-[#191f28]">고객이 먼저 보는 핵심 정보</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[profile.experience, profile.location].filter(Boolean).map((chip) => (
                  <span key={chip} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-500">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
