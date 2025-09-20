import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, corsHeaders, securityHeaders } from '@/lib/security';
import { verifyLatpeedWebhook, LatpeedWebhookEvent } from '@/lib/latpeed';

export async function POST(req: NextRequest) {
  // Rate limiting 적용
  const clientIp = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResponse = await withRateLimit(req, `webhook-${clientIp}`, 10); // 웹훅은 분당 10회 제한
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const rawBody = await req.text();
    let event: LatpeedWebhookEvent;

    try {
      event = verifyLatpeedWebhook({
        rawBody,
        signature: req.headers.get('x-latpeed-signature') || '',
        eventNameHeader: req.headers.get('x-latpeed-event') || '',
        timestampHeader: req.headers.get('x-latpeed-timestamp') || '',
      });
    } catch (error) {
      console.error('Latpeed webhook verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('Latpeed webhook received:', {
      event: event.type,
      subscriptionId: event.data.subscriptionId,
      paymentId: event.data.paymentId,
      status: event.data.status,
    });

    switch (event.type) {
      case 'subscription.created':
      case 'payment.succeeded':
        // 결제 성공 처리
        await handlePaymentSuccess({
          subscriptionId: event.data.subscriptionId || event.data.paymentId,
          customerEmail: event.data.customerEmail,
          amount: event.data.amount,
          plan: event.data.metadata?.plan || 'premium',
        });
        break;

      case 'subscription.cancelled':
      case 'payment.failed':
        // 결제 실패 또는 구독 취소 처리
        await handlePaymentFailure({
          subscriptionId: event.data.subscriptionId || event.data.paymentId,
          customerEmail: event.data.customerEmail,
        });
        break;

      case 'subscription.renewed':
        // 구독 갱신 처리
        await handleSubscriptionRenewal({
          subscriptionId: event.data.subscriptionId,
          customerEmail: event.data.customerEmail,
          nextBillingDate: event.data.nextBillingDate,
        });
        break;

      default:
        console.log('Unhandled Latpeed webhook event:', event.type);
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
