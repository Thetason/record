"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  PersonIcon,
  BarChartIcon,
  Share1Icon
} from "@radix-ui/react-icons"

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "홈",
      icon: HomeIcon,
      exact: true
    },
    {
      href: "/dashboard/profile",
      label: "프로필",
      icon: PersonIcon
    },
    {
      href: "/dashboard/reviews",
      label: "리뷰",
      icon: BarChartIcon
    },
    {
      href: "/dashboard/share",
      label: "공유",
      icon: Share1Icon
    },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-[#FF6B35]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'text-[#FF6B35]' : ''}`} />
              <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
