'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold">Re:cord</span>
            <span className="text-[#FF6B35]">*</span>
          </Link>
          
          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/guide"
              className="text-gray-600 hover:text-[#FF6B35] transition-colors"
            >
              사용 가이드
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-[#FF6B35] transition-colors"
            >
              요금 안내
            </Link>
            <Link
              href="/#live-demo"
              className="text-gray-600 hover:text-[#FF6B35] transition-colors"
            >
              라이브데모
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 hover:text-[#FF6B35] transition-colors"
            >
              사용방법
            </Link>
            <Link
              href="/#before-after"
              className="text-gray-600 hover:text-[#FF6B35] transition-colors"
            >
              효과비교
            </Link>
          </div>
          
          <div className="flex gap-3">
            {status === 'loading' ? (
              <div className="w-20 h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : session ? (
              <Button
                asChild
                className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
              >
                <Link href="/dashboard">대시보드</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-gray-700 hover:text-[#FF6B35]"
                >
                  <Link href="/login">로그인</Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                >
                  <Link href="/login">무료 시작하기</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
