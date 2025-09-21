import prisma from '@/lib/prisma';
import { validateAndNormalizeUsername } from '@/lib/validators/username';

const POSSIBLE_ID_LENGTH = 16;

async function buildSuccessResult(
  user: UserWithReviews,
  options: FetchPublicProfileOptions,
  incrementView: boolean,
  fallbackUsername?: string
): Promise<FetchPublicProfileSuccess> {
  if (incrementView) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileViews: {
          increment: 1
        }
      }
    });
  }

  const profile = buildProfilePayload(user, options.includeDemoFallback);

  return {
    ok: true,
    profile,
    normalizedUsername: profile.username || fallbackUsername || user.username || user.id,
    truncated: false
  };
}

export type PublicReview = {
  id: string;
  platform: string;
  business: string;
  rating: number;
  content: string;
  author: string;
  reviewDate: string;
  verified: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  originalUrl: string | null;
  imageUrl?: string | null;
};

export type PublicProfile = {
  id: string;
  username: string;
  name: string;
  profession: string;
  bio: string;
  avatar: string;
  coverImage: string;
  totalReviews: number;
  averageRating: number;
  platforms: string[];
  experience: string;
  location: string;
  specialties: string[];
  certifications: string[];
  socialLinks: {
    instagram?: string;
    website?: string;
  };
  theme: string;
  layout: string;
  bgImage: string | null;
  bgColor: string;
  accentColor: string;
  introVideo: string | null;
  customCss: string | null;
  reviews: PublicReview[];
};

export type FetchPublicProfileOptions = {
  incrementView?: boolean;
  includeDemoFallback?: boolean;
};

export type FetchPublicProfileSuccess = {
  ok: true;
  profile: PublicProfile;
  normalizedUsername: string;
  truncated: boolean;
};

export type FetchPublicProfileFailure = {
  ok: false;
  status: number;
  message: string;
};

export type FetchPublicProfileResult =
  | FetchPublicProfileSuccess
  | FetchPublicProfileFailure;

const DEMO_REVIEWS: PublicReview[] = [
  {
    id: '1',
    platform: '네이버',
    business: '비너스필라테스',
    rating: 5,
    content:
      '김서연 강사님 정말 최고예요! 자세 하나하나 꼼꼼하게 봐주시고, 제 몸 상태에 맞춰서 운동 강도도 조절해주셔서 너무 좋았어요. 허리 통증이 있었는데 3개월만에 완전히 좋아졌습니다.',
    author: '정**',
    reviewDate: '2024-08-07',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '2',
    platform: '카카오',
    business: '밸런스드필라테스',
    rating: 5,
    content:
      '서연쌤 수업은 진짜 강추! 기구 필라테스 처음인데도 무리 없이 따라갈 수 있게 지도해주셔서 감사해요. 체형 교정 효과도 확실히 보고 있습니다.',
    author: '이**',
    reviewDate: '2024-08-06',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '3',
    platform: '네이버',
    business: '필라오라인',
    rating: 5,
    content:
      '6개월째 김서연 강사님께 PT받고 있는데 체형이 정말 많이 개선됐어요. 전문적이면서도 친절하신 최고의 강사님! 운동 처방도 너무 정확해서 만족도 200%입니다.',
    author: '박**',
    reviewDate: '2024-08-05',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '4',
    platform: '구글',
    business: '비너스필라테스',
    rating: 5,
    content:
      'Professional and caring instructor. Kim Seoyeon really knows her stuff. My posture has improved significantly after just 2 months of training.',
    author: 'Sarah K.',
    reviewDate: '2024-08-04',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '5',
    platform: '인스타',
    business: '필라오라인',
    rating: 5,
    content:
      '산후 회복 프로그램으로 김서연 선생님 수업 들었는데 정말 만족스러웠어요! 몸도 마음도 건강해지는 느낌. 강추합니다!',
    author: '최**',
    reviewDate: '2024-08-03',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '6',
    platform: '네이버',
    business: '비너스필라테스',
    rating: 5,
    content:
      '회원님 한 분 한 분 신경써주시는게 느껴져요. 운동 효과도 좋고 무엇보다 재밌게 운동할 수 있어서 좋습니다!',
    author: '강**',
    reviewDate: '2024-08-02',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  }
];

