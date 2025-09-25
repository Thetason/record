import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params
    if (!username) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        isPublic: true
      }
    })

    if (!user || user.isPublic === false) {
      return NextResponse.json({ error: '리뷰를 받을 수 없는 계정입니다.' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: '요청 본문을 확인할 수 없습니다.' }, { status: 400 })
    }

    const customerName = (body.customerName || '').toString().trim()
    const serviceName = (body.serviceName || '').toString().trim()
    const reviewContent = (body.reviewContent || '').toString().trim()
    const contactInfo = (body.contact || '').toString().trim()

    if (!customerName || customerName.length < 1) {
      return NextResponse.json({ error: '이름 또는 닉네임을 입력해주세요.' }, { status: 400 })
    }

    if (!serviceName || serviceName.length < 2) {
      return NextResponse.json({ error: '이용하신 서비스 또는 상품명을 입력해주세요.' }, { status: 400 })
    }

    if (!reviewContent || reviewContent.length < 10) {
      return NextResponse.json({ error: '최소 10자 이상의 리뷰 내용을 입력해주세요.' }, { status: 400 })
    }

    if (reviewContent.length > 2000) {
      return NextResponse.json({ error: '리뷰 내용은 최대 2000자까지 입력할 수 있습니다.' }, { status: 400 })
    }

    const verificationNote = contactInfo
      ? `Submitted via public request form. Contact: ${contactInfo}`
      : 'Submitted via public request form.'

    await prisma.review.create({
      data: {
        platform: 'Re:cord',
        business: serviceName,
        content: reviewContent,
        author: customerName,
        reviewDate: new Date(),
        userId: user.id,
        isPublic: false,
        isVerified: false,
        verificationStatus: 'pending',
        verificationNote,
        verifiedBy: 'request'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Public review submit error:', error)
    return NextResponse.json({ error: '리뷰 저장 중 문제가 발생했습니다.' }, { status: 500 })
  }
}
