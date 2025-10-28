// Force dynamic rendering to avoid ISR size limits
export const dynamic = 'force-dynamic'

import HomePageClient from './HomePageClient'
import type { PublicProfile } from '@/lib/profile'

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
    
    if (result.ok && result.profile) {
      demoProfile = result.profile
    } else {
      throw new Error('Profile not found')
    }
  } catch (error) {
    console.error('Failed to fetch demo profile, using fallback:', error)
    // fallback to basic profile
    demoProfile = {
      id: "demo-syb2020",
      username: "syb2020",
      name: "세타쓴",
      profession: "보컬트레이닝 전문가 · 9년차",
      bio: "음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=320&h=320&q=80",
      coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80",
      totalReviews: 0,
      platforms: [],
      experience: "",
      location: "",
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
      reviews: []
    }
  }

  return <HomePageClient initialProfile={demoProfile} />
}
