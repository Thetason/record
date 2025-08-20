import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    
    console.log('테스트 로그인 시도:', { username, password })
    
    // 1. 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다',
        debug: { username, userFound: false }
      })
    }
    
    // 2. 비밀번호 검증
    const isValid = await bcrypt.compare(password, user.password!)
    
    return NextResponse.json({
      success: isValid,
      user: isValid ? {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      } : null,
      debug: {
        username,
        userFound: true,
        passwordValid: isValid,
        hasPassword: !!user.password
      }
    })
    
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}