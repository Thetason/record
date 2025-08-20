import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: '토큰과 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // 토큰으로 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // 현재 시간보다 만료 시간이 큰 경우 (아직 만료되지 않음)
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 토큰입니다' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcryptjs.hash(password, 12)

    // 사용자 비밀번호 업데이트 및 토큰 초기화
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({
      message: '비밀번호가 성공적으로 재설정되었습니다'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}