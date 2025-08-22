import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import prisma from '@/lib/prisma'

// 리뷰 데이터 캐싱 (5분)
export const getCachedReviews = unstable_cache(
  async (userId: string) => {
    return await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
          }
        }
      }
    })
  },
  ['reviews'],
  {
    revalidate: 300, // 5분
    tags: ['reviews'],
  }
)

// 사용자 프로필 캐싱 (10분)
export const getCachedUserProfile = unstable_cache(
  async (username: string) => {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        profileBio: true,
        profileImage: true,
        profileTheme: true,
        profileBackground: true,
        showContact: true,
        contactEmail: true,
        contactPhone: true,
        socialInstagram: true,
        socialNaver: true,
        createdAt: true,
        profileViews: true,
        _count: {
          select: {
            reviews: true,
          }
        }
      }
    })
  },
  ['user-profile'],
  {
    revalidate: 600, // 10분
    tags: ['user-profile'],
  }
)

// 통계 데이터 캐싱 (30분)
export const getCachedStats = unstable_cache(
  async (userId: string) => {
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: {
        rating: true,
        platform: true,
        createdAt: true,
      }
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    const platformDistribution = reviews.reduce((acc, review) => {
      acc[review.platform] = (acc[review.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const now = new Date()
    const thisMonth = reviews.filter(r => {
      const reviewDate = new Date(r.createdAt)
      return reviewDate.getMonth() === now.getMonth() &&
             reviewDate.getFullYear() === now.getFullYear()
    }).length

    const thisWeek = reviews.filter(r => {
      const reviewDate = new Date(r.createdAt)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return reviewDate >= weekAgo
    }).length

    return {
      totalReviews,
      averageRating,
      platformDistribution,
      thisMonth,
      thisWeek,
    }
  },
  ['stats'],
  {
    revalidate: 1800, // 30분
    tags: ['stats'],
  }
)

// React Cache for request deduplication
export const getUser = cache(async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      plan: true,
      planExpiresAt: true,
    }
  })
})

// 캐시 무효화 함수들
export async function revalidateReviews() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('reviews')
}

export async function revalidateUserProfile() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('user-profile')
}

export async function revalidateStats() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('stats')
}