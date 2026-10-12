import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { recordProfileEvent } from '@/lib/profile-stats'
import { getIP, rateLimit } from '@/lib/rate-limit'
import { validateAndNormalizeUsername } from '@/lib/validators/username'

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 })

// 같은 방문자가 한 페이지에서 버튼을 연타해도 분당 몇 번만 센다.
const CLICKS_PER_MINUTE = 5

// POST /api/public/track - 공개 페이지의 상담·문의 버튼 클릭 집계 (sendBeacon)
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = JSON.parse(await req.text())
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const { username, event } = (body ?? {}) as { username?: unknown; event?: unknown }
  if (event !== 'cta' || typeof username !== 'string') {
    return new NextResponse(null, { status: 400 })
  }

  const validation = validateAndNormalizeUsername(username)
  if (!validation.ok) {
    return new NextResponse(null, { status: 400 })
  }

  try {
    await limiter.check(req, CLICKS_PER_MINUTE, `track_${getIP(req)}_${validation.value}`)
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const user = await prisma.user
    .findUnique({ where: { username: validation.value }, select: { id: true, isPublic: true } })
    .catch(() => null)

  if (user?.isPublic) {
    await recordProfileEvent(user.id, 'cta')
  }

  return new NextResponse(null, { status: 204 })
}
