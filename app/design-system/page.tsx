'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/layout/Container'
import { Heart, Star, MessageCircle, Search, Mail } from 'lucide-react'

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('')
  const [errorInput, setErrorInput] = useState('')

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <div className="space-y-12">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-mixed text-gradient mb-4">
              Re:cord Design System
            </h1>
            <p className="text-lg text-gray-600">
              Linktree 수준의 완성도를 목표로 하는 디자인 시스템
            </p>
          </div>

          {/* Colors */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Colors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="h-24 rounded-lg gradient-primary" />
                <p className="text-sm font-medium">Primary</p>
                <p className="text-xs text-gray-500">#FF6B35</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg gradient-secondary" />
                <p className="text-sm font-medium">Secondary</p>
                <p className="text-xs text-gray-500">#FF8CC8</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-background border" />
                <p className="text-sm font-medium">Background</p>
                <p className="text-xs text-gray-500">#FAFAFA</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-foreground" />
                <p className="text-sm font-medium">Foreground</p>
                <p className="text-xs text-gray-500">#2D3748</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-gray-200" />
                <p className="text-sm font-medium">Gray 200</p>
                <p className="text-xs text-gray-500">#E2E8F0</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg gradient-mixed" />
                <p className="text-sm font-medium">Gradient</p>
                <p className="text-xs text-gray-500">Mixed</p>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Buttons</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button loading>Loading...</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button className="gap-2">
                  <Heart className="h-4 w-4" /> With Icon
                </Button>
                <Button variant="secondary" className="gap-2">
                  <Star className="h-4 w-4" /> Star
                </Button>
              </div>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Cards</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 카드</CardTitle>
                  <CardDescription>호버 효과가 있는 카드입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    카드 컴포넌트는 그림자와 호버 효과를 포함하여 부드러운 사용자 경험을 제공합니다.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">더 알아보기</Button>
                </CardFooter>
              </Card>

              <Card hover={false}>
                <CardHeader>
                  <CardTitle>호버 없는 카드</CardTitle>
                  <CardDescription>정적인 정보 표시용</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full gradient-primary" />
                    <div>
                      <p className="font-medium">사용자 이름</p>
                      <p className="text-sm text-gray-500">user@example.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="gradient-mixed text-gradient">
                    그라디언트 타이틀
                  </CardTitle>
                  <CardDescription>커스텀 스타일 카드</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Badge>React</Badge>
                    <Badge variant="primary">Next.js</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Inputs</h2>
            <div className="max-w-2xl space-y-4">
              <Input
                label="기본 입력"
                placeholder="텍스트를 입력하세요"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              <Input
                label="아이콘이 있는 입력"
                placeholder="이메일을 입력하세요"
                leftIcon={<Mail className="h-4 w-4" />}
                type="email"
              />

              <Input
                label="검색"
                placeholder="검색어를 입력하세요"
                rightIcon={<Search className="h-4 w-4" />}
              />

              <Input
                label="에러 상태"
                placeholder="필수 입력 항목입니다"
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                error={errorInput === '' ? '이 필드는 필수입니다' : ''}
              />

              <Input
                label="도움말이 있는 입력"
                placeholder="비밀번호"
                type="password"
                helperText="최소 8자 이상, 대소문자와 숫자를 포함해주세요"
              />

              <Textarea
                label="텍스트 영역"
                placeholder="긴 텍스트를 입력하세요"
                rows={4}
              />

              <Textarea
                label="에러가 있는 텍스트 영역"
                placeholder="리뷰를 작성해주세요"
                error="최소 10자 이상 작성해주세요"
                rows={3}
              />
            </div>
          </section>

          {/* Badges */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Badges</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge platform="네이버">네이버</Badge>
                <Badge platform="카카오">카카오</Badge>
                <Badge platform="구글">구글</Badge>
                <Badge platform="크몽">크몽</Badge>
                <Badge platform="숨고">숨고</Badge>
                <Badge platform="당근마켓">당근마켓</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge icon={<Star className="h-3 w-3" />}>5.0</Badge>
                <Badge variant="primary" icon={<Heart className="h-3 w-3" />}>
                  234 좋아요
                </Badge>
                <Badge variant="secondary" icon={<MessageCircle className="h-3 w-3" />}>
                  56 리뷰
                </Badge>
              </div>
            </div>
          </section>

          {/* Animations */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Animations</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="animate-float">
                <CardHeader>
                  <CardTitle>Float Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">부드럽게 떠다니는 애니메이션</p>
                </CardContent>
              </Card>

              <Card className="animate-pulse-soft">
                <CardHeader>
                  <CardTitle>Pulse Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">부드러운 펄스 효과</p>
                </CardContent>
              </Card>

              <Card className="hover:animate-none animate-slide-up">
                <CardHeader>
                  <CardTitle>Slide Up Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">아래에서 위로 슬라이드</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </div>
  )
}