"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  HomeIcon, 
  PersonIcon, 
  PlusIcon, 
  BarChartIcon,
  GearIcon
} from "@radix-ui/react-icons"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "홈", icon: <HomeIcon className="w-5 h-5" /> },
  { href: "/dashboard/reviews", label: "리뷰", icon: <BarChartIcon className="w-5 h-5" /> },
  { href: "/dashboard/add-review", label: "추가", icon: <PlusIcon className="w-5 h-5" /> },
  { href: "/dashboard/profile", label: "프로필", icon: <PersonIcon className="w-5 h-5" /> },
  { href: "/dashboard/settings", label: "설정", icon: <GearIcon className="w-5 h-5" /> },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive 
                  ? 'text-[#FF6B35]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}