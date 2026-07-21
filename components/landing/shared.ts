import type { PublicProfile } from '@/lib/profile'

export type LandingReview = PublicProfile['reviews'][number]

const getReviewScore = (review: LandingReview) => {
  let score = 0
  if (review.isFeatured) score += 8
  if (review.imageUrl) score += 3
  if (review.originalUrl) score += 2
  if (review.proofType === 'direct') score += 2
  if (review.verified) score += 1
  if (review.rating && review.rating >= 5) score += 1
  return score
}

const getReviewTime = (review: LandingReview) => {
  const time = new Date(review.reviewDate).getTime()
  return Number.isFinite(time) ? time : 0
}

export const sortReviewsForShowcase = (reviews: PublicProfile['reviews']) =>
  [...reviews].sort((a, b) => {
    const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
    if (featuredDiff !== 0) return featuredDiff

    const directDiff =
      Number(b.platform === 'Re:cord' || b.proofType === 'direct') -
      Number(a.platform === 'Re:cord' || a.proofType === 'direct')
    if (directDiff !== 0) return directDiff

    const timeDiff = getReviewTime(b) - getReviewTime(a)
    if (timeDiff !== 0) return timeDiff

    return getReviewScore(b) - getReviewScore(a)
  })

export const getPlatformBadgeStyle = (platform: string) => {
  switch (platform) {
    case '네이버':
      return 'bg-green-50 text-green-700'
    case '카카오':
    case '카카오맵':
      return 'bg-yellow-50 text-yellow-700'
    case '구글':
      return 'bg-blue-50 text-blue-700'
    case '인스타':
    case '인스타그램':
      return 'bg-fuchsia-50 text-fuchsia-700'
    case '당근':
      return 'bg-orange-50 text-orange-700'
    case '숨고':
      return 'bg-sky-50 text-sky-700'
    case '크몽':
      return 'bg-amber-50 text-amber-700'
    case 'Re:cord':
      return 'bg-[#FF6B35]/10 text-[#FF6B35]'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export const getReviewProofBadge = (review?: LandingReview) => {
  if (!review) return '실제 후기'
  if (review.imageUrl) return '원문 캡처'
  if (review.originalUrl) return '원문 링크'
  if (review.proofType === 'direct') return '직접 받은 후기'
  return '실제 후기'
}

export const countPlatforms = (reviews: PublicProfile['reviews']) => {
  const counts = reviews.reduce<Record<string, number>>((acc, review) => {
    acc[review.platform] = (acc[review.platform] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
}
