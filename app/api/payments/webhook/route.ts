import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import rapidPayment from '@/lib/rapid-payment';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-rapid-signature');
    const payload = await req.json();

    // 서명 검증
    if (signature && !rapidPayment.verifyWebhook(signature, payload)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event_type, subscription_id, payment_id, status, customer_email } = payload;

    console.log('Webhook received:', { event_type, subscription_id, status });

    switch (event_type) {
      case 'subscription.created':
      case 'payment.succeeded':
        // 결제 성공 처리
        await handlePaymentSuccess({
          subscriptionId: subscription_id || payment_id,
          customerEmail: customer_email,
          amount: payload.amount,
          plan: payload.metadata?.plan || 'premium',
        });
        break;

      case 'subscription.cancelled':
      case 'payment.failed':
        // 결제 실패 또는 구독 취소 처리
        await handlePaymentFailure({
          subscriptionId: subscription_id || payment_id,
          customerEmail: customer_email,
        });
        break;

      case 'subscription.renewed':
        // 구독 갱신 처리
        await handleSubscriptionRenewal({
          subscriptionId: subscription_id,
          customerEmail: customer_email,
          nextBillingDate: payload.next_billing_date,
        });
        break;

      default:
        console.log('Unhandled webhook event:', event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess({
  subscriptionId,
  customerEmail,
  amount,
  plan,
}: {
  subscriptionId: string;
  customerEmail: string;
  amount: number;
  plan: string;
}) {
  try {
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      console.error('User not found:', customerEmail);
      return;
    }

    // 결제 기록 업데이트
    await prisma.payment.updateMany({
      where: {
        userId: user.id,
        paymentId: subscriptionId,
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // 사용자 플랜 업데이트
    const planExpiry = new Date();
    if (plan.includes('yearly')) {
      planExpiry.setFullYear(planExpiry.getFullYear() + 1);
    } else {
      planExpiry.setMonth(planExpiry.getMonth() + 1);
    }

    const planType = plan.includes('pro') ? 'pro' : 'premium';
    const reviewLimit = planType === 'pro' ? 999999 : 500;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: planType,
        planExpiry,
        reviewLimit,
      },
    });

    console.log('Payment success processed:', { userId: user.id, plan: planType });
  } catch (error) {
    console.error('Handle payment success error:', error);
    throw error;
  }
}

async function handlePaymentFailure({
  subscriptionId,
  customerEmail,
}: {
  subscriptionId: string;
  customerEmail: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) return;

    // 결제 기록 업데이트
    await prisma.payment.updateMany({
      where: {
        userId: user.id,
        paymentId: subscriptionId,
      },
      data: {
        status: 'failed',
      },
    });

    // 플랜 만료 시 Free로 다운그레이드
    if (user.planExpiry && new Date(user.planExpiry) < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'free',
          reviewLimit: 50,
        },
      });
    }

    console.log('Payment failure processed:', { userId: user.id });
  } catch (error) {
    console.error('Handle payment failure error:', error);
  }
}

async function handleSubscriptionRenewal({
  subscriptionId,
  customerEmail,
  nextBillingDate,
}: {
  subscriptionId: string;
  customerEmail: string;
  nextBillingDate: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) return;

    // 플랜 만료일 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planExpiry: new Date(nextBillingDate),
      },
    });

    console.log('Subscription renewed:', { userId: user.id, nextBillingDate });
  } catch (error) {
    console.error('Handle subscription renewal error:', error);
  }
}