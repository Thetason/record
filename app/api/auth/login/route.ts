import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    
    console.log('로그인 API 호출:', { username, hasPassword: !!password })
    
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: '아이디와 비밀번호를 입력해주세요'
      }, { status: 400 })
    }
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      console.log('사용자를 찾을 수 없음:', username)
      return NextResponse.json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다'
      }, { status: 401 })
    }
    
    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, user.password!)
    
    if (!isValid) {
      console.log('비밀번호 불일치:', username)
      return NextResponse.json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다'
      }, { status: 401 })
    }
    
    console.log('로그인 성공:', username)
    
    // 성공 응답
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다'
    }, { status: 500 })
  }
}