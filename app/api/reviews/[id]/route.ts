import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_FEATURED_REVIEWS = 3

// GET /api/reviews/[id] - 특정 리뷰 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id },
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

    if (review.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as Partial<{
      platform: string
      business: string
      content: string
      author: string
      reviewDate: string
      imageUrl: string | null
      isPublic: boolean
      isFeatured: boolean
      isVerified: boolean
      verificationStatus: string
      verificationNote: string | null
      verifiedBy: string | null
      verifiedAt: string | null
    }>
    const {
      platform,
      business,
      content,
      author,
      reviewDate,
      imageUrl,
      isPublic,
      isFeatured,
      isVerified,
      verificationStatus,
      verificationNote,
      verifiedBy,
      verifiedAt
    } = body

    // 소유자 확인
    const existingReview = await prisma.review.findUnique({
      where: { id }
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

    const updateData: Prisma.ReviewUpdateInput = {}
    const nextIsPublic = isPublic ?? existingReview.isPublic
    const nextVerificationStatus = verificationStatus ?? existingReview.verificationStatus

    if (isFeatured === true) {
      if (!nextIsPublic) {
        return NextResponse.json({
          error: 'Featured review must be public',
          message: '대표 후기는 공개 상태의 리뷰만 지정할 수 있습니다.'
        }, { status: 400 })
      }

      if (nextVerificationStatus !== 'approved') {
        return NextResponse.json({
          error: 'Featured review must be approved',
          message: '대표 후기는 승인 완료된 리뷰만 지정할 수 있습니다.'
        }, { status: 400 })
      }

      if (!existingReview.isFeatured) {
        const featuredCount = await prisma.review.count({
          where: {
            userId: session.user.id,
            isFeatured: true,
            id: { not: id }
          }
        })

        if (featuredCount >= MAX_FEATURED_REVIEWS) {
          return NextResponse.json({
            error: 'Featured review limit reached',
            message: `대표 후기는 최대 ${MAX_FEATURED_REVIEWS}개까지 선택할 수 있습니다.`
          }, { status: 400 })
        }
      }
    }

    if (platform) updateData.platform = platform
    if (business) updateData.business = business
    if (content) updateData.content = content
    if (author) updateData.author = author
    if (reviewDate) updateData.reviewDate = new Date(reviewDate)
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured
      updateData.featuredAt = isFeatured ? new Date() : null
    }
    if (isVerified !== undefined) updateData.isVerified = isVerified
    if (verificationStatus) updateData.verificationStatus = verificationStatus
    if (verificationNote !== undefined) updateData.verificationNote = verificationNote
    if (verifiedBy !== undefined) updateData.verifiedBy = verifiedBy
    if (verifiedAt !== undefined) {
      updateData.verifiedAt = verifiedAt ? new Date(verifiedAt) : null
    }

    const willBeHidden =
      (isPublic !== undefined && isPublic === false) ||
      (verificationStatus !== undefined && ['rejected', 'flagged', 'pending'].includes(verificationStatus))

    if (willBeHidden) {
      updateData.isFeatured = false
      updateData.featuredAt = null
    }

    const updatedReview = await prisma.review.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 소유자 확인
    const existingReview = await prisma.review.findUnique({
      where: { id }
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
