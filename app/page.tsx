// Force dynamic rendering to avoid ISR size limits
export const dynamic = 'force-dynamic'

import HomePageClient from './HomePageClient'
import type { PublicProfile, PublicReview } from '@/lib/profile'
import { fetchLivePublicProfile } from '@/lib/live-public-profile'
import { getLaunchOfferSnapshot } from '@/lib/launch-offer'

const LANDING_FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: 'fallback-1',
    platform: '네이버',
    business: '서울숲 헤어',
    content: '상담부터 커트까지 너무 세심했고, 원하는 무드로 딱 잡아주셔서 다음에도 꼭 다시 예약하고 싶어요.',
    author: '단골고객',
    rating: 5,
    reviewDate: '2025-02-18',
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: 'manual',
    originalUrl: null,
    proofType: 'archived',
    imageUrl: '/demo/reviews/naver-layered-cut.svg'
  },
  {
    id: 'fallback-2',
    platform: 'Re:cord',
    business: '레이어드컷 · 컬러 상담',
    content: '샵을 옮기신 뒤에도 바로 따라갔어요. 제 얼굴형에 맞게 컷을 잡아주고 손질법까지 알려주셔서 믿고 맡깁니다.',
    author: '민지',
    rating: 5,
    reviewDate: '2025-02-15',
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: 'request',
    originalUrl: null,
    proofType: 'direct',
    imageUrl: '/demo/reviews/record-direct-review.svg'
  },
  {
    id: 'fallback-3',
    platform: '당근',
    business: '1인샵 오픈 준비',
    content: '이전 샵에서 받던 후기까지 한 번에 정리돼서 새로 오픈한 뒤에도 신뢰를 보여주기 좋았습니다.',
    author: '성수동고객',
    rating: 5,
    reviewDate: '2025-02-11',
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: 'manual',
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: 'fallback-4',
    platform: '네이버',
    business: '톤다운 컬러 전문',
    content: '붉은 기 없이 차분하게 색을 잡아줘서 만족도가 높았어요. 다음 컬러도 여기서 할 생각입니다.',
    author: '컬러단골',
    rating: 5,
    reviewDate: '2025-01-29',
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: 'manual',
    originalUrl: null,
    proofType: 'archived',
    imageUrl: '/demo/reviews/naver-tone-down-color.svg'
  }
]

const VOCAL_FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: "fallback-vocal-1",
    platform: "Re:cord",
    business: "1:1 보컬 트레이닝",
    content: "축가 준비를 위해 시작했는데, 발성부터 호흡까지 제가 어려워하던 지점을 정확하게 잡아주셔서 짧은 기간에도 확실한 변화를 느꼈어요.",
    author: "축가준비생",
    rating: 5,
    reviewDate: "2025-03-18",
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: "request",
    originalUrl: null,
    proofType: "direct"
  },
  {
    id: "fallback-vocal-2",
    platform: "Re:cord",
    business: "1:1 보컬 컨설팅",
    content: "설명 방식이 추상적이지 않고 바로 몸으로 적용해볼 수 있게 도와줘서, 레슨이 끝난 뒤에도 혼자 연습할 방향이 분명해졌습니다.",
    author: "직접후기",
    rating: 5,
    reviewDate: "2025-03-12",
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: "request",
    originalUrl: null,
    proofType: "direct"
  },
  {
    id: "fallback-vocal-3",
    platform: "네이버",
    business: "클라우딘뮤직",
    content: "초보자도 이해할 수 있게 설명해주시고, 칭찬과 피드백을 균형 있게 주셔서 자신감이 많이 생겼습니다.",
    author: "수강생",
    rating: 5,
    reviewDate: "2025-03-05",
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: "manual",
    originalUrl: null,
    proofType: "archived"
  },
  {
    id: "fallback-vocal-4",
    platform: "당근",
    business: "무료 보컬 컨설팅",
    content: "짧은 상담이었는데도 지금 무엇을 연습해야 하는지 명확해졌고, 기회가 되면 바로 정식 레슨을 받고 싶다는 생각이 들었습니다.",
    author: "동네고객",
    rating: 5,
    reviewDate: "2025-02-25",
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: "manual",
    originalUrl: null,
    proofType: "archived"
  }
]

