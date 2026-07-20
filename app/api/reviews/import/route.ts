import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRemainingReviews, type PlanType } from '@/lib/plan-limits'

// Batch-save reviews the owner confirmed after multi-image extraction.
// Saved into the private vault (not public) — the owner chooses what to
// publish afterwards, same as single OCR imports.
const importSchema = z.object({
  reviews: z
    .array(
      z.object({
        platform: z.string().min(1).max(40),
        business: z.string().max(120).optional().default(''),
        author: z.string().max(80).optional().default(''),
        rating: z.number().int().min(1).max(5).nullable().optional(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable()
          .optional(),
        content: z.string().min(4).max(2000),
      })
    )
    .min(1)
    .max(100),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const parsed = importSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '리뷰 데이터 형식이 올바르지 않습니다.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })
    const plan = (user?.plan || 'free') as PlanType
    const currentCount = await prisma.review.count({ where: { userId: session.user.id } })
    const remaining = getRemainingReviews(currentCount, plan)

    let toSave = parsed.data.reviews
    let truncated = false
    if (remaining !== 'unlimited') {
      if (remaining <= 0) {
        return NextResponse.json(
          { error: '현재 플랜의 리뷰 등록 한도를 모두 사용했습니다. 업그레이드 후 다시 시도해주세요.' },
          { status: 403 }
        )
      }
      if (toSave.length > remaining) {
        toSave = toSave.slice(0, remaining)
        truncated = true
      }
    }

    const result = await prisma.review.createMany({
      data: toSave.map((r) => ({
        platform: r.platform,
        business: r.business || '가져온 리뷰',
        content: r.content,
        author: r.author || '익명',
        rating: r.rating ?? null,
        reviewDate: r.date ? new Date(`${r.date}T00:00:00`) : new Date(),
        verifiedBy: 'owner_import',
        isVerified: false,
        verificationStatus: 'approved',
        verificationNote: 'Imported via multi-image capture into the private vault.',
        isPublic: false,
        userId: session.user.id,
      })),
    })

    return NextResponse.json({
      success: true,
      saved: result.count,
      truncated,
      remaining: remaining === 'unlimited' ? 'unlimited' : Math.max(0, remaining - result.count),
    })
  } catch (error) {
    console.error('review import failed:', error)
    return NextResponse.json({ error: '리뷰 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
