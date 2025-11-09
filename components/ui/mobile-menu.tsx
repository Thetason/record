"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./button"
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons"

interface MobileMenuProps {
  session: any
  status: string
}

export function MobileMenu({ session, status }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* 햄버거 버튼 - 모바일에서만 표시 */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="메뉴 열기"
      >
        {isOpen ? (
          <Cross1Icon className="w-6 h-6" />
        ) : (
          <HamburgerMenuIcon className="w-6 h-6" />
        )}
      </button>

      {/* 모바일 메뉴 오버레이 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMenu}
          />

          {/* 메뉴 패널 */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 md:hidden shadow-2xl">
            <div className="flex flex-col h-full">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-1" onClick={closeMenu}>
                  <span className="text-xl font-bold">Re:cord</span>
                  <span className="text-[#FF6B35]">*</span>
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Cross1Icon className="w-5 h-5" />
                </button>
              </div>

              {/* 메뉴 항목 */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  <Link
                    href="/guide"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    사용 가이드
                  </Link>
                  <Link
                    href="/pricing"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    요금 안내
                  </Link>
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => {
                      const section = document.getElementById('live-demo')
                      section?.scrollIntoView({ behavior: 'smooth' })
                      closeMenu()
                    }}
                  >
                    라이브데모
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => {
                      const section = document.getElementById('how-it-works')
                      section?.scrollIntoView({ behavior: 'smooth' })
                      closeMenu()
                    }}
                  >
                    사용방법
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => {
                      const section = document.getElementById('before-after')
                      section?.scrollIntoView({ behavior: 'smooth' })
                      closeMenu()
                    }}
                  >
                    효과비교
                  </button>
                </div>
              </nav>

              {/* 하단 CTA */}
              <div className="p-4 border-t space-y-3">
                {status === "loading" ? (
                  <Button variant="ghost" className="w-full" disabled>
                    로딩중...
                  </Button>
                ) : session ? (
                  <Link href="/dashboard" onClick={closeMenu} className="block">
                    <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                      대시보드로 이동
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="block">
                      <Button variant="outline" className="w-full">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={closeMenu} className="block">
                      <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A2B]">
                        무료 시작하기
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