const PILATES_FALLBACK_REVIEWS: PublicReview[] = [
  {
    id: "fallback-pilates-1",
    platform: "네이버",
    business: "리브필라테스",
    content: "첫 상담에서 몸 상태를 세심하게 봐주시고, 수업 뒤 집에서 따라 할 루틴까지 정리해주셔서 꾸준히 다니게 됐어요.",
    author: "직장인회원",
    rating: 5,
    reviewDate: "2025-03-20",
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: "manual",
    originalUrl: null,
    proofType: "archived"
  },
  {
    id: "fallback-pilates-2",
    platform: "Re:cord",
    business: "1:1 체형 교정 레슨",
    content: "제 자세 습관을 정확히 짚어주시고 왜 아픈지 쉽게 설명해주셔서, 운동이 무섭지 않고 오히려 기대되기 시작했습니다.",
    author: "회원 A",
    rating: 5,
    reviewDate: "2025-03-15",
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: "request",
    originalUrl: null,
    proofType: "direct"
  },
  {
    id: "fallback-pilates-3",
    platform: "카카오맵",
    business: "체형교정 전문",
    content: "수업 때마다 목표가 명확하고, 작은 변화도 계속 체크해주셔서 운동 초보인 저도 믿고 따라갈 수 있었어요.",
    author: "초보회원",
    rating: 5,
    reviewDate: "2025-03-08",
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: "manual",
    originalUrl: null,
    proofType: "archived"
  },
  {
    id: "fallback-pilates-4",
    platform: "인스타",
    business: "프라이빗 필라테스",
    content: "운동 전후 사진과 후기들을 한 번에 보니 상담 전에 훨씬 안심이 됐고, 바로 체험을 신청하게 됐습니다.",
    author: "인스타문의",
    rating: 5,
    reviewDate: "2025-02-27",
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: "manual",
    originalUrl: null,
    proofType: "archived"
  }
]

type LandingFallbackProfileConfig = Omit<PublicProfile, "totalReviews" | "platforms" | "reviews"> & {
  reviews: PublicReview[]
}

const createLandingFallbackProfile = (config: LandingFallbackProfileConfig): PublicProfile => ({
  ...config,
  totalReviews: config.reviews.length,
  platforms: Array.from(new Set(config.reviews.map((review) => review.platform))),
  reviews: config.reviews
})

const createHairFallbackProfile = (): PublicProfile =>
  createLandingFallbackProfile({
    id: "demo-stylist-demo",
    username: "stylist-demo",
    name: "서윤",
    isPublic: true,
    profession: "헤어디자이너 · 9년차",
    bio: "샵을 옮겨도 고객이 다시 찾는 디자이너. 레이어드컷과 자연스러운 컬러 상담에 강합니다.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=320&h=320&q=80",
    coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80",
    experience: "9년차",
    location: "서울 성수",
    careerTimeline: [
      { period: "2017 - 2020", title: "살롱 커리어 시작", detail: "기본 커트와 상담 경험을 쌓으며 단골 고객이 붙기 시작한 시기입니다." },
      { period: "2020 - 2023", title: "컬러와 레이어드 집중", detail: "톤다운 컬러와 손질 쉬운 레이어드컷으로 소개 예약이 늘어난 시기입니다." },
      { period: "2023 - NOW", title: "샵 이동 후 고객 유지", detail: "샵이 바뀌어도 기존 고객이 계속 찾아오는 신뢰 기반을 만든 흐름입니다." },
    ],
    specialties: ["레이어드컷", "톤다운 컬러", "손질 쉬운 커트", "얼굴형 맞춤 상담"],
    certifications: ["9년차 현장 경력", "기존 고객 재방문 후기 보유", "직접 받은 후기 검토 완료"],
    phone: "010-3482-7091",
    portfolioImages: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523264766116-1e09b3145b84?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
    ],
    socialLinks: {
      website: ""
    },
    theme: "dark",
    layout: "card",
    bgImage: null,
    bgColor: "#0f172a",
    accentColor: "#FF6B35",
    introVideo: null,
    customCss: null,
    reviews: LANDING_FALLBACK_REVIEWS
  })

