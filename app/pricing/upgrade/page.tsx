"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Check, X, Crown, Rocket } from 'lucide-react'
import { PLANS } from '@/lib/plan-limits'
import { SUBSCRIPTION_PRODUCTS } from '@/lib/tosspayments'

export default function UpgradePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 현재 플랜 확인
    fetch('/api/subscription/check')
      .then(res => res.json())
      .then(data => {
        if (data.plan) {
          setCurrentPlan(data.plan)
        }
      })
  }, [])

  const handleUpgrade = async (plan: 'premium' | 'pro') => {
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(true)
    const productId = `${plan}_${billingPeriod}` as keyof typeof SUBSCRIPTION_PRODUCTS
    const product = SUBSCRIPTION_PRODUCTS[productId]

    try {
      // 토스페이먼츠 결제 위젯 초기화
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
      )

      // 결제 요청
      await tossPayments.requestPayment('카드', {
        amount: product.amount,
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderName: product.name,
        customerName: session.user?.name || '고객',
        customerEmail: session.user?.email || '',
        successUrl: `${window.location.origin}/api/payments/success`,
        failUrl: `${window.location.origin}/api/payments/fail`,
      })
    } catch (error) {
      console.error('Payment error:', error)
      alert('결제 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: '무료',
      icon: null,
      price: 0,
      features: [
        { name: '리뷰 50개까지', included: true },
        { name: '기본 프로필', included: true },
        { name: '기본 통계', included: true },
        { name: '커스텀 테마', included: false },
        { name: '고급 분석', included: false },
        { name: '워터마크 제거', included: false },
        { name: '우선 지원', included: false },
      ]
    },
    {
      id: 'premium',
      name: '프리미엄',
      icon: <Crown className="w-5 h-5" />,
      price: billingPeriod === 'monthly' ? 9900 : 99000,
      features: [
        { name: '리뷰 무제한', included: true },
        { name: '기본 프로필', included: true },
        { name: '기본 통계', included: true },
        { name: '커스텀 테마', included: true },
        { name: '고급 분석', included: true },
        { name: '워터마크 제거', included: true },
        { name: '우선 지원', included: true },
      ],
      popular: true
    },
    {
      id: 'pro',
      name: '프로',
      icon: <Rocket className="w-5 h-5" />,
      price: billingPeriod === 'monthly' ? 19900 : 199000,
      features: [
        { name: '리뷰 무제한', included: true },
        { name: '모든 프리미엄 기능', included: true },
        { name: '커스텀 도메인', included: true },
        { name: 'API 액세스', included: true },
        { name: '팀 협업 (5명)', included: true },
        { name: '커스텀 CSS', included: true },
        { name: '전담 지원', included: true },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            더 많은 기능으로 리뷰를 관리하세요
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Re:cord 프리미엄으로 업그레이드하고 무제한 리뷰를 등록하세요
          </p>

          {/* 결제 주기 선택 */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                billingPeriod === 'monthly' 
                  ? 'bg-[#FF6B35] text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              월간 결제
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                billingPeriod === 'yearly' 
                  ? 'bg-[#FF6B35] text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              연간 결제
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                17% 할인
              </span>
            </button>
          </div>
        </div>

        {/* 플랜 카드 */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-[#FF6B35]' : ''
              } ${currentPlan === plan.id ? 'opacity-75' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm">
                    인기
                  </span>
                </div>
              )}

              {currentPlan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                    현재 플랜
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.icon}
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <div className="text-3xl font-bold text-[#FF6B35]">
                  {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-600 font-normal">
                      /{billingPeriod === 'monthly' ? '월' : '년'}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.id !== 'free' && currentPlan !== plan.id && (
                <button
                  onClick={() => handleUpgrade(plan.id as 'premium' | 'pro')}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[#FF6B35] hover:bg-[#E55A2B] text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  } disabled:opacity-50`}
                >
                  {loading ? '처리 중...' : '업그레이드'}
                </button>
              )}

              {currentPlan === plan.id && (
                <div className="text-center text-gray-500">
                  현재 사용 중
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">모든 플랜은 언제든 취소 가능합니다</p>
          <p>문의사항은 support@record.com으로 연락주세요</p>
        </div>
      </div>
    </div>
  )
}