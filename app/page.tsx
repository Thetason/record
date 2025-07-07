import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { Badge, PlatformBadge } from '@/components/ui/Badge'
import { Star, Users, Zap, Shield, ArrowRight, Play } from 'lucide-react'

// Force revalidation - timestamp: 2025-01-07T14:00:00Z
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
      <main className="min-h-screen" style={{ backgroundColor: "#FF0000" }}>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <Container>
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center py-20 relative z-10">
              <div className="max-w-4xl mx-auto animate-fade-in-up">
                
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-neutral-900 mb-8 leading-tight tracking-tight font-display">
                  DESIGN CHANGED<br />
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    변경사항 확인
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                  여러 플랫폼의 리뷰를 한 곳에 모아 신뢰할 수 있는 전문가 이미지를 구축하세요
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200 mb-16">
                <Button 
                  size="xl" 
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/register">
                    무료로 시작하기
                  </Link>
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  className="border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-bold px-8 py-4 text-lg rounded-full transition-all duration-300"
                  asChild
                >
                  <Link href="/designer_kim">
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
        <section className="py-24 bg-white relative">
          <Container>
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-6 tracking-tight font-display">
                모든 리뷰를 한 곳에서
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                흩어진 리뷰들을 통합 관리하고 전문적인 포트폴리오로 변환하세요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="text-center p-8 group animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-neutral-900 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
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
        <section className="py-24 bg-neutral-900 relative overflow-hidden">
          <Container className="relative z-10">
            <div className="text-center text-white animate-fade-in-up max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-tight font-display">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-neutral-300 mb-10 leading-relaxed">
                무료로 계정을 만들고 몇 분 만에 전문적인 리뷰 포트폴리오를 완성하세요
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="xl" 
                  className="bg-white text-neutral-900 hover:bg-neutral-100 px-8 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" 
                  asChild
                >
                  <Link href="/register">
                    무료로 시작하기
                  </Link>
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-neutral-900 px-8 py-4 text-lg font-bold rounded-full transition-all duration-300"
                  asChild
                >
                  <Link href="/login">
                    로그인
                  </Link>
                </Button>
              </div>

              {/* Additional CTA info */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-400 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>100% 무료</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>3분만에 설정</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>무제한 리뷰</span>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}