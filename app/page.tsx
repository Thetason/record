import { fetchPublicProfile } from '@/lib/profile'
import HomePageClient from './HomePageClient'
import type { PublicProfile } from '@/lib/profile'

// Server Component - SSR로 syb2020 프로필 데이터 미리 가져오기
export default async function HomePage() {
  // syb2020 프로필을 서버에서 미리 fetch
  const result = await fetchPublicProfile('syb2020', {
    incrementView: false,
    includeDemoFallback: true
  })

  // 실패하면 기본 프로필 사용
  const demoProfile: PublicProfile = result.ok ? result.profile : {
    id: "demo-syb2020",
    username: "syb2020",
    name: "서영빈",
    profession: "프리랜서 개발자",
    bio: "풀스택 개발자로 활동하고 있습니다.",
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

  return <HomePageClient initialProfile={demoProfile} />
}
