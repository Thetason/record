'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut, loading } = useAuth()

  const navigation = user ? [
    { name: '홈', href: '/' },
    { name: '대시보드', href: '/dashboard' },
    { name: '리뷰 관리', href: '/dashboard/reviews' },
  ] : [
    { name: '홈', href: '/' },
    { name: '기능', href: '/#features' },
    { name: '데모', href: '/designer_kim' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-primary" />
              <span className="text-xl font-bold gradient-mixed text-gradient">
                Re:cord
              </span>
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-100">
      <nav className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-lg font-black text-white font-display">R</span>
              </div>
              <span className="text-2xl font-black text-neutral-900 font-display">
                Re:cord
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-base font-semibold transition-all duration-200',
                  isActive(item.href)
                    ? 'text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {user && profile ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {profile.name[0]}
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {profile.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-neutral-900 font-semibold hover:bg-neutral-100"
                  asChild
                >
                  <Link href="/login">로그인</Link>
                </Button>
                <Button 
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-6 py-2 rounded-full"
                  asChild
                >
                  <Link href="/register">무료로 시작</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">메뉴 열기</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-base font-medium',
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 pb-3">
                {user && profile ? (
                  <div className="px-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {profile.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                        <p className="text-xs text-gray-500">{profile.profession}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <Link href={`/${profile.username}`}>
                        <User className="h-4 w-4" />
                        내 프로필 보기
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">로그인</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/register">시작하기</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}