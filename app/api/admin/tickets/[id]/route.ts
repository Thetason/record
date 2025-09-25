import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            username: true,
            email: true,
            plan: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Ticket fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
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
      select: { id: true, role: true, username: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status, priority, assignedTo } = body as {
      status?: string
      priority?: string
      assignedTo?: string | null
    }

    const updateData: Prisma.TicketUpdateInput = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo
    }

    // 해결됨으로 변경시 resolvedBy, resolvedAt 설정
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedBy = admin.id
      updateData.resolvedAt = new Date()
    }

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    // 시스템 메시지 추가
    if (status) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: params.id,
          authorName: '시스템',
          authorRole: 'system',
          content: `티켓 상태가 '${status}'로 변경되었습니다.`
        }
      })
    }

    // 활동 로그
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userEmail: session.user.email,
        action: `ticket_status_change`,
        category: 'admin',
        details: { ticketId: params.id, newStatus: status }
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Ticket update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
