import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/quota - 사용자의 리뷰 쿼터 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        reviewLimit: true,
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      current: user._count.reviews,
      limit: user.reviewLimit,
      plan: user.plan
    })
  } catch (error) {
    console.error('Error fetching quota:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