type UserWithReviews = NonNullable<
  Awaited<ReturnType<typeof prisma.user.findUnique>>
>;

function buildProfilePayload(
  user: UserWithReviews,
  includeDemoFallback: boolean
): PublicProfile {
  const reviews = user.reviews ?? [];
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Number(
        (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        ).toFixed(1)
      )
    : 0;
  const platforms = Array.from(new Set(reviews.map(review => review.platform)));

  const baseProfile: PublicProfile = {
    id: user.id,
    username: user.username,
    name: user.name || '김서연',
    profession: '필라테스 강사',
    bio: user.bio ||
      '10년 경력의 필라테스 전문가입니다. 재활과 체형교정을 전문으로 하며, 개인의 신체 특성에 맞춘 맞춤형 운동을 제공합니다.',
    avatar: user.avatar ?? '',
    coverImage:
      user.bgImage ||
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop',
    totalReviews,
    averageRating,
    platforms,
    experience: '10년차',
    location: user.location || '서울 강남구',
    specialties: [
      '재활 필라테스',
      '체형 교정',
      '산전/산후 관리',
      '다이어트',
      '근력 강화'
    ],
    certifications: [
      'KPEE 필라테스 지도자',
      '재활 트레이닝 전문가',
      '스포츠 마사지 1급'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/pilates_kim',
      website: 'https://pilates-kim.com'
    },
    theme: user.theme || 'default',
    layout: user.layout || 'grid',
    bgImage: user.bgImage || null,
    bgColor: user.bgColor || '#ffffff',
    accentColor: user.accentColor || '#FF6B35',
    introVideo: user.introVideo || null,
    customCss: user.customCss || null,
    reviews: reviews.map(review => ({
      id: review.id,
      platform: review.platform,
      business: review.business || '비너스필라테스',
      rating: review.rating,
      content: review.content,
      author: review.author,
      reviewDate: review.reviewDate.toISOString(),
      verified: Boolean(review.verifiedAt),
      verifiedAt: review.verifiedAt,
      verifiedBy: review.verifiedBy,
      originalUrl: review.originalUrl,
      imageUrl: review.imageUrl
    }))
  };

  if (includeDemoFallback && baseProfile.reviews.length === 0) {
    baseProfile.reviews = DEMO_REVIEWS.map(review => ({ ...review }));
    baseProfile.totalReviews = DEMO_REVIEWS.length;
    baseProfile.averageRating = 5;
    baseProfile.platforms = Array.from(
      new Set(DEMO_REVIEWS.map(review => review.platform))
    );
  }

  return baseProfile;
}

export async function fetchPublicProfile(
  username: string,
  options: FetchPublicProfileOptions = {}
): Promise<FetchPublicProfileResult> {
  const { incrementView = false, includeDemoFallback = true } = options;

  const input = typeof username === 'string' ? username.trim() : '';

  if (!input) {
    return {
      ok: false,
      status: 400,
      message: '프로필 주소가 올바르지 않습니다'
    };
  }

  const include = {
    reviews: {
      orderBy: { reviewDate: 'desc' },
      take: 50
    }
  } as const;

  // 1) 사용자 ID 기반 조회 (username이 아직 설정되지 않은 계정 공유 대비)
  if (input.length >= POSSIBLE_ID_LENGTH) {
    const userById = await prisma.user.findUnique({
      where: { id: input },
      include
    });

    if (userById) {
      return buildSuccessResult(userById, { includeDemoFallback }, incrementView, input);
    }
  }

  // 2) username 규칙에 맞게 검증 후 조회
  const validation = validateAndNormalizeUsername(input, {
    hardMaxLength: 4096
  });

  if (!validation.ok) {
    return {
      ok: false,
      status: validation.status,
      message: validation.message
    };
  }

  const user = await prisma.user.findUnique({
    where: { username: validation.value },
    include
  });

  if (!user) {
    return {
      ok: false,
      status: 404,
      message: '프로필을 찾을 수 없습니다'
    };
  }

  const result = await buildSuccessResult(user, { includeDemoFallback }, incrementView, validation.value);
  return {
    ...result,
    truncated: validation.truncated
  };
}
