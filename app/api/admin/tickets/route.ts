import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    const where = status === 'all' ? {} : { status }

    const tickets = await prisma.ticket.findMany({
      where,
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
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Priority 정렬 (urgent > high > normal > low)
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
    tickets.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      if (aPriority !== bPriority) return bPriority - aPriority
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Tickets fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}