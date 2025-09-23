import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reviews/[id] - 특정 리뷰 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/reviews/[id] - 리뷰 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, business, content, author, reviewDate, imageUrl, isPublic } = body

    // 소유자 확인
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id }
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 날짜 검증
    if (reviewDate) {
      const parsedDate = new Date(reviewDate)
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({
          error: 'Invalid date',
          message: '올바른 날짜 형식이 아닙니다.'
        }, { status: 400 })
      }

      if (parsedDate > new Date()) {
        return NextResponse.json({
          error: 'Invalid date',
          message: '리뷰 작성일은 오늘 이후일 수 없습니다.'
        }, { status: 400 })
      }
    }

    // 컨텐츠 길이 검증
    if (content) {
      if (content.length < 10) {
        return NextResponse.json({
          error: 'Invalid content',
          message: '리뷰 내용은 최소 10자 이상이어야 합니다.'
        }, { status: 400 })
      }

      if (content.length > 2000) {
        return NextResponse.json({
          error: 'Invalid content',
          message: '리뷰 내용은 최대 2000자까지만 가능합니다.'
        }, { status: 400 })
      }
    }

    const updateData = {}
    if (platform) updateData.platform = platform
    if (business) updateData.business = business
    if (content) updateData.content = content
    if (author) updateData.author = author
    if (reviewDate) updateData.reviewDate = new Date(reviewDate)
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] - 리뷰 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 소유자 확인
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id }
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
