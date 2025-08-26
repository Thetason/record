import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, username: true, name: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // 메시지 생성
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        authorId: admin.id,
        authorName: admin.name || admin.username,
        authorRole: 'admin',
        content
      }
    })

    // 티켓 상태를 'in_progress'로 자동 변경 (open인 경우)
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      select: { status: true, userId: true }
    })

    if (ticket?.status === 'open') {
      await prisma.ticket.update({
        where: { id: params.id },
        data: { status: 'in_progress' }
      })
    }

    // 사용자에게 알림 생성
    if (ticket?.userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'in_app',
          category: 'ticket_reply',
          title: '고객 지원 답변',
          content: `문의하신 내용에 대한 답변이 도착했습니다.`
        }
      })
    }

    // 활동 로그
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userEmail: session.user.email,
        action: 'ticket_reply',
        category: 'admin',
        details: { ticketId: params.id }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}