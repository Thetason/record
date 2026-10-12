import { prisma } from '@/lib/prisma'

// 공개 페이지 조회·상담 클릭 일별 집계.
// 통계는 부가 기능이라 실패해도 페이지나 대시보드를 깨뜨리지 않는다
// (예: profile_daily_stats 마이그레이션 전에 배포된 경우).

export type ProfileEvent = 'view' | 'cta'

const DAY_MS = 24 * 60 * 60 * 1000
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

export function kstDay(date: Date = new Date()) {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10)
}

export async function recordProfileEvent(userId: string, event: ProfileEvent) {
  const day = kstDay()
  const field = event === 'view' ? 'views' : 'ctaClicks'

  try {
    await prisma.profileDailyStat.upsert({
      where: { userId_day: { userId, day } },
      create: { userId, day, [field]: 1 },
      update: { [field]: { increment: 1 } },
    })
  } catch (error) {
    console.warn('Profile stat write failed', { userId, event, error })
  }
}

export type ProfileStatsSummary = {
  last7: { views: number; ctaClicks: number }
  last30: { views: number; ctaClicks: number }
  daily: Array<{ day: string; views: number; ctaClicks: number }>
}

export async function getProfileStats(userId: string, now: Date = new Date()): Promise<ProfileStatsSummary> {
  const days = Array.from({ length: 30 }, (_, i) => kstDay(new Date(now.getTime() - (29 - i) * DAY_MS)))
  const empty = { views: 0, ctaClicks: 0 }

  let rows: Array<{ day: string; views: number; ctaClicks: number }> = []
  try {
    rows = await prisma.profileDailyStat.findMany({
      where: { userId, day: { gte: days[0] } },
      select: { day: true, views: true, ctaClicks: true },
    })
  } catch (error) {
    console.warn('Profile stat read failed', { userId, error })
  }

  const byDay = new Map(rows.map((row) => [row.day, row]))
  const daily = days.map((day) => ({ day, ...empty, ...pick(byDay.get(day)) }))
  const sum = (list: typeof daily) =>
    list.reduce((acc, d) => ({ views: acc.views + d.views, ctaClicks: acc.ctaClicks + d.ctaClicks }), { ...empty })

  return {
    last7: sum(daily.slice(-7)),
    last30: sum(daily),
    daily: daily.slice(-14),
  }
}

function pick(row?: { views: number; ctaClicks: number }) {
  return row ? { views: row.views, ctaClicks: row.ctaClicks } : {}
}
