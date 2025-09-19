import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { validateAndNormalizeUsername } from '@/lib/validators/username';
import { rateLimit, getIP, rateLimitResponse, apiLimits } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 300,
});

export async function POST(req: NextRequest) {
  try {
    const clientIp = getIP(req) || 'unknown';
    try {
      await limiter.check(req, apiLimits.signup, `signup_${clientIp}`);
    } catch {
      return rateLimitResponse();
    }

    const { username, email, password, name } = await req.json();

    const usernameValidation = validateAndNormalizeUsername(username);

    if (!usernameValidation.ok) {
      return NextResponse.json(
        { error: usernameValidation.message },
        { status: usernameValidation.status }
      );
    }

    const normalizedUsername = usernameValidation.value;

    // 입력값 검증
    if (!normalizedUsername || !email || !password) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 중복 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalizedUsername },
          { email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        return NextResponse.json(
          { error: '이미 사용 중인 아이디입니다.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email,
        password: hashedPassword,
        name: name || normalizedUsername,
        avatar:
          name?.charAt(0).toUpperCase() || normalizedUsername.charAt(0).toUpperCase(),
        plan: 'free',
        reviewLimit: 50
      }
    });

    // 환영 이메일 발송 (비동기로 처리)
    sendEmail(email, 'welcome', { name: name || normalizedUsername }).catch(err => {
      console.error('환영 이메일 발송 실패:', err);
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'SIGNUP',
        category: 'auth',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      username: normalizedUsername,
      truncated: usernameValidation.truncated
    });

  } catch (error) {
    console.error('회원가입 에러:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