const createVocalFallbackProfile = (): PublicProfile =>
  createLandingFallbackProfile({
    id: "demo-syb2020",
    username: "syb2020",
    name: "세타쓴",
    isPublic: true,
    profession: "보컬트레이너 · 10년차",
    bio: "발성 교정부터 오디션 준비까지, 상담 전에 바로 신뢰를 줄 수 있는 레슨 프로필을 운영합니다.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=320&h=320&q=80",
    coverImage: "/sample.png",
    experience: "10년차",
    location: "서울 한국",
    careerTimeline: [
      { period: "2016 - 2018", title: "Foundation", detail: "발성과 기본기 지도 경험을 쌓으며 레슨의 방향성을 다진 시기입니다." },
      { period: "2018 - 2021", title: "Science of Voice", detail: "호흡, 공명, 발음 교정을 더 체계적으로 설명하고 지도하는 방식이 자리 잡았습니다." },
      { period: "2021 - NOW", title: "Practical Coaching", detail: "1:1 맞춤 피드백과 직접 받은 후기들이 쌓이며 신뢰 포트폴리오가 만들어진 단계입니다." },
    ],
    specialties: ["발성 교정", "1:1 맞춤 레슨", "오디션 준비", "축가 레슨"],
    certifications: ["10년차 현장 경력", "실제 운영 중인 공개 프로필", "직접 받은 후기 검토 완료"],
    phone: "010-2020-2020",
    portfolioImages: [
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80"
    ],
    socialLinks: {
      website: "https://thetasom.com"
    },
    plan: "pro",
    theme: "default",
    layout: "grid",
    bgImage: null,
    bgColor: "#ffffff",
    accentColor: "#FF6B35",
    introVideo: null,
    customCss: null,
    reviews: VOCAL_FALLBACK_REVIEWS
  })

const createPilatesFallbackProfile = (): PublicProfile =>
  createLandingFallbackProfile({
    id: "demo-pilates-demo",
    username: "pilates-demo",
    name: "윤서",
    isPublic: true,
    profession: "필라테스 강사 · 7년차",
    bio: "체형 교정과 프라이빗 레슨에 강한 필라테스 강사. 첫 상담 전에 후기와 수업 분위기를 바로 보여줄 수 있습니다.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=320&h=320&q=80",
    coverImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
    experience: "7년차",
    location: "서울 잠실",
    careerTimeline: [
      { period: "2019 - 2021", title: "기초 체형 교정 집중", detail: "체형 교정과 호흡 지도 중심으로 기본 레슨 경험을 쌓은 시기입니다." },
      { period: "2021 - 2024", title: "프라이빗 레슨 확장", detail: "개인 맞춤 수업과 재등록 중심 레슨 운영이 자리 잡았습니다." },
      { period: "2024 - NOW", title: "브랜드 수업 운영", detail: "상담 전 링크 하나로 수업 분위기와 후기, 경력을 함께 보여주는 단계입니다." },
    ],
    specialties: ["체형 교정", "프라이빗 레슨", "호흡 코칭", "산전·산후 기초 운동"],
    certifications: ["7년차 현장 경력", "직접 받은 후기 검토 완료"],
    phone: "010-5174-2205",
    portfolioImages: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80"
    ],
    socialLinks: {
      website: ""
    },
    theme: "default",
    layout: "grid",
    bgImage: null,
    bgColor: "#ffffff",
    accentColor: "#FF6B35",
    introVideo: null,
    customCss: null,
    reviews: PILATES_FALLBACK_REVIEWS
  })

const LANDING_DEMO_USERNAME = "stylist-demo"
const VOCAL_DEMO_USERNAME = "syb2020"

async function loadLandingProfile(
  username: string,
  fallbackFactory: () => PublicProfile,
  options?: {
    preferLiveRemote?: boolean
  }
): Promise<PublicProfile> {
  if (options?.preferLiveRemote) {
    const liveProfile = await fetchLivePublicProfile(username, {
      fallbackProfile: fallbackFactory()
    })

    if (liveProfile?.reviews?.length) {
      return liveProfile
    }
  }

  try {
    const { fetchPublicProfile } = await import("@/lib/profile")
    const result = await fetchPublicProfile(username, {
      incrementView: false,
      includeDemoFallback: false
    })

    if (result.ok && result.profile?.reviews?.length > 0) {
      return result.profile
    }
  } catch (error) {
    console.error(`Failed to fetch landing profile for ${username}, using fallback:`, error)
  }

  return fallbackFactory()
}

// Client Component - 데이터베이스 연결 에러 방지
export default async function HomePage() {
  const [vocalProfile, hairProfile, launchOffer] = await Promise.all([
    loadLandingProfile(VOCAL_DEMO_USERNAME, createVocalFallbackProfile, {
      preferLiveRemote: true
    }),
    loadLandingProfile(LANDING_DEMO_USERNAME, createHairFallbackProfile),
    getLaunchOfferSnapshot(),
  ])

  const showcaseProfiles = {
    vocal: vocalProfile,
    hair: hairProfile,
    pilates: createPilatesFallbackProfile()
  }

  return <HomePageClient showcaseProfiles={showcaseProfiles} launchOffer={launchOffer} />
}
