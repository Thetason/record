import { prisma } from '@/lib/prisma';

export type UserPlan = 'free' | 'premium' | 'pro';

export const PLAN_LIMITS = {
  free: {
    reviews: 50,
    profileViews: true,
    customDomain: false,
    advancedStats: false,
    apiAccess: false,
    teamMembers: 0,
  },
  premium: {
    reviews: -1, // unlimited
    profileViews: true,
    customDomain: false,
    advancedStats: true,
    apiAccess: false,
    teamMembers: 0,
  },
  pro: {
    reviews: -1, // unlimited
    profileViews: true,
    customDomain: true,
    advancedStats: true,
    apiAccess: true,
    teamMembers: 5,
  },
};

export async function checkUserPlan(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiry: true,
      reviewLimit: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if plan expired
  if (user.planExpiry && new Date(user.planExpiry) < new Date()) {
    // Plan expired, revert to free
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'free',
        planExpiry: null,
        reviewLimit: PLAN_LIMITS.free.reviews,
      },
    });
    return 'free' as UserPlan;
  }

  return user.plan as UserPlan;
}

export async function canAddReview(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      reviewLimit: true,
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!user) {
    return false;
  }

  // Unlimited reviews for premium and pro users
  if (user.reviewLimit === -1) {
    return true;
  }

  // Check if user has reached the limit
  return user._count.reviews < user.reviewLimit;
}

export async function getUserReviewCount(userId: string): Promise<number> {
  const count = await prisma.review.count({
    where: { userId },
  });
  return count;
}

export async function upgradeToPlan(
  userId: string,
  plan: 'premium' | 'pro',
  period: 'monthly' | 'yearly'
) {
  const expiryDate = new Date();
  if (period === 'monthly') {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  const reviewLimit = PLAN_LIMITS[plan].reviews;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      planExpiry: expiryDate,
      reviewLimit,
    },
  });

  return { plan, expiryDate, reviewLimit };
}

export async function cancelSubscription(userId: string) {
  // Mark the subscription for cancellation at the end of the period
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planExpiry: true },
  });

  if (!user || !user.planExpiry) {
    throw new Error('No active subscription found');
  }

  // The subscription will automatically revert to free when planExpiry is reached
  // For now, we just return the expiry date
  return { cancelAt: user.planExpiry };
}