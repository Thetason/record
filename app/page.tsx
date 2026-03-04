// Force dynamic rendering to avoid ISR size limits
export const dynamic = 'force-dynamic'

import HomePageClient from './HomePageClient'
import type { PublicProfile, PublicReview } from '@/lib/profile'

const LANDING_FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: 'fallback-1',
    platform: '네이버',
    business: '시선뮤직',
    content: '체계적인 발성 코칭 덕분에 짧은 기간에도 확실한 변화를 느꼈습니다.',
    author: '익명',
    reviewDate: '2025-02-10',
    verified: true,
    verifiedAt: null,
    verifiedBy: 'manual',
    originalUrl: null
  },
  {
    id: 'fallback-2',
    platform: 'Re:cord',
    business: '1:1 보컬 트레이닝',
    content: '수업 후 피드백이 명확해서 집에서 연습할 때도 방향이 분명해졌어요.',
    author: '유남생',
    reviewDate: '2025-02-08',
    verified: true,
    verifiedAt: null,
    verifiedBy: 'request',
    originalUrl: null
  },
  {
    id: 'fallback-3',
    platform: '당근',
    business: '시선뮤직',
    content: '초보자도 이해하기 쉽게 설명해주셔서 자신감이 많이 생겼습니다.',
    author: '다니엘권',
    reviewDate: '2025-02-06',
    verified: true,
    verifiedAt: null,
    verifiedBy: 'manual',
    originalUrl: null
  }
]

const createLandingFallbackProfile = (): PublicProfile => ({
  id: "demo-syb2020",
  username: "syb2020",
  name: "세타쓴",
  profession: "보컬트레이닝 전문가 · 9년차",
  bio: "음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다.",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=320&h=320&q=80",
  coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80",
  totalReviews: LANDING_FALLBACK_REVIEWS.length,
  platforms: Array.from(new Set(LANDING_FALLBACK_REVIEWS.map((review) => review.platform))),
  experience: "3년차",
  location: "서울 한국",
  specialties: [],
  certifications: [],
  socialLinks: {},
  theme: "modern",
  layout: "premium",
  bgImage: null,
  bgColor: "#0f172a",
  accentColor: "#FF6B35",
  introVideo: null,
  customCss: null,
  reviews: LANDING_FALLBACK_REVIEWS
})

// Client Component - 데이터베이스 연결 에러 방지
export default async function HomePage() {
  // syb2020의 실제 공개 프로필 데이터를 fetch
  let demoProfile: PublicProfile
  
  try {
    const { fetchPublicProfile } = await import('@/lib/profile')
    const result = await fetchPublicProfile('syb2020', { 
      incrementView: false,
      includeDemoFallback: true 
    })
    
    if (result.ok && result.profile?.reviews?.length > 0) {
      demoProfile = result.profile
    } else {
      throw new Error('Profile not found')
    }
  } catch (error) {
    console.error('Failed to fetch demo profile, using fallback:', error)
    demoProfile = createLandingFallbackProfile()
  }

  return <HomePageClient initialProfile={demoProfile} />
}
