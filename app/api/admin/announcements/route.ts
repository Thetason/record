import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Announcements fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, type, target, isPinned, startDate, endDate } = body

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'info',
        target: target || 'all',
        isPinned: isPinned || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: admin.id
      }
    })

    // 활동 로그
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userEmail: session.user.email,
        action: 'announcement_create',
        category: 'admin',
        details: { announcementId: announcement.id, title }
      }
    })

    // 모든 사용자에게 알림 생성 (대상에 따라)
    let userWhere: any = {}
    if (target !== 'all') {
      userWhere.plan = target
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true }
    })

    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        type: 'in_app',
        category: 'announcement',
        title: '새로운 공지사항',
        content: title
      }))
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Announcement create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}