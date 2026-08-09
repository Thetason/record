'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Whitelist rather than blocklist: the footer belongs on marketing pages only.
// A public profile is what a pro sends to their own prospective customer, so it
// must not carry Re:cord's pricing nav; the dashboard has a fixed bottom nav on
// mobile that a footer would sit underneath.
const FOOTER_ROUTES = new Set(['/', '/pricing', '/guide', '/terms', '/privacy'])

export function SiteFooter() {
  const pathname = usePathname()
  if (!pathname || !FOOTER_ROUTES.has(pathname)) return null

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-10 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <div className="flex items-center justify-center gap-1 md:justify-start">
            <span className="text-lg font-extrabold tracking-[-0.04em] text-[#191f28]">Re:cord</span>
            <span className="text-[#FF6B35]">*</span>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            © {new Date().getFullYear()} Re:cord · 흩어진 리뷰를 한 줄의 링크로
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
          <Link href="/guide" className="hover:text-gray-900">사용 가이드</Link>
          <Link href="/pricing" className="hover:text-gray-900">요금 안내</Link>
          <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
          <Link href="/privacy" className="hover:text-gray-900">개인정보처리방침</Link>
          <a className="hover:text-gray-900" href="mailto:support@record.kr">문의</a>
        </nav>
      </div>
    </footer>
  )
}
