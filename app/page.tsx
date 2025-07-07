import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { Badge, PlatformBadge } from '@/components/ui/Badge'
import { Star, Users, Zap, Shield, ArrowRight, Play } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "플랫폼 통합 관리",
      description: "네이버, 카카오, 구글, 크몽, 숨고, 당근마켓 등 여러 플랫폼의 리뷰를 한 곳에서 관리하세요."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "간편한 포트폴리오",
      description: "record.kr/당신의이름 형태의 깔끔한 포트폴리오를 몇 분 만에 만들어보세요."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "신뢰할 수 있는 리뷰",
      description: "실제 고객의 생생한 후기로 당신의 전문성을 입증하세요."
    }
  ]

  const testimonials = [
    {
      name: "김디자이너",
      profession: "UI/UX 디자이너",
      username: "designer_kim",
      review: "여러 플랫폼에 흩어진 리뷰들을 한 곳에 모을 수 있어서 너무 편해요!",
      rating: 5,
      platforms: ["크몽", "숨고", "네이버"] as const
    },
    {
      name: "박개발자", 
      profession: "풀스택 개발자",
      username: "developer_park",
      review: "깔끔한 포트폴리오로 새 클라이언트를 유치하는데 큰 도움이 되었습니다.",
      rating: 5,
      platforms: ["크몽", "구글"] as const
    },
    {
      name: "이마케터",
      profession: "디지털 마케팅 전문가", 
      username: "marketer_lee",
      review: "리뷰를 보여주는 방식이 정말 세련되고 전문적이에요.",
      rating: 4,
      platforms: ["카카오", "네이버"] as const
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <Container>
            <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center text-center py-24">
              <div className="animate-fade-in">
                <h1 className="text-5xl sm:text-7xl font-bold gradient-mixed text-gradient mb-6">
                  Re:cord
                </h1>
                <p className="text-2xl sm:text-3xl font-medium text-gray-700 mb-4">
                  리뷰는 누군가의 기억입니다
                </p>
                <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                  여러 플랫폼에서 받은 소중한 리뷰들을 한 곳에 모아<br className="hidden sm:block" />
                  나만의 프리랜서 포트폴리오를 만들어보세요
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up mb-16">
                <Button size="xl" className="gap-2" asChild>
                  <Link href="/register">
                    무료로 시작하기
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="gap-2" asChild>
                  <Link href="/designer_kim">
                    <Play className="h-5 w-5" />
                    데모 보기
                  </Link>
                </Button>
              </div>

              {/* Platform Badges */}
              <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
                <PlatformBadge platform="네이버" />
                <PlatformBadge platform="카카오" />
                <PlatformBadge platform="구글" />
                <PlatformBadge platform="크몽" />
                <PlatformBadge platform="숨고" />
                <PlatformBadge platform="당근마켓" />
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                왜 Re:cord인가요?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                흩어진 리뷰들을 하나로 모아 더 강력한 포트폴리오를 만들어보세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center border-0 shadow-medium">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Social Proof Section */}
        <section className="py-24">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                이미 많은 프리랜서들이 사용하고 있어요
              </h2>
              <p className="text-lg text-gray-600">
                실제 사용자들의 생생한 후기를 확인해보세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-medium">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.profession}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      "{testimonial.review}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {testimonial.platforms.map((platform) => (
                        <PlatformBadge key={platform} platform={platform} showIcon={false} />
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4" asChild>
                      <Link href={`/${testimonial.username}`}>
                        프로필 보기 →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary via-primary-400 to-secondary">
          <Container>
            <div className="text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                지금 바로 시작해보세요
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                무료로 계정을 만들고 몇 분 만에 나만의 리뷰 포트폴리오를 완성하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="outline" className="bg-white text-primary border-white hover:bg-gray-50" asChild>
                  <Link href="/register">
                    무료 계정 만들기
                  </Link>
                </Button>
                <Button size="xl" variant="ghost" className="text-white border-white/30 hover:bg-white/10" asChild>
                  <Link href="/login">
                    로그인
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}