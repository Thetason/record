import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import rapidPayment, { SUBSCRIPTION_PLANS, generateOrderId } from '@/lib/rapid-payment';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { planId, period } = await req.json();

    // 플랜 확인
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return NextResponse.json({ error: '유효하지 않은 플랜입니다' }, { status: 400 });
    }

    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 이미 구독중인지 확인
    if (user.plan !== 'free' && user.planExpiry && new Date(user.planExpiry) > new Date()) {
      return NextResponse.json({ 
        error: '이미 구독중인 플랜이 있습니다' 
      }, { status: 400 });
    }

    // 결제 요청 생성
    const orderId = generateOrderId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const subscriptionRequest = {
      planId: plan.id,
      customerId: user.id,
      customerEmail: user.email,
      customerName: user.name || 'User',
      amount: plan.price,
      currency: 'KRW',
      interval: plan.interval || 'monthly' as 'monthly',
      description: `Re:cord ${plan.name} 구독`,
    };

    // Rapid 결제 요청
    const paymentResult = await rapidPayment.createSubscription(subscriptionRequest);

    if (paymentResult.success) {
      // 결제 정보 저장
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: plan.price,
          plan: planId,
          status: 'pending',
          paymentId: paymentResult.subscription_id,
          paymentData: JSON.stringify(paymentResult),
        },
      });

      return NextResponse.json({
        success: true,
        paymentUrl: paymentResult.payment_url || `/payment/process?id=${paymentResult.subscription_id}`,
        subscriptionId: paymentResult.subscription_id,
      });
    } else {
      throw new Error('결제 요청 실패');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        plan: true,
        planExpiry: true,
        reviewLimit: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 현재 구독 상태
    const isActive = user.plan !== 'free' && user.planExpiry && new Date(user.planExpiry) > new Date();

    return NextResponse.json({
      plan: user.plan,
      planExpiry: user.planExpiry,
      reviewLimit: user.reviewLimit,
      isActive,
      canUpgrade: user.plan === 'free' || !isActive,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: '구독 정보 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}