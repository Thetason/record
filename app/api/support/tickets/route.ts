import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { category, subject, description, priority } = body

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        userEmail: session.user.email,
        userName: user.name || user.username,
        category,
        subject,
        description,
        priority: priority || 'normal'
      }
    })

    // 관리자에게 알림 생성
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { role: 'super_admin' }
        ]
      },
      select: { id: true }
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'in_app',
          category: 'new_ticket',
          title: `새로운 ${priority === 'urgent' ? '긴급 ' : ''}티켓`,
          content: `${user.username}님이 문의를 남겼습니다: ${subject}`
        }))
      })
    }

    // 활동 로그
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userEmail: session.user.email,
        action: 'ticket_create',
        category: 'support',
        details: { ticketId: ticket.id, category, priority }
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Ticket create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}