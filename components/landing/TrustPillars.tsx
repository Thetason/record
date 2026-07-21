'use client'

import { motion, useReducedMotion } from 'framer-motion'

// Apple-style text ignite: each line sits dim, then lights up to ink as it
// enters the viewport. One screen, one message, three beats.
const PILLARS = [
  { head: '바로 보이는 신뢰', tail: '리뷰와 작업 사진을 한 화면에서', dot: '#3182f6' },
  { head: '바로 이어지는 문의', tail: '보고 그대로 카톡·전화·예약으로', dot: '#22c55e' },
  { head: '내 리뷰는 나의 자산', tail: '이직해도, 독립해도 그대로', dot: '#FF6B35' },
] as const

export function TrustPillars() {
  const reduce = useReducedMotion()

  return (
    <section className="bg-white px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-10 md:space-y-14">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.head}
              initial={reduce ? false : { opacity: 0.25, color: '#8b95a1', y: 14 }}
              whileInView={{ opacity: 1, color: '#191f28', y: 0 }}
              viewport={{ once: true, margin: '-22% 0px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
              className="flex flex-col gap-2 border-b border-gray-100 pb-8 md:flex-row md:items-baseline md:justify-between md:gap-6 md:pb-10"
            >
              <h3 className="flex items-center gap-3 break-keep text-[clamp(1.6rem,4vw,2.7rem)] font-extrabold tracking-[-0.045em]">
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pillar.dot }} />
                {pillar.head}
              </h3>
              <p className="break-keep text-[15px] font-medium text-gray-400 md:text-base">{pillar.tail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
