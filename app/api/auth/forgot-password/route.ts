import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요' },
        { status: 400 }
      )
    }

    // 이메일로 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // 사용자가 없어도 성공 응답 (보안상 이유)
    if (!user) {
      return NextResponse.json({
        message: '해당 이메일로 비밀번호 재설정 링크를 전송했습니다.'
      })
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1시간 후 만료

    // 사용자 정보 업데이트 (토큰 저장)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // 실제 프로덕션에서는 이메일 전송 서비스 사용
    // 예: SendGrid, AWS SES, Nodemailer 등
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('=================================')
      console.log('비밀번호 재설정 링크:')
      console.log(resetUrl)
      console.log('=================================')
    }

    // TODO: 실제 이메일 전송 구현
    // await sendEmail({
    //   to: email,
    //   subject: 'Re:cord 비밀번호 재설정',
    //   html: `
    //     <h2>비밀번호 재설정</h2>
    //     <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
    //     <a href="${resetUrl}">비밀번호 재설정하기</a>
    //     <p>이 링크는 1시간 후 만료됩니다.</p>
    //     <p>요청하지 않으셨다면 이 이메일을 무시하세요.</p>
    //   `
    // })

    return NextResponse.json({
      message: '비밀번호 재설정 링크를 이메일로 전송했습니다.',
      // 개발 환경에서만 토큰 반환 (테스트용)
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}