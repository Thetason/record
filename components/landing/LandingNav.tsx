'use client'

import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { useState } from 'react'
import type { Session } from 'next-auth'
import { Button } from '@/components/ui/button'
import { MobileMenu } from '@/components/ui/mobile-menu'
import { SPRING } from './motion'

type LandingNavProps = {
  session: Session | null
  status: 'authenticated' | 'loading' | 'unauthenticated'
  onJumpTo: (id: string) => void
}

export function LandingNav({ session, status, onJumpTo }: LandingNavProps) {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 160)
    setScrolled(latest > 8)
  })

  return (
    <motion.nav
      className="fixed top-0 z-50 w-full"
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={SPRING}
    >
      <div
        className={`border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled
            ? 'border-gray-200/70 bg-white/80 shadow-[0_1px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-3 md:py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-extrabold tracking-[-0.04em] md:text-[1.35rem]">Re:cord</span>
              <span className="text-[#FF6B35]">*</span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              <Link href="/guide" className="text-[0.92rem] font-medium text-gray-600 transition-colors hover:text-gray-900">
                사용 가이드
              </Link>
              <Link href="/pricing" className="text-[0.92rem] font-medium text-gray-600 transition-colors hover:text-gray-900">
                요금 안내
              </Link>
              <button
                type="button"
                className="text-[0.92rem] font-medium text-gray-600 transition-colors hover:text-gray-900"
                onClick={() => onJumpTo('live-demo')}
              >
                실제 사용 화면
              </button>
              <button
                type="button"
                className="text-[0.92rem] font-medium text-gray-600 transition-colors hover:text-gray-900"
                onClick={() => onJumpTo('setup')}
              >
                시작 방법
              </button>
            </div>

            <div className="hidden gap-2.5 md:flex">
              {status === 'loading' ? (
                <Button variant="ghost" size="sm" disabled>
                  로딩중...
                </Button>
              ) : session ? (
                <Link href="/dashboard/profile">
                  <Button size="sm" className="rounded-full bg-[#191f28] px-5 hover:bg-[#333d4b]">
                    내 링크 다듬기
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="rounded-full bg-[#FF6B35] px-5 hover:bg-[#E55A2B]">
                      무료 시작하기
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <MobileMenu session={session} status={status} />
          </div>
        </div>
        {/* Page progress: fills orange as the visitor completes the story */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#FF6B35]"
          style={{ scaleX: progress }}
        />
      </div>
    </motion.nav>
  )
}
