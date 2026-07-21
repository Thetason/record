'use client'

import Image from 'next/image'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Link2, MessageCircle, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { PublicProfile } from '@/lib/profile'
import { Reveal, SPRING } from './motion'

// Chat rehearsal: the moment the link actually gets used, replayed on loop.
const STEP = { hidden: 0, sent: 1, unfurled: 2, replied: 3 } as const
type Step = (typeof STEP)[keyof typeof STEP]

const USAGE_CARDS = [
  {
    icon: MessageCircle,
    tint: 'bg-[#FFF0E8] text-[#FF6B35]',
    title: '카톡으로 바로',
    body: '상담 전에 링크 한 번만 보내면, 리뷰와 포트폴리오가 한 화면으로 전달됩니다.',
  },
  {
    icon: Link2,
    tint: 'bg-[#F3F0FF] text-[#7c6bd6]',
    title: '프로필 소개 링크에',
    body: '인스타 프로필, 스레드 소개, DM 자동응답에 같은 링크를 계속 쓸 수 있습니다.',
  },
  {
    icon: Send,
    tint: 'bg-[#EEF4FF] text-[#3182f6]',
    title: '보낸 뒤 바로 문의로',
    body: '고객은 링크를 보고 더 빨리 믿고, 그대로 상담 버튼을 누릅니다.',
  },
] as const

export function ShareSection({ profile }: { profile: PublicProfile }) {
  const reduce = useReducedMotion()
  const chatRef = useRef<HTMLDivElement>(null)
  const inView = useInView(chatRef, { amount: 0.5 })
  const [step, setStep] = useState<Step>(STEP.hidden)

  useEffect(() => {
    if (reduce) {
      setStep(STEP.replied)
      return
    }
    if (!inView) return
    const timers: number[] = []
    const play = () => {
      setStep(STEP.hidden)
      timers.push(window.setTimeout(() => setStep(STEP.sent), 400))
      timers.push(window.setTimeout(() => setStep(STEP.unfurled), 1100))
      timers.push(window.setTimeout(() => setStep(STEP.replied), 2400))
      timers.push(window.setTimeout(play, 6500))
    }
    play()
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [inView, reduce])

  return (
    <section id="share-flow" className="bg-[#f2f4f6] px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center">
          <Reveal>
            <span className="text-sm font-bold tracking-[0.14em] text-[#FF6B35]">SHARE FLOW</span>
            <h2 className="mt-3 break-keep text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold tracking-[-0.05em] text-[#191f28]">
              보내는 순간, 설득이 시작됩니다
            </h2>
            <p className="mx-auto mt-5 max-w-2xl break-keep text-[0.98rem] leading-8 text-gray-600 md:text-lg">
              상담 전에 링크 한 번. 고객은 리뷰와 포트폴리오를 한 화면으로 보고, 그대로 문의 버튼을 누릅니다.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div ref={chatRef} className="mx-auto w-full max-w-sm rounded-[1.8rem] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
              <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#FFEEE8]">
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt="" fill className="object-cover" sizes="36px" unoptimized />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-[#FF6B35]">
                      {profile.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#191f28]">예비 고객님</p>
                  <p className="text-[10px] text-gray-400">상담 문의 중</p>
                </div>
              </div>

              <div className="flex min-h-[15rem] flex-col justify-end gap-2.5">
                {step >= STEP.sent && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 12, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="ml-auto max-w-[85%]"
                  >
                    <div className="rounded-2xl rounded-br-md bg-[#191f28] px-3.5 py-2.5 text-[13px] leading-5 text-white">
                      안녕하세요! 상담 전에 이것 먼저 봐 주세요 🙂
                    </div>
                  </motion.div>
                )}

                {step >= STEP.unfurled && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scaleY: 0.6 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={SPRING}
                    style={{ transformOrigin: 'top' }}
                    className="ml-auto w-[85%]"
                  >
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-[#f8f9fa]">
                      <div className="flex items-center gap-2.5 p-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white">
                          {profile.avatar && <Image src={profile.avatar} alt="" fill className="object-cover" sizes="40px" unoptimized />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-[#191f28]">
                            {profile.name} — {profile.profession.split('·')[0]?.trim()}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            리뷰 {profile.totalReviews}개 · recordyours.com/{profile.username}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 bg-white px-3 py-2">
                        <span className="text-[10px] font-bold text-[#FF6B35]">recordyours.com</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step >= STEP.replied && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 12, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="mr-auto max-w-[85%]"
                  >
                    <div className="rounded-2xl rounded-bl-md bg-[#f2f4f6] px-3.5 py-2.5 text-[13px] leading-5 text-[#191f28]">
                      와, 후기 진짜 많으시네요! 바로 예약할게요 🙌
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </Reveal>

          <motion.div
            className="space-y-3.5"
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-12% 0px' }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            {USAGE_CARDS.map((card) => (
              <motion.div
                key={card.title}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: SPRING } }}
                whileHover={reduce ? undefined : { y: -3 }}
                className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-full p-2.5 ${card.tint}`}>
                    <card.icon className="h-5 w-5" />
                  </span>
                  <p className="text-lg font-extrabold tracking-[-0.02em] text-[#191f28]">{card.title}</p>
                </div>
                <p className="mt-3 break-keep text-sm leading-7 text-gray-500">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
