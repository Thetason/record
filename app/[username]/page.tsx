import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, PlatformBadge } from '@/components/ui/Badge'
import { Container } from '@/components/layout/Container'
import { profileApi, reviewApi } from '@/lib/api'
import { Star, MapPin, Calendar, ExternalLink, Share2, MessageCircle } from 'lucide-react'
import { ShareButton } from '@/components/ShareButton'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params

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
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / totalReviews 
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
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <section className="bg-gradient-to-r from-primary via-primary-400 to-secondary text-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-4xl font-bold">
                    {profile.name[0]}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {profile.name}
                </h1>
                {profile.profession && (
                  <p className="text-xl text-white/90 mb-4">
                    {profile.profession}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-white/80 leading-relaxed mb-6 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{totalReviews}</span>
                    <span>리뷰</span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                      <span>평점</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(profile.created_at).getFullYear()}년부터
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <ShareButton username={username} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Platform Stats */}
      {stats.length > 0 && (
        <section className="py-12 bg-white border-b">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">플랫폼별 리뷰</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat: any) => (
                  <Card key={stat.source} className="text-center">
                    <CardContent className="p-4">
                      <PlatformBadge 
                        platform={stat.source as any} 
                        className="mb-3 mx-auto"
                      />
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.count}
                      </div>
                      {stat.average_rating > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
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
      <section className="py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                고객 리뷰 ({totalReviews})
              </h2>
              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 리뷰가 없습니다
                  </h3>
                  <p className="text-gray-600">
                    첫 번째 리뷰를 기다리고 있어요!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {reviews.map((review: any) => (
                  <Card key={review.id} className="hover-lift">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                            {review.reviewer_name[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.reviewer_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <PlatformBadge 
                                platform={review.source as any}
                                showIcon={true}
                              />
                              {review.rating && (
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <time className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </time>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {review.review_text}
                      </p>
                      
                      {review.image_url && (
                        <div className="mb-4">
                          <img
                            src={review.image_url}
                            alt="리뷰 이미지"
                            className="rounded-lg max-w-full h-auto"
                          />
                        </div>
                      )}

                      {review.external_link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={review.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
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
      <footer className="bg-gray-50 py-12 mt-12">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-lg gradient-primary" />
              <span className="text-lg font-bold gradient-mixed text-gradient">
                Re:cord
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              나만의 리뷰 포트폴리오를 만들어보세요
            </p>
            <Button asChild>
              <a href="/">Re:cord 시작하기</a>
            </Button>
          </div>
        </Container>
      </footer>
    </div>
  )
}