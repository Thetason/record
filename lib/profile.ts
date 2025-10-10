import prisma from '@/lib/prisma';
import { validateAndNormalizeUsername } from '@/lib/validators/username';

const POSSIBLE_ID_LENGTH = 16;
const PROFILE_REVIEW_LIMIT = 32;

const REVIEW_SELECT = {
  id: true,
  platform: true,
  business: true,
  content: true,
  author: true,
  reviewDate: true,
  verifiedAt: true,
  verifiedBy: true,
  originalUrl: true,
  imageUrl: true
} as const;

const USER_SELECT = {
  id: true,
  username: true,
  name: true,
  bio: true,
  avatar: true,
  bgImage: true,
  location: true,
  website: true,
  theme: true,
  layout: true,
  bgColor: true,
  accentColor: true,
  introVideo: true,
  customCss: true,
  reviews: {
    orderBy: { reviewDate: 'desc' },
    take: PROFILE_REVIEW_LIMIT,
    select: REVIEW_SELECT
  }
} as const;

async function buildSuccessResult(
  user: UserWithReviews,
  options: FetchPublicProfileOptions,
  incrementView: boolean,
  fallbackUsername?: string
): Promise<FetchPublicProfileSuccess> {
  if (incrementView) {
    prisma.user
      .update({
        where: { id: user.id },
        data: {
          profileViews: {
            increment: 1
          }
        }
      })
      .catch(error => {
        console.warn('Public profile view increment failed', { userId: user.id, error });
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
    content:
      '회원님 한 분 한 분 신경써주시는게 느껴져요. 운동 효과도 좋고 무엇보다 재밌게 운동할 수 있어서 좋습니다!',
    author: '강**',
    reviewDate: '2024-08-02',
    verified: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '7',
    platform: '당근',
    business: '이웃공방 레터링 클래스',
    content:
      '동네에서 이렇게 편하게 배울 수 있는 공간이 있다는 게 좋았어요. 수업 후에도 자료를 보내주셔서 혼자 복습하기 편합니다.',
    author: '당***',
    reviewDate: '2024-07-28',
    verified: false,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null
  },
  {
    id: '8',
    platform: 'Re:cord',
    business: '보컬 트레이닝 1:1',
    content:
      '리뷰 요청 링크를 통해 작성한 후기입니다. 수업 전 상담부터 수업 후 피드백까지 체계적으로 챙겨주셔서 실력이 빠르게 늘었어요.',
    author: '자체고객',
    reviewDate: '2024-07-20',
    verified: false,
    verifiedAt: null,
    verifiedBy: 'request',
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
  const platforms = Array.from(new Set(reviews.map(review => review.platform)));

  const fallbackCover = '/images/default-cover.jpg';
  const professionFromBio = user.bio?.split('\n')?.[0]?.trim();
  const profession = professionFromBio || `${user.name} 전문가`;
  const bio = user.bio ?? '';

  const yearsExperience = (() => {
    if (!reviews.length) return '';
    const earliest = reviews.reduce((acc, review) =>
      review.reviewDate < acc ? review.reviewDate : acc,
      reviews[0].reviewDate
    );
    const diff = new Date().getFullYear() - new Date(earliest).getFullYear() + 1;
    return diff > 0 ? `${diff}년차` : '';
  })();

  const baseProfile: PublicProfile = {
    id: user.id,
    username: user.username,
    name: user.name,
    profession,
    bio,
    avatar: user.avatar ?? '',
    coverImage: user.bgImage || fallbackCover,
    totalReviews,
    platforms,
    experience: yearsExperience,
    location: user.location ?? '',
    specialties: [],
    certifications: [],
    socialLinks: {
      instagram: undefined,
      website: user.website ?? undefined
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
      business: review.business || '',
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

  // 1) 사용자 ID 기반 조회 (username이 아직 설정되지 않은 계정 공유 대비)
  if (input.length >= POSSIBLE_ID_LENGTH) {
    const userById = await prisma.user.findUnique({
      where: { id: input },
      select: USER_SELECT
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
    select: USER_SELECT
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
