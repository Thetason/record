import { PrismaClient } from './prisma-client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const demoPassword = 'Syb20201234!'

type DemoReview = {
  businessName: string
  platform: string
  rating: number
  content: string
  reviewerName: string
  reviewDate: Date
  isFeatured?: boolean
  originalUrl?: string | null
  imageUrl?: string | null
}

type DemoProfile = {
  username: string
  email: string
  name: string
  profession: string
  experience: string
  bio: string
  location: string
  website: string
  phone?: string
  avatar: string
  bgImage?: string | null
  introVideo?: string | null
  theme: string
  layout: string
  bgColor: string
  accentColor: string
  portfolioImages?: string[]
  careerTimeline?: Array<{
    period: string
    title: string
    detail: string
  }>
  professionLabel: string
  directReviewLabel: string
  reviews: DemoReview[]
}

const demoProfiles: DemoProfile[] = [
  {
    username: 'syb2020',
    email: 'vocal202065@gmail.com',
    name: '세타쓴',
    profession: '보컬트레이너',
    experience: '10년차',
    bio: '음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다. 9년차 전문 보컬 트레이너입니다.',
    location: '서울 강남구',
    website: 'https://www.recordyours.com/syb2020/review-request',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=320&h=320&q=80',
    theme: 'dark',
    layout: 'card',
    bgColor: '#0f172a',
    accentColor: '#FF6B35',
    portfolioImages: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80'
    ],
    careerTimeline: [
      {
        period: '2016 - 2018',
        title: 'Foundation',
        detail: '발성과 기본기 지도 경험을 쌓으며 레슨의 방향성을 다진 시기입니다.'
      },
      {
        period: '2018 - 2021',
        title: 'Science of Voice',
        detail: '호흡, 공명, 발음 교정을 더 체계적으로 설명하고 지도하는 방식이 자리 잡았습니다.'
      },
      {
        period: '2021 - NOW',
        title: 'Practical Coaching',
        detail: '1:1 맞춤 피드백과 직접 받은 후기들이 쌓이며 신뢰 포트폴리오가 만들어진 단계입니다.'
      }
    ],
    professionLabel: '보컬트레이닝 전문가 · 9년차',
    directReviewLabel: '세타쓴 1:1 보컬 레슨',
    reviews: [
      {
        businessName: '보컬트레이닝 전문가 · 9년차',
        platform: '네이버',
        rating: 5,
        content: '음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다.',
        reviewerName: '김민준',
        reviewDate: new Date('2024-01-15'),
        isFeatured: true,
      },
      {
        businessName: '세타쓴 보컬 아카데미',
        platform: '카카오맵',
        rating: 5,
        content: '발성부터 감정 표현까지 체계적으로 배울 수 있었어요. 정말 실력이 늘었습니다!',
        reviewerName: '이서연',
        reviewDate: new Date('2024-02-20'),
        isFeatured: true,
      },
      {
        businessName: '세타쓴 보컬 레슨',
        platform: '구글',
        rating: 5,
        content: '선생님의 열정과 전문성에 감동받았습니다. 목소리가 완전히 달라졌어요.',
        reviewerName: '박지우',
        reviewDate: new Date('2024-03-10'),
        isFeatured: true,
      },
      {
        businessName: '세타쓴 음악 스튜디오',
        platform: '네이버',
        rating: 5,
        content: '고음 처리가 항상 어려웠는데, 세타쓴 선생님 덕분에 자신감을 얻었어요!',
        reviewerName: '최예린',
        reviewDate: new Date('2024-04-05'),
      },
      {
        businessName: '프로 보컬 트레이닝',
        platform: '인스타그램',
        rating: 5,
        content: '오디션 준비하면서 많은 도움 받았습니다. 1:1 맞춤 레슨 최고!',
        reviewerName: '정수민',
        reviewDate: new Date('2024-05-12'),
      },
      {
        businessName: '세타쓴 1:1 보컬 레슨',
        platform: 'Re:cord',
        rating: 5,
        content: '상담부터 수업 방향까지 정말 꼼꼼했습니다. 직접 받은 후기라 더 남겨두고 싶어서 Record 링크로 작성해요.',
        reviewerName: '직접후기',
        reviewDate: new Date('2024-06-21'),
      },
    ],
  },
  {
    username: 'stylist-demo',
    email: 'stylist-demo@recordyours.com',
    name: '서윤',
    profession: '헤어디자이너',
    experience: '9년차',
    bio: '샵을 옮겨도 기존 고객이 다시 찾는 헤어디자이너. 레이어드컷, 톤다운 컬러, 손질이 쉬운 커트 상담에 강합니다.',
    location: '서울 성수',
    website: '',
    phone: '010-3482-7091',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=320&h=320&q=80',
    bgImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
    theme: 'dark',
    layout: 'card',
    bgColor: '#111827',
    accentColor: '#FF6B35',
    portfolioImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1523264766116-1e09b3145b84?auto=format&fit=crop&w=900&q=80'
    ],
    careerTimeline: [
      {
        period: '2017 - 2020',
        title: '살롱 커리어 시작',
        detail: '기본 커트와 상담 경험을 쌓으며 단골 고객이 붙기 시작한 시기입니다.'
      },
      {
        period: '2020 - 2023',
        title: '컬러와 레이어드 집중',
        detail: '톤다운 컬러와 손질 쉬운 레이어드컷으로 소개 예약이 늘어난 시기입니다.'
      },
      {
        period: '2023 - NOW',
        title: '샵 이동 후 고객 유지',
        detail: '샵이 바뀌어도 기존 고객이 계속 찾아오는 신뢰 기반을 만든 흐름입니다.'
      }
    ],
    professionLabel: '헤어디자이너 · 9년차',
    directReviewLabel: '서윤 레이어드컷 · 톤다운 컬러',
    reviews: [
      {
        businessName: '서울숲 헤어',
        platform: '네이버',
        rating: 5,
        content: '상담부터 커트까지 너무 세심했고, 원하는 무드로 딱 잡아주셔서 다음에도 꼭 다시 예약하고 싶어요.',
        reviewerName: '단골고객',
        reviewDate: new Date('2025-02-18'),
        isFeatured: true,
        imageUrl: '/demo/reviews/naver-layered-cut.svg'
      },
      {
        businessName: '서윤 디자이너 레이어드컷',
        platform: 'Re:cord',
        rating: 5,
        content: '샵을 옮기신 뒤에도 바로 따라갔어요. 얼굴형에 맞게 컷을 잡아주고 손질법까지 알려주셔서 믿고 맡깁니다.',
        reviewerName: '민지',
        reviewDate: new Date('2025-02-15'),
        isFeatured: true,
        imageUrl: '/demo/reviews/record-direct-review.svg'
      },
      {
        businessName: '1인샵 오픈 준비',
        platform: '당근',
        rating: 5,
        content: '이전 샵에서 받던 후기까지 한 번에 정리돼서 새로 오픈한 뒤에도 신뢰를 보여주기 좋았습니다.',
        reviewerName: '성수동고객',
        reviewDate: new Date('2025-02-11'),
        isFeatured: true,
      },
      {
        businessName: '톤다운 컬러 전문',
        platform: '네이버',
        rating: 5,
        content: '붉은 기 없이 차분하게 색을 잡아줘서 만족도가 높았어요. 다음 컬러도 여기서 할 생각입니다.',
        reviewerName: '컬러단골',
        reviewDate: new Date('2025-01-29'),
        imageUrl: '/demo/reviews/naver-tone-down-color.svg'
      },
      {
        businessName: '성수 살롱',
        platform: '카카오맵',
        rating: 5,
        content: '커트 후에 집에서 손질하는 방법까지 알려주셔서 매일 스타일링이 훨씬 쉬워졌어요.',
        reviewerName: '수현',
        reviewDate: new Date('2025-01-20'),
        imageUrl: '/demo/reviews/kakao-styling-proof.svg'
      },
      {
        businessName: '서윤 디자이너 상담',
        platform: 'Re:cord',
        rating: 5,
        content: '직접 후기 링크로 남깁니다. 고객 취향을 빨리 파악하고 설명도 명확해서 처음 방문인데도 편안했어요.',
        reviewerName: '가을',
        reviewDate: new Date('2025-02-22'),
      },
      {
        businessName: '성수 1인샵 준비',
        platform: '네이버',
        rating: 5,
        content: '샵을 옮긴 뒤에도 기존 후기와 작업 이미지가 한 번에 정리돼 있어서 예약 전에 바로 믿고 연락할 수 있었어요.',
        reviewerName: '예약전환고객',
        reviewDate: new Date('2025-02-24'),
        imageUrl: '/demo/reviews/naver-following-proof.svg'
      },
      {
        businessName: '서윤 1:1 스타일 상담',
        platform: 'Re:cord',
        rating: 5,
        content: '처음 상담인데도 모발 상태와 평소 손질 습관을 빠르게 파악해주셨어요. 시술 후에도 집에서 관리가 쉬운 쪽으로 제안해줘서 만족합니다.',
        reviewerName: '지은',
        reviewDate: new Date('2025-03-01'),
      },
      {
        businessName: '성수동 소개 고객',
        platform: '당근',
        rating: 5,
        content: '친구가 보내준 프로필 링크 보고 예약했는데 대표 후기랑 실제 리뷰 이미지가 같이 보여서 안심됐어요. 첫 방문인데도 부담이 적었습니다.',
        reviewerName: '당근소개',
        reviewDate: new Date('2025-03-04'),
      },
    ],
  },
]

