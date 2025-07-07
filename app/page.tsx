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
      icon: <Users className="h-8 w-8" />,
      title: "플랫폼 통합 관리",
      description: "네이버, 카카오, 구글, 크몽, 숨고, 당근마켓 등 여러 플랫폼의 리뷰를 한 곳에서 관리하세요.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "간편한 포트폴리오",
      description: "record.kr/당신의이름 형태의 깔끔한 포트폴리오를 몇 분 만에 만들어보세요.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "신뢰할 수 있는 리뷰",
      description: "실제 고객의 생생한 후기로 당신의 전문성을 입증하세요.",
      gradient: "from-green-500 to-emerald-500"
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
      <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse-soft delay-300" />
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <Container>
            <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center text-center py-24 relative z-10">
              <div className="animate-fade-in-up">
                {/* Logo/Brand */}
                <div className="mb-8 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/25 float">
                    <span className="text-2xl font-bold text-white">R</span>
                  </div>
                </div>
                
                <h1 className="text-6xl sm:text-8xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 leading-tight tracking-tight font-display">
                  Re:cord
                </h1>
                <p className="text-2xl sm:text-4xl font-semibold text-neutral-800 mb-6 leading-snug font-display">
                  리뷰는 누군가의 기억입니다
                </p>
                <p className="text-xl text-neutral-600 mb-16 max-w-4xl mx-auto leading-relaxed">
                  여러 플랫폼에서 받은 소중한 리뷰들을 한 곳에 모아<br className="hidden sm:block" />
                  나만의 프리랜서 포트폴리오를 만들어보세요
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up delay-200 mb-20">
                <Button 
                  size="xl" 
                  className="gap-3 px-12 py-4 text-lg font-semibold shadow-2xl shadow-primary/25 hover:shadow-3xl hover:shadow-primary/30" 
                  shimmer
                  glow
                  asChild
                >
                  <Link href="/register">
                    무료로 시작하기
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </Button>
                <Button 
                  size="xl" 
                  variant="glass" 
                  className="gap-3 px-12 py-4 text-lg font-semibold backdrop-blur-xl border-white/30" 
                  asChild
                >
                  <Link href="/designer_kim">
                    <Play className="h-6 w-6" />
                    데모 보기
                  </Link>
                </Button>
              </div>

              {/* Enhanced Platform Badges */}
              <div className="animate-fade-in-up delay-400">
                <p className="text-sm text-neutral-500 mb-6 font-medium tracking-wide uppercase">
                  지원하는 플랫폼
                </p>
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                  {['네이버', '카카오', '구글', '크몽', '숨고', '당근마켓'].map((platform, index) => (
                    <div 
                      key={platform} 
                      className="animate-fade-in-up" 
                      style={{ animationDelay: `${500 + index * 100}ms` }}
                    >
                      <PlatformBadge 
                        platform={platform as any} 
                        className="transform hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-gradient-to-b from-white to-neutral-50 relative">
          <Container>
            <div className="text-center mb-20 animate-fade-in-up">
              <h2 className="text-4xl sm:text-6xl font-black text-neutral-900 mb-6 tracking-tight font-display">
                왜 Re:cord인가요?
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                흩어진 리뷰들을 하나로 모아 더 강력한 포트폴리오를 만들어보세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  variant="glass"
                  glow
                  shimmer
                  className={`text-center border-0 p-8 group hover:scale-105 animate-fade-in-up delay-${index + 1}00`}
                >
                  <CardHeader className="pb-6">
                    <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500 float`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold mb-3 text-neutral-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg leading-relaxed text-neutral-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Social Proof Section */}
        <section className="py-32 bg-gradient-to-br from-neutral-50 to-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl" />
          </div>

          <Container className="relative z-10">
            <div className="text-center mb-20 animate-fade-in-up">
              <h2 className="text-4xl sm:text-6xl font-black text-neutral-900 mb-6 tracking-tight">
                이미 많은 프리랜서들이 사용하고 있어요
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                실제 사용자들의 생생한 후기를 확인해보세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  variant="elevated"
                  glow
                  className={`group hover:scale-105 animate-fade-in-up delay-${index + 2}00`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-neutral-900">{testimonial.name}</h4>
                        <p className="text-neutral-600">{testimonial.profession}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`} 
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-neutral-700 mb-6 leading-relaxed text-lg italic">
                      "{testimonial.review}"
                    </blockquote>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {testimonial.platforms.map((platform) => (
                        <PlatformBadge 
                          key={platform} 
                          platform={platform} 
                          showIcon={false}
                          className="transform hover:scale-105 transition-transform duration-200" 
                        />
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 group-hover:bg-primary group-hover:text-white transition-colors duration-300" 
                      asChild
                    >
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
        <section className="py-32 bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden">
          {/* Background patterns */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft delay-500" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          </div>

          <Container className="relative z-10">
            <div className="text-center text-white animate-fade-in-up">
              {/* Icon */}
              <div className="mb-8 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 float">
                  <ArrowRight className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-4xl sm:text-7xl font-black mb-8 tracking-tight leading-tight">
                지금 바로 시작해보세요
              </h2>
              <p className="text-xl sm:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed font-medium">
                무료로 계정을 만들고 몇 분 만에 나만의 리뷰 포트폴리오를 완성하세요
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="bg-white text-primary border-white hover:bg-neutral-50 px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105" 
                  shimmer
                  asChild
                >
                  <Link href="/register">
                    무료 계정 만들기
                  </Link>
                </Button>
                <Button 
                  size="xl" 
                  variant="glass" 
                  className="text-white border-white/30 hover:bg-white/20 px-12 py-4 text-lg font-semibold backdrop-blur-xl hover:scale-105" 
                  asChild
                >
                  <Link href="/login">
                    로그인
                  </Link>
                </Button>
              </div>

              {/* Additional CTA info */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">100% 무료</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">3분만에 설정</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">무제한 리뷰</span>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}