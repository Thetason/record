import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[username] - 공개 프로필 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        location: true,
        website: true,
        avatar: true,
        isPublic: true,
        profileViews: true,
        createdAt: true,
        reviews: {
          where: { isPublic: true },
          orderBy: { reviewDate: 'desc' },
          select: {
            id: true,
            platform: true,
            business: true,
            rating: true,
            content: true,
            author: true,
            reviewDate: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isPublic) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 })
    }

    // 프로필 조회수 증가
    await prisma.user.update({
      where: { username: params.username },
      data: { profileViews: { increment: 1 } }
    })

    // 통계 계산
    const stats = {
      totalReviews: user.reviews.length,
      averageRating: user.reviews.length > 0 
        ? parseFloat((user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length).toFixed(1))
        : 0,
      platforms: new Set(user.reviews.map(review => review.platform)).size,
      responseRate: 98 // 임시값, 실제로는 계산 로직 필요
    }

    const profile = {
      ...user,
      stats
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}