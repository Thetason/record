import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit, getIP, rateLimitResponse, apiLimits } from '@/lib/rate-limit';
import { createLatpeedCheckout } from '@/lib/latpeed';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 });

export async function POST(req: NextRequest) {
  try {
    const clientIp = getIP(req) || 'unknown';
    try {
      await limiter.check(req, apiLimits.payment, `checkout_${clientIp}`);
    } catch {
      return rateLimitResponse();
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.email) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { planId, amount, currency = 'KRW', successUrl, cancelUrl } = await req.json();

    if (!planId || !amount || amount <= 0) {
      return NextResponse.json({ error: '유효하지 않은 결제 요청입니다.' }, { status: 400 });
    }

    const checkout = await createLatpeedCheckout({
      planId,
      price: amount,
      currency,
      successUrl,
      cancelUrl,
      customer: {
        email: user.email,
        name: user.name || user.username,
        id: user.id,
      },
      metadata: { planId },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency,
        status: 'pending',
        paymentId: checkout.sessionId,
        metadata: {
          checkoutUrl: checkout.checkoutUrl,
          planId,
        },
      },
    });

    return NextResponse.json({ success: true, checkoutUrl: checkout.checkoutUrl });
  } catch (error) {
    console.error('Latpeed checkout error:', error);
    return NextResponse.json({ error: '결제 세션 생성에 실패했습니다.' }, { status: 500 });
  }
}
