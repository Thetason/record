import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plan-limits'
import {
  LAUNCH_OCR_IMPORT_LIMIT,
  LAUNCH_OFFER_MAX_USERS,
  LAUNCH_OFFER_START_AT_FALLBACK,
  LAUNCH_OFFER_TRIAL_MONTHS,
  type LaunchOfferSnapshot,
} from '@/lib/launch-offer-config'

export const LAUNCH_OFFER_START_AT = new Date(
  process.env.LAUNCH_OFFER_START_AT ?? LAUNCH_OFFER_START_AT_FALLBACK
)

type CountCapableDb = {
  user: {
    count: (args: {
      where: {
        role: string
        launchOfferClaimedAt: { not: null }
      }
    }) => Promise<number>
  }
}

export function getLaunchOfferExpiryDate(base = new Date()) {
  const expiry = new Date(base)
  expiry.setMonth(expiry.getMonth() + LAUNCH_OFFER_TRIAL_MONTHS)
  return expiry
}

export async function getLaunchOfferSnapshot(db: CountCapableDb = prisma): Promise<LaunchOfferSnapshot> {
  // Fail-safe: a broken promo counter must never take down pages that render it
  let claimed = 0
  try {
    claimed = await db.user.count({
      where: {
        role: 'user',
        launchOfferClaimedAt: { not: null },
      },
    })
  } catch (error) {
    console.error('getLaunchOfferSnapshot failed, using fallback snapshot:', error)
  }

  const remaining = Math.max(0, LAUNCH_OFFER_MAX_USERS - claimed)

  return {
    active: remaining > 0,
    claimed,
    remaining,
    maxUsers: LAUNCH_OFFER_MAX_USERS,
    trialMonths: LAUNCH_OFFER_TRIAL_MONTHS,
    ocrImportLimit: LAUNCH_OCR_IMPORT_LIMIT,
    startAt: LAUNCH_OFFER_START_AT.toISOString(),
  }
}

export async function getLaunchOfferCreateData(db: CountCapableDb = prisma) {
  const snapshot = await getLaunchOfferSnapshot(db)

  if (!snapshot.active) {
    return {
      launchOfferGranted: false,
      createData: {
        plan: 'free' as const,
        reviewLimit: PLANS.free.reviewLimit,
        planExpiry: null,
        launchOfferClaimedAt: null,
      },
    }
  }

  const now = new Date()
  return {
    launchOfferGranted: true,
    createData: {
      plan: 'premium' as const,
      reviewLimit: PLANS.premium.reviewLimit,
      planExpiry: getLaunchOfferExpiryDate(now),
      launchOfferClaimedAt: now,
    },
  }
}
