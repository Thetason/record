'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, PlatformBadge } from '@/components/ui/Badge'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth-context'
import { reviewApi } from '@/lib/api'
import type { Review } from '@/types/database'
import { 
  Plus, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Star, 
  BarChart3, 
  Users, 
  MessageCircle,
  Edit3,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      loadReviews()
    }
  }, [user, authLoading, router])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const reviewsResult = await reviewApi.getCurrent()
      if (reviewsResult.success && reviewsResult.data) {
        setReviews(reviewsResult.data)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleReviewVisibility = async (reviewId: string, isVisible: boolean) => {
    try {
      const result = await reviewApi.toggleVisibility(reviewId, !isVisible)
      if (result.success) {
        setReviews(prev => 
          prev.map(review => 
            review.id === reviewId 
              ? { ...review, is_visible: !isVisible }
              : review
          )
        )
      }
    } catch (error) {
      console.error('Error toggling review visibility:', error)
    }
  }

  const copyProfileUrl = async () => {
    if (!profile?.username) return
    
    const url = `${window.location.origin}/${profile.username}`
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Calculate statistics
  const visibleReviews = reviews.filter(review => review.is_visible)
  const averageRating = visibleReviews.length > 0 
    ? visibleReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / visibleReviews.length 
    : 0
  const platformCounts = visibleReviews.reduce((acc, review) => {
    acc[review.source] = (acc[review.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const quickActions = [
    {
      title: "새 리뷰 추가",
      description: "고객 리뷰를 추가하여 포트폴리오를 강화하세요",
      href: "/dashboard/add-review",
      icon: <Plus className="h-6 w-6" />,
      gradient: "from-green-500 to-emerald-500",
      urgent: reviews.length === 0
    },
    {
      title: "리뷰 관리",
      description: "기존 리뷰를 편집하고 정리하세요",
      href: "/dashboard/reviews",
      icon: <Edit3 className="h-6 w-6" />,
      gradient: "from-blue-500 to-cyan-500",
      urgent: false
    },
    {
      title: "프로필 설정",
      description: "프로필 정보를 업데이트하세요",
      href: "/dashboard/settings",
      icon: <Users className="h-6 w-6" />,
      gradient: "from-purple-500 to-pink-500",
      urgent: !profile?.bio || !profile?.profession
    },
    {
      title: "공개 프로필 보기",
      description: "고객이 보는 화면을 확인하세요",
      href: `/${profile?.username}`,
      icon: <ExternalLink className="h-6 w-6" />,
      gradient: "from-orange-500 to-red-500",
      urgent: false
    }
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Header />
        <main className="py-8">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg text-neutral-600 font-medium">대시보드를 로딩중입니다...</p>
              </div>
            </div>
          </Container>
        </main>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <Header />
        <main className="py-8">
          <Container>
            <Card variant="elevated" className="max-w-lg mx-auto text-center animate-fade-in-up">
              <CardHeader className="pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">프로필을 설정해주세요</CardTitle>
                <CardDescription className="text-lg">
                  먼저 프로필 정보를 입력하여 포트폴리오를 시작하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" asChild>
                  <Link href="/profile/setup">프로필 설정하기</Link>
                </Button>
              </CardContent>
            </Card>
          </Container>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse-soft delay-300" />
      </div>

      <Header />
      
      <main className="py-12 relative z-10">
        <Container>
          <div className="space-y-12">
            {/* Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-fade-in-up">
              <div>
                <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 mb-4 tracking-tight font-display">
                  안녕하세요, {profile.name}님!
                </h1>
                <p className="text-xl text-neutral-600 font-medium">
                  {profile.profession && `${profile.profession} • `}
                  리뷰 {visibleReviews.length}개로 성장중
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="secondary" 
                  onClick={copyProfileUrl} 
                  className="gap-3 px-6 py-3 text-lg font-semibold backdrop-blur-xl border-white/30"
                >
                  {copySuccess ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  {copySuccess ? '복사됨!' : 'URL 복사'}
                </Button>
                <Button 
                  size="lg" 
                  className="gap-3 px-6 py-3 text-lg font-semibold shadow-2xl hover:shadow-3xl" 
                  asChild
                >
                  <Link href={`/${profile.username}`} target="_blank">
                    <ExternalLink className="h-5 w-5" />
                    프로필 보기
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card variant="elevated" className="group hover:scale-105 animate-fade-in-up delay-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-neutral-900">총 리뷰</CardTitle>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-neutral-900 mb-2">{visibleReviews.length}</div>
                  <p className="text-sm text-neutral-600 font-medium">
                    {reviews.length - visibleReviews.length}개 숨김
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="group hover:scale-105 animate-fade-in-up delay-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-neutral-900">평균 평점</CardTitle>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-neutral-900 mb-2">
                    {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">
                    5.0 만점
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="group hover:scale-105 animate-fade-in-up delay-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-neutral-900">플랫폼</CardTitle>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-neutral-900 mb-2">
                    {Object.keys(platformCounts).length}
                  </div>
                  <p className="text-sm text-neutral-600 font-medium">
                    연결된 플랫폼
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="group hover:scale-105 animate-fade-in-up delay-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-neutral-900">프로필 조회</CardTitle>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-neutral-900 mb-2">-</div>
                  <p className="text-sm text-neutral-600 font-medium">
                    곧 제공될 예정
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="animate-fade-in-up delay-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">빠른 작업</h2>
                <p className="text-lg text-neutral-600">자주 사용하는 기능들에 빠르게 접근하세요</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Card 
                    key={action.title}
                    variant="elevated"
                    className={`group hover:scale-105 transition-all duration-300 ${action.urgent ? 'ring-2 ring-accent/50 animate-pulse-soft' : ''}`}
                  >
                    <Link href={action.href} className="block p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 float`}>
                          <span className="text-white">{action.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                            {action.title}
                            {action.urgent && <span className="ml-2 text-accent">!</span>}
                          </h3>
                          <p className="text-neutral-600 leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>최근 리뷰</CardTitle>
                  <CardDescription>
                    최근에 추가된 리뷰들을 관리하세요
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/dashboard/reviews">
                    모든 리뷰 보기
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      아직 리뷰가 없습니다
                    </h3>
                    <p className="text-gray-600 mb-6">
                      첫 번째 리뷰를 추가하여 포트폴리오를 시작해보세요
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/reviews/add">
                        첫 리뷰 추가하기
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div 
                        key={review.id} 
                        className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-base"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <PlatformBadge platform={review.source as any} showIcon={true} />
                            {review.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{review.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 mb-1">
                            {review.reviewer_name}
                          </p>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {review.review_text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReviewVisibility(review.id, review.is_visible)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {review.is_visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/reviews/${review.id}`}>
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {reviews.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" asChild>
                          <Link href="/dashboard/reviews">
                            {reviews.length - 5}개 더 보기
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  )
}