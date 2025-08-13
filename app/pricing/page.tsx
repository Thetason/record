'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const plans = [
  {
    name: '무료',
    price: '0',
    period: '',
    description: '개인 사용자를 위한 기본 플랜',
    features: [
      { text: '리뷰 50개까지 등록', included: true },
      { text: '기본 프로필 페이지', included: true },
      { text: '플랫폼별 리뷰 관리', included: true },
      { text: '기본 통계', included: true },
      { text: '무제한 리뷰 등록', included: false },
      { text: '고급 통계 및 분석', included: false },
      { text: '커스텀 도메인', included: false },
      { text: 'API 접근', included: false },
      { text: '우선 고객 지원', included: false },
    ],
    buttonText: '시작하기',
    buttonVariant: 'outline' as const,
    badge: null,
  },
  {
    name: '프리미엄',
    price: '9,900',
    period: '/월',
    description: '전문가와 인플루언서를 위한 플랜',
    features: [
      { text: '무제한 리뷰 등록', included: true },
      { text: '고급 프로필 커스터마이징', included: true },
      { text: '상세 통계 및 분석', included: true },
      { text: '리뷰 검증 배지', included: true },
      { text: 'QR 코드 생성', included: true },
      { text: '이메일 서명 위젯', included: true },
      { text: 'SNS 공유 최적화', included: true },
      { text: '커스텀 도메인', included: false },
      { text: 'API 접근', included: false },
    ],
    buttonText: '프리미엄 시작하기',
    buttonVariant: 'default' as const,
    badge: '인기',
  },
  {
    name: '프로',
    price: '29,900',
    period: '/월',
    description: '비즈니스와 팀을 위한 플랜',
    features: [
      { text: '프리미엄의 모든 기능', included: true },
      { text: '커스텀 도메인 연결', included: true },
      { text: 'API 접근', included: true },
      { text: '팀 멤버 초대 (5명)', included: true },
      { text: '브랜드 커스터마이징', included: true },
      { text: '우선 고객 지원', included: true },
      { text: '데이터 내보내기', included: true },
      { text: 'Webhook 지원', included: true },
      { text: '전담 매니저', included: true },
    ],
    buttonText: '프로 시작하기',
    buttonVariant: 'default' as const,
    badge: null,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planName: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (planName === '무료') {
      router.push('/dashboard');
    } else {
      // TODO: 결제 페이지로 이동
      router.push(`/payment?plan=${planName.toLowerCase()}&period=${billingPeriod}`);
    }
  };

  const getPrice = (basePrice: string) => {
    if (basePrice === '0') return basePrice;
    if (billingPeriod === 'yearly') {
      const monthly = parseInt(basePrice.replace(',', ''));
      const yearly = monthly * 12 * 0.8; // 20% 할인
      return Math.floor(yearly / 12).toLocaleString();
    }
    return basePrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            합리적인 가격으로 시작하세요
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            리뷰 관리의 새로운 기준, Re:cord와 함께하세요
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600'
              }`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-gray-600'
              }`}
            >
              연간 결제
              <Badge className="ml-2" variant="secondary">20% 할인</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.name === '프리미엄' ? 'border-blue-500 shadow-xl scale-105' : ''
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₩{getPrice(plan.price)}</span>
                  <span className="text-gray-600">{plan.period}</span>
                  {billingPeriod === 'yearly' && plan.price !== '0' && (
                    <div className="text-sm text-green-600 mt-1">
                      연 ₩{(parseInt(plan.price.replace(',', '')) * 12 * 0.8).toLocaleString()} 
                      (₩{(parseInt(plan.price.replace(',', '')) * 12 * 0.2).toLocaleString()} 절약)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.buttonVariant}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">자주 묻는 질문</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                언제든지 플랜을 변경할 수 있나요?
              </h3>
              <p className="text-gray-600">
                네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 
                변경사항은 다음 결제일부터 적용됩니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                환불 정책은 어떻게 되나요?
              </h3>
              <p className="text-gray-600">
                구매 후 7일 이내에는 전액 환불이 가능합니다. 
                이후에는 남은 기간에 대해 일할 계산하여 환불해 드립니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                무료 플랜의 리뷰 50개 제한은 어떻게 계산되나요?
              </h3>
              <p className="text-gray-600">
                등록된 리뷰의 총 개수로 계산됩니다. 리뷰를 삭제하면 다시 추가할 수 있는 
                여유가 생깁니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                팀 플랜은 없나요?
              </h3>
              <p className="text-gray-600">
                프로 플랜에서 최대 5명까지 팀 멤버를 초대할 수 있습니다. 
                더 많은 인원이 필요하신 경우 별도 문의 바랍니다.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 p-12 bg-blue-50 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">
            아직 결정하지 못하셨나요?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            무료로 시작해보고 필요할 때 업그레이드하세요
          </p>
          <Button size="lg" onClick={() => router.push('/signup')}>
            무료로 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}