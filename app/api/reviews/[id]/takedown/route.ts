import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { REVIEW_RIGHTS_STATUSES } from '@/lib/review-policy'

const VALID_REQUESTER_TYPES = new Set(['REVIEWER', 'PLATFORM', 'USER', 'OTHER'])

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: '요청 본문이 필요합니다.' }, { status: 400 })
    }

    const reason = String(body.reason || '').trim()
    const description = String(body.description || '').trim()
    const requesterEmail = String(body.requesterEmail || '').trim()
    const requesterTypeRaw = String(body.requesterType || 'OTHER').trim().toUpperCase()
    const requesterType = VALID_REQUESTER_TYPES.has(requesterTypeRaw) ? requesterTypeRaw : 'OTHER'

    if (reason.length < 5) {
      return NextResponse.json(
        { error: '삭제 요청 사유를 5자 이상 입력해주세요.' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const takedownRequest = await tx.takedownRequest.create({
        data: {
          reviewId: review.id,
          requesterType: requesterType as 'REVIEWER' | 'PLATFORM' | 'USER' | 'OTHER',
          requesterEmail: requesterEmail || null,
          reason,
          description: description || null
        }
      })

      await tx.review.update({
        where: { id: review.id },
        data: {
          rightsStatus: REVIEW_RIGHTS_STATUSES.TAKEDOWN_REQUESTED,
          isPublic: false
        }
      })

      return takedownRequest
    })

    return NextResponse.json({
      success: true,
      requestId: result.id,
      message: '삭제 요청이 접수되었습니다. 검토 후 처리됩니다.'
    })
  } catch (error) {
    console.error('Takedown request error:', error)
    return NextResponse.json(
      { error: '삭제 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
