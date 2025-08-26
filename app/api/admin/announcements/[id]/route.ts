import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      select: { id: true, role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: body
    })

    // 활동 로그
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userEmail: session.user.email,
        action: 'announcement_update',
        category: 'admin',
        details: { announcementId: params.id, changes: body }
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Announcement update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
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
      select: { id: true, role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.announcement.delete({
      where: { id: params.id }
    })

    // 활동 로그
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userEmail: session.user.email,
        action: 'announcement_delete',
        category: 'admin',
        details: { announcementId: params.id }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Announcement delete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}