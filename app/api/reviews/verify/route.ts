import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { reviewId, originalUrl, verificationMethod } = await req.json()

    // 리뷰 소유권 확인
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id
      }
    })

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다' }, { status: 404 })
    }

    // URL 유효성 검증 (간단한 체크)
    if (originalUrl) {
      try {
        new URL(originalUrl)
      } catch {
        return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 })
      }
    }

    // 리뷰 검증 정보 업데이트
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        isVerified: true,
        originalUrl: originalUrl || review.originalUrl,
        verifiedAt: new Date(),
        verifiedBy: verificationMethod || 'manual'
      }
    })

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: '리뷰가 성공적으로 검증되었습니다'
    })

  } catch (error) {
    console.error('Review verification error:', error)
    return NextResponse.json(
      { error: '리뷰 검증 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 검증 상태 확인
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json({ error: '리뷰 ID가 필요합니다' }, { status: 400 })
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        isVerified: true,
        verifiedAt: true,
        verifiedBy: true,
        originalUrl: true
      }
    })

    if (!review) {
      return NextResponse.json({ error: '리뷰를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(review)

  } catch (error) {
    console.error('Verification check error:', error)
    return NextResponse.json(
      { error: '검증 상태 확인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}