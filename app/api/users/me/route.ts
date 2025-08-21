import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/me - 현재 사용자 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 5 // 최근 5개만
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 통계 계산
    const allReviews = await prisma.review.findMany({
      where: { userId: session.user.id }
    })

    const stats = {
      totalReviews: allReviews.length,
      averageRating: allReviews.length > 0 
        ? parseFloat((allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1))
        : 0,
      platforms: new Set(allReviews.map(review => review.platform)).size,
      thisMonth: allReviews.filter(review => {
        const reviewDate = new Date(review.reviewDate)
        const now = new Date()
        return reviewDate.getMonth() === now.getMonth() && reviewDate.getFullYear() === now.getFullYear()
      }).length
    }

    return NextResponse.json({
      ...user,
      stats
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/me - 현재 사용자 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, username, bio, location, website, phone, avatar, isPublic,
      theme, layout, bgImage, bgColor, accentColor, introVideo, customCss 
    } = body

    // 사용자명 중복 확인 (본인 제외)
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(isPublic !== undefined && { isPublic }),
        ...(theme !== undefined && { theme }),
        ...(layout !== undefined && { layout }),
        ...(bgImage !== undefined && { bgImage }),
        ...(bgColor !== undefined && { bgColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(introVideo !== undefined && { introVideo }),
        ...(customCss !== undefined && { customCss })
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}