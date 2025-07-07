import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, PlatformBadge } from '@/components/ui/Badge'
import { Container } from '@/components/layout/Container'
import { profileApi, reviewApi } from '@/lib/api'
import { Star, MapPin, Calendar, ExternalLink, Share2, MessageCircle } from 'lucide-react'
import { ShareButton } from '@/components/ShareButton'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  // Fetch profile and reviews data
  const [profileResult, reviewsResult, statsResult] = await Promise.all([
    profileApi.getByUsername(username),
    reviewApi.getByUsername(username),
    reviewApi.getStats(username)
  ])

  if (!profileResult.success || !profileResult.data) {
    notFound()
  }

  const profile = profileResult.data
  const reviews = reviewsResult.success ? reviewsResult.data : []
  const stats = statsResult.success ? statsResult.data : []

  // Calculate statistics
  const totalReviews = reviews?.length || 0
  const averageRating = totalReviews > 0 
    ? (reviews || []).reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / totalReviews 
    : 0

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse-soft delay-300" />
      </div>

      {/* Profile Header */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
              {/* Avatar */}
              <div className="relative group">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-40 h-40 rounded-3xl border-4 border-white/30 object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-3xl border-4 border-white/30 bg-white/20 backdrop-blur-xl flex items-center justify-center text-5xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {profile.name[0]}
                  </div>
                )}
                {/* Floating decoration */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/30 rounded-full animate-bounce-gentle" />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-5xl lg:text-7xl font-black mb-4 leading-tight tracking-tight font-display">
                  {profile.name}
                </h1>
                {profile.profession && (
                  <p className="text-2xl lg:text-3xl text-white/90 mb-6 font-semibold">
                    {profile.profession}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-xl text-white/80 leading-relaxed mb-8 max-w-3xl">
                    {profile.bio}
                  </p>
                )}

                {/* Enhanced Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-white/90 mb-8">
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/30">
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-xl font-bold">{totalReviews}</span>
                    <span className="text-lg">리뷰</span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/30">
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                      <span className="text-xl font-bold">{averageRating.toFixed(1)}</span>
                      <span className="text-lg">평점</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/30">
                    <Calendar className="h-6 w-6" />
                    <span className="text-lg font-medium">
                      {new Date(profile.created_at).getFullYear()}년부터
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center lg:justify-start">
                  <ShareButton username={username} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Platform Stats */}
      {(stats?.length || 0) > 0 && (
        <section className="py-20 bg-white relative z-10">
          <Container>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">플랫폼별 리뷰</h2>
                <p className="text-lg text-neutral-600">각 플랫폼에서 받은 리뷰 현황을 확인하세요</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {(stats || []).map((stat: any, index: number) => (
                  <Card 
                    key={stat.source} 
                    variant="glass"
                    glow
                    className={`text-center group hover:scale-110 animate-fade-in-up delay-${index * 100}`}
                  >
                    <CardContent className="p-6">
                      <PlatformBadge 
                        platform={stat.source as any} 
                        className="mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="text-3xl font-black text-neutral-900 mb-2">
                        {stat.count}
                      </div>
                      {stat.average_rating > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-neutral-700">
                            {stat.average_rating}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50 relative z-10">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 animate-fade-in-up">
              <div className="mb-6 lg:mb-0">
                <h2 className="text-4xl font-black text-neutral-900 mb-2 tracking-tight">
                  고객 리뷰 ({totalReviews})
                </h2>
                <p className="text-lg text-neutral-600">실제 고객들의 생생한 후기를 확인하세요</p>
              </div>
              {averageRating > 0 && (
                <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-lg border border-neutral-200">
                  <div className="flex gap-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-2xl font-bold text-neutral-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {(reviews?.length || 0) === 0 ? (
              <Card variant="glass" className="text-center py-16 animate-fade-in-up">
                <CardContent>
                  <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                    아직 리뷰가 없습니다
                  </h3>
                  <p className="text-lg text-neutral-600">
                    첫 번째 리뷰를 기다리고 있어요!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8">
                {(reviews || []).map((review: any, index: number) => (
                  <Card 
                    key={review.id} 
                    variant="elevated"
                    glow
                    className={`group hover:scale-[1.02] animate-fade-in-up delay-${index * 100}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {review.reviewer_name[0]}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-neutral-900 mb-1">
                              {review.reviewer_name}
                            </h4>
                            <div className="flex items-center gap-3 mb-2">
                              <PlatformBadge 
                                platform={review.source as any}
                                showIcon={true}
                                className="transform hover:scale-105 transition-transform duration-200"
                              />
                              {review.rating && (
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <time className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </time>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-lg text-neutral-700 leading-relaxed mb-6 italic">
                        "{review.review_text}"
                      </blockquote>
                      
                      {review.image_url && (
                        <div className="mb-6">
                          <img
                            src={review.image_url}
                            alt="리뷰 이미지"
                            className="rounded-2xl max-w-full h-auto shadow-lg hover:shadow-xl transition-shadow duration-300"
                          />
                        </div>
                      )}

                      {review.external_link && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="group-hover:bg-primary group-hover:text-white transition-colors duration-300" 
                          asChild
                        >
                          <a 
                            href={review.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            원본 리뷰 보기
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl float">
                <span className="text-2xl font-bold text-white">R</span>
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Re:cord
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              나만의 리뷰 포트폴리오를 만들어보세요
            </h3>
            <p className="text-lg text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              여러 플랫폼의 리뷰를 한 곳에 모아 전문성을 입증하고 새로운 기회를 만들어보세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="px-8 py-3 text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105"
                shimmer
                glow
                asChild
              >
                <a href="/">Re:cord 시작하기</a>
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white border-white/30 hover:bg-white/10 px-8 py-3 text-lg font-semibold hover:scale-105"
                asChild
              >
                <a href="/login">로그인</a>
              </Button>
            </div>

            {/* Additional info */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-neutral-400 text-sm">
                © 2024 Re:cord. 모든 권리 보유.
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  )
}