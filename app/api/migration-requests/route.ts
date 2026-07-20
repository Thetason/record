import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { buildMigrationRequestDescription } from '@/lib/migration-request'
import { prisma } from '@/lib/prisma'
import { apiLimits, getIP, rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
})

const schema = z.object({
  name: z.string().min(2).max(40),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal('')),
  audience: z.string().min(1).max(40),
  platforms: z.array(z.string().min(1).max(30)).min(1).max(5),
  reviewCount: z.string().max(20).optional().or(z.literal('')),
  preferredMethod: z.string().min(1).max(30),
  preferredContact: z.string().max(30).optional().or(z.literal('')),
  urgency: z.string().max(30).optional().or(z.literal('')),
  materials: z.array(z.string().min(1).max(30)).max(5).optional(),
  currentProfileUrl: z.string().max(300).optional().or(z.literal('')),
  message: z.string().min(10).max(2000),
  source: z.string().max(30).optional().or(z.literal(''))
})

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req)

    try {
      await limiter.check(req, apiLimits.write, `migration_request_${ip}`)
    } catch {
      return rateLimitResponse()
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값을 다시 확인해주세요.' },
        { status: 400 }
      )
    }

    const data = parsed.data
    const urgentNeed = data.urgency === 'today' || data.urgency === 'this_week'
    const subject = `[리뷰 이관 요청] ${data.audience} · ${data.name}${urgentNeed ? ' · 긴급' : ''}`
    const description = buildMigrationRequestDescription(data)

    const ticket = await prisma.ticket.create({
      data: {
        userEmail: data.email,
        userName: data.name,
        category: 'migration_request',
        priority: urgentNeed ? 'urgent' : 'high',
        subject,
        description
      }
    })

    const admins = await prisma.user.findMany({
      where: {
        OR: [{ role: 'admin' }, { role: 'super_admin' }]
      },
      select: { id: true }
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'in_app',
          category: 'new_ticket',
          title: '새 리뷰 이관 요청',
          content: `${data.name}님이 ${data.audience} 리뷰 이관 세팅을 요청했습니다.`
        }))
      })
    }

    await prisma.activityLog.create({
      data: {
        action: 'migration_request_create',
        category: 'support',
        userEmail: data.email,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') || undefined,
        details: {
          ticketId: ticket.id,
          audience: data.audience,
          platforms: data.platforms,
          preferredMethod: data.preferredMethod,
          preferredContact: data.preferredContact || null,
          urgency: data.urgency || null,
          materials: data.materials || [],
          source: data.source || 'direct'
        }
      }
    })

    return NextResponse.json({
      success: true,
      ticketId: ticket.id
    })
  } catch (error) {
    console.error('Migration request create error:', error)
    return NextResponse.json(
      { error: '요청을 접수하지 못했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