function assertSafeSeedTarget() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    ''

  const looksLikeDevTarget =
    databaseUrl.includes('dev.db') ||
    databaseUrl.includes('smoke.db') ||
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1')

  if (process.env.NODE_ENV === 'production') {
    throw new Error('프로덕션 환경에서는 데모 시드를 실행할 수 없습니다.')
  }

  if (process.env.DEMO_SEED_CONFIRM !== 'YES') {
    throw new Error('DEMO_SEED_CONFIRM=YES 가 필요합니다.')
  }

  if (!looksLikeDevTarget) {
    throw new Error(`안전하지 않은 데이터베이스 대상입니다: ${databaseUrl || 'missing DATABASE_URL'}`)
  }
}

async function upsertDemoProfile(profile: DemoProfile) {
  const hashedPassword = await bcrypt.hash(demoPassword, 10)

  const existingUser = await prisma.user.findUnique({
    where: { username: profile.username }
  })

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: profile.email,
          password: hashedPassword,
          name: profile.name,
          profession: profile.profession,
          experience: profile.experience,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          phone: profile.phone,
          avatar: profile.avatar,
          bgImage: profile.bgImage,
          introVideo: profile.introVideo,
          isPublic: true,
          theme: profile.theme,
          layout: profile.layout,
          bgColor: profile.bgColor,
          accentColor: profile.accentColor,
          portfolioImages: JSON.stringify(profile.portfolioImages ?? []),
          careerTimeline: JSON.stringify(profile.careerTimeline ?? []),
          plan: 'premium',
          reviewLimit: 100
        }
      })
    : await prisma.user.create({
        data: {
          username: profile.username,
          email: profile.email,
          password: hashedPassword,
          name: profile.name,
          profession: profile.profession,
          experience: profile.experience,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          phone: profile.phone,
          avatar: profile.avatar,
          bgImage: profile.bgImage,
          introVideo: profile.introVideo,
          isPublic: true,
          theme: profile.theme,
          layout: profile.layout,
          bgColor: profile.bgColor,
          accentColor: profile.accentColor,
          portfolioImages: JSON.stringify(profile.portfolioImages ?? []),
          careerTimeline: JSON.stringify(profile.careerTimeline ?? []),
          plan: 'premium',
          reviewLimit: 100,
          role: 'user'
        }
      })

  await prisma.review.deleteMany({
    where: { userId: user.id }
  })

  await prisma.review.createMany({
    data: profile.reviews.map((review) => ({
      business: review.businessName,
      platform: review.platform,
      content: review.content,
      author: review.reviewerName,
      rating: review.rating,
      reviewDate: review.reviewDate,
      originalUrl: review.originalUrl ?? null,
      imageUrl: review.imageUrl ?? null,
      userId: user.id,
      isPublic: true,
      isVerified: review.platform === 'Re:cord',
      isFeatured: review.isFeatured === true,
      featuredAt: review.isFeatured === true ? review.reviewDate : null,
      verifiedBy: review.platform === 'Re:cord' ? 'owner' : 'seed_import',
      verifiedAt: review.platform === 'Re:cord' ? new Date() : null,
      verificationStatus: 'approved',
      verificationNote:
        review.platform === 'Re:cord'
          ? 'Seeded direct review approved for demo profile.'
          : 'Seeded archived review imported for demo profile.'
    }))
  })

  const reviewCount = await prisma.review.count({
    where: { userId: user.id }
  })

  console.log(`✅ ${profile.username} 준비 완료 (${reviewCount}개 리뷰)`)
  console.log(`   이름: ${profile.name}`)
  console.log(`   계정: ${profile.username}`)
  console.log(`   비밀번호: ${demoPassword}`)
  console.log(`   페이지: https://www.recordyours.com/${profile.username}`)
  console.log()
}

async function main() {
  assertSafeSeedTarget()
  console.log('🚀 데모 데이터 생성 시작...\n')

  for (const profile of demoProfiles) {
    console.log(`👤 ${profile.username} 계정 확인 중...`)
    await upsertDemoProfile(profile)
  }

  console.log('🎉 데모 데이터 생성 완료!')
  console.log(`   총 프로필 수: ${demoProfiles.length}`)
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
