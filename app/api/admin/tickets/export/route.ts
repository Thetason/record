import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { parseMigrationRequestDescription } from '@/lib/migration-request'
import { prisma } from '@/lib/prisma'

function toCsvCell(value: string | null | undefined) {
  const normalized = (value ?? '').replace(/\r?\n/g, ' ').trim()
  return `"${normalized.replace(/"/g, '""')}"`
}

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
    const category = searchParams.get('category') || 'migration_request'

    const where = {
      ...(status === 'all' ? {} : { status }),
      ...(category === 'all' ? {} : { category })
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    const rows = [
      [
        'ticket_id',
        'created_at',
        'status',
        'priority',
        'category',
        'name',
        'email',
        'phone',
        'audience',
        'platforms',
        'review_count',
        'preferred_method',
        'preferred_contact',
        'urgency',
        'materials',
        'current_profile_url',
        'source',
        'subject',
        'message',
        'reply_count'
      ].join(',')
    ]

    for (const ticket of tickets) {
      const parsed = ticket.category === 'migration_request'
        ? parseMigrationRequestDescription(ticket.description)
        : null
      const summary = parsed?.summary || {}

      rows.push([
        toCsvCell(ticket.id),
        toCsvCell(ticket.createdAt.toISOString()),
        toCsvCell(ticket.status),
        toCsvCell(ticket.priority),
        toCsvCell(ticket.category),
        toCsvCell(summary.name || ticket.userName || ''),
        toCsvCell(summary.email || ticket.userEmail || ''),
        toCsvCell(summary.phone || ''),
        toCsvCell(summary.audience || ''),
        toCsvCell(summary.platforms || ''),
        toCsvCell(summary.reviewCount || ''),
        toCsvCell(summary.preferredMethod || ''),
        toCsvCell(summary.preferredContact || ''),
        toCsvCell(summary.urgency || ''),
        toCsvCell(summary.materials || ''),
        toCsvCell(summary.currentProfileUrl || ''),
        toCsvCell(summary.source || ''),
        toCsvCell(ticket.subject),
        toCsvCell(parsed?.message || ticket.description),
        toCsvCell(String(ticket.messages.length))
      ].join(','))
    }

    const csv = `\uFEFF${rows.join('\n')}`
    const filename = `record-tickets-${category}-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Ticket export error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
