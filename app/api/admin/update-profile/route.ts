import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, bio } = await request.json()

    if (!username || !bio) {
      return NextResponse.json(
        { error: 'username과 bio가 필요합니다' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { username },
      data: { bio }
    })

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        bio: user.bio
      }
    })
  } catch (error) {
    console.error('프로필 업데이트 오류:', error)
    return NextResponse.json(
      { error: '프로필 업데이트 실패' },
      { status: 500 }
    )
  }
}
