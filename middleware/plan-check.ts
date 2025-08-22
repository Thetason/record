import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAddReview, hasFeature } from '@/lib/plan-limits'

export async function checkPlanLimits(
  userId: string,
  action: 'add_review' | 'custom_theme' | 'export_data' | 'custom_css'
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planExpiry: true,
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!user) {
      return { allowed: false, reason: '사용자를 찾을 수 없습니다' }
    }

    // 플랜 만료 체크
    if (user.planExpiry && new Date(user.planExpiry) < new Date()) {
      // 플랜 만료 시 free로 다운그레이드
      await prisma.user.update({
        where: { id: userId },
        data: { 
          plan: 'free',
          planExpiry: null
        }
      })
      user.plan = 'free'
    }

    const plan = user.plan as 'free' | 'premium' | 'pro'

    switch (action) {
      case 'add_review':
        const canAdd = canAddReview(user._count.reviews, plan)
        if (!canAdd) {
          return {
            allowed: false,
            reason: `무료 플랜은 리뷰 50개까지만 등록 가능합니다. 프리미엄으로 업그레이드하세요.`,
            upgradeRequired: true
          }
        }
        break

      case 'custom_theme':
        if (!hasFeature(plan, 'customTheme')) {
          return {
            allowed: false,
            reason: '커스텀 테마는 프리미엄 이상 플랜에서 사용 가능합니다.',
            upgradeRequired: true
          }
        }
        break

      case 'export_data':
        if (!hasFeature(plan, 'exportData')) {
          return {
            allowed: false,
            reason: '데이터 내보내기는 프리미엄 이상 플랜에서 사용 가능합니다.',
            upgradeRequired: true
          }
        }
        break

      case 'custom_css':
        if (!hasFeature(plan, 'customCss')) {
          return {
            allowed: false,
            reason: '커스텀 CSS는 프로 플랜에서만 사용 가능합니다.',
            upgradeRequired: true
          }
        }
        break
    }

    return { allowed: true }
  } catch (error) {
    console.error('Plan check error:', error)
    return { allowed: false, reason: '플랜 확인 중 오류가 발생했습니다' }
  }
}