import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getIP, rateLimitResponse, apiLimits } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const limiter = rateLimit({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting 적용
    const ip = getIP(req);
    try {
      await limiter.check(req, apiLimits.login, `login_${ip}`);
    } catch {
      return rateLimitResponse();
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        password: true,
      }
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '자격 증명이 확인되었습니다. 실제 로그인은 NextAuth credentials 플로우를 사용하세요.'
    });

  } catch (error) {
    console.error('로그인 에러:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
