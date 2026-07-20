import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { validateAndNormalizeUsername } from '@/lib/validators/username';
import { toImageSrc } from '@/lib/utils';

const POSSIBLE_ID_LENGTH = 16;
const PROFILE_REVIEW_LIMIT = 32;

const REVIEW_SELECT = Prisma.validator<Prisma.ReviewSelect>()({
  id: true,
  platform: true,
  business: true,
  content: true,
  author: true,
  rating: true,
  reviewDate: true,
  isVerified: true,
  isFeatured: true,
  featuredAt: true,
  verifiedAt: true,
  verifiedBy: true,
  originalUrl: true,
  imageUrl: true
});

const PUBLIC_PROFILE_REVIEW_WHERE = Prisma.validator<Prisma.ReviewWhereInput>()({
  AND: [
    {
      isPublic: true
    },
    {
      verificationStatus: {
        notIn: ['rejected', 'flagged']
      }
    },
    {
      OR: [
        {
          platform: {
            not: 'Re:cord'
          }
        },
        {
          verificationStatus: 'approved'
        }
      ]
    }
  ]
});

const USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  name: true,
  profession: true,
  experience: true,
  bio: true,
  isPublic: true,
  avatar: true,
  bgImage: true,
  location: true,
  website: true,
  phone: true,
  portfolioImages: true,
  careerTimeline: true,
  plan: true,
  theme: true,
  layout: true,
  bgColor: true,
  accentColor: true,
  introVideo: true,
  customCss: true,
  reviews: {
    where: PUBLIC_PROFILE_REVIEW_WHERE,
    orderBy: [
      { isFeatured: 'desc' },
      { featuredAt: 'asc' },
      { reviewDate: 'desc' }
    ],
    take: PROFILE_REVIEW_LIMIT,
    select: REVIEW_SELECT
  }
});

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

  const profile = buildProfilePayload(user, Boolean(options.includeDemoFallback));

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
  rating: number | null;
  reviewDate: string;
  verified: boolean;
  isFeatured: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  originalUrl: string | null;
  proofType: 'direct' | 'archived';
  imageUrl?: string | null;
};

export type PublicCareerEntry = {
  period: string;
  title: string;
  detail: string;
};

export type PublicProfile = {
  id: string;
  username: string;
  name: string;
  isPublic: boolean;
  profession: string;
  bio: string;
  avatar: string;
  coverImage: string;
  totalReviews: number;
  platforms: string[];
  experience: string;
  location: string;
  phone?: string;
  portfolioImages: string[];
  careerTimeline: PublicCareerEntry[];
  specialties: string[];
  certifications: string[];
  socialLinks: {
    instagram?: string;
    website?: string;
  };
  plan?: 'free' | 'premium' | 'pro';
  theme: string;
  layout: string;
  bgImage: string | null;
  bgColor: string;
  accentColor: string;
  introVideo: string | null;
  customCss: string | null;
  reviews: PublicReview[];
};

type ProfileEnhancement = {
  profession?: string;
  experience?: string;
  location?: string;
  careerTimeline?: PublicCareerEntry[];
  specialties?: string[];
  certifications?: string[];
  portfolioImages?: string[];
  socialLinks?: {
    instagram?: string;
    website?: string;
  };
};

const PROFILE_ENHANCEMENTS: Record<string, ProfileEnhancement> = {
  "stylist-demo": {
    careerTimeline: [
      {
        period: "2017 - 2020",
        title: "살롱 커리어 시작",
        detail: "기본 커트와 상담 경험을 쌓으며 단골 고객이 붙기 시작한 시기입니다."
      },
      {
        period: "2020 - 2023",
        title: "컬러와 레이어드 집중",
        detail: "톤다운 컬러와 손질 쉬운 레이어드컷으로 소개 예약이 늘어난 시기입니다."
      },
      {
        period: "2023 - NOW",
        title: "샵 이동 후 고객 유지",
        detail: "샵이 바뀌어도 기존 고객이 계속 찾아오는 신뢰 기반을 만든 흐름입니다."
      }
    ],
    specialties: [
      "레이어드컷",
      "톤다운 컬러",
      "손질 쉬운 커트",
      "얼굴형 맞춤 상담"
    ],
    certifications: [
      "9년차 현장 경력",
      "기존 고객 재방문 후기 보유",
      "직접 받은 후기 검토 완료"
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523264766116-1e09b3145b84?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
    ]
  },
  "syb2020": {
    profession: "보컬트레이너",
    experience: "10년차",
    careerTimeline: [
      {
        period: "2016 - 2018",
        title: "Foundation",
        detail: "발성과 기본기 지도 경험을 쌓으며 레슨의 방향성을 다진 시기입니다."
      },
      {
        period: "2018 - 2021",
        title: "Science of Voice",
        detail: "호흡, 공명, 발음 교정을 더 체계적으로 설명하고 지도하는 방식이 자리 잡았습니다."
      },
      {
        period: "2021 - NOW",
        title: "Practical Coaching",
        detail: "1:1 맞춤 피드백과 직접 받은 후기들이 쌓이며 신뢰 포트폴리오가 만들어진 단계입니다."
      }
    ],
    specialties: [
      "보컬 발성 교정",
      "오디션 준비",
      "1:1 맞춤 레슨"
    ],
    certifications: [
      "10년차 현장 경력",
      "직접 받은 후기 검토 완료"
    ],
    portfolioImages: [
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80"
    ]
  }
};

function parsePortfolioImages(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
  } catch {
    return [];
  }
}

function parseCareerTimeline(value: string | null | undefined): PublicCareerEntry[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        period: typeof item.period === "string" ? item.period.trim() : "",
        title: typeof item.title === "string" ? item.title.trim() : "",
        detail: typeof item.detail === "string" ? item.detail.trim() : "",
      }))
      .filter((item) => item.period && item.title && item.detail)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export type FetchPublicProfileOptions = {
  incrementView?: boolean;
  includeDemoFallback?: boolean;
  allowPrivateProfile?: boolean;
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
    business: '성수 살롱 하루',
    content:
      '레이어드컷 상담을 정말 세심하게 해주셨어요. 머리 말리는 법까지 알려주셔서 집에서도 스타일이 잘 살아납니다.',
    author: '단골고객',
    rating: 5,
    reviewDate: '2024-08-07',
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '2',
    platform: '카카오맵',
    business: '로우톤 헤어 압구정',
    content:
      '톤다운 컬러를 맡겼는데 얼굴톤에 맞춰 추천해주셔서 만족도가 높았어요. 과하지 않고 오래 유지됩니다.',
    author: '혜린',
    rating: 5,
    reviewDate: '2024-08-06',
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '3',
    platform: '네이버',
    business: '무드컷 서울숲점',
    content:
      '처음 방문인데도 원하는 이미지를 빠르게 이해해주셨어요. 커트 이후 주변에서 어디서 했냐고 많이 물어봅니다.',
    author: '서현',
    rating: 5,
    reviewDate: '2024-08-05',
    verified: true,
    isFeatured: true,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '4',
    platform: '구글',
    business: 'Seongsu Hair Atelier',
    content:
      'Professional consultation and a very natural finish. The haircut grows out beautifully, so I keep coming back.',
    author: 'Mina K.',
    rating: 5,
    reviewDate: '2024-08-04',
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '5',
    platform: '인스타',
    business: '1인샵 오픈 준비',
    content:
      '샵을 옮긴 뒤에도 기존 후기와 작업물을 바로 볼 수 있어서 예약 전에 신뢰하기 쉬웠어요.',
    author: '팔로워고객',
    rating: 5,
    reviewDate: '2024-08-03',
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '6',
    platform: '네이버',
    business: '성수 살롱 하루',
    content:
      '긴 머리 레이어드컷이 정말 예쁘게 나왔고, 다음 방문 주기까지 알려주셔서 관리가 편했어요.',
    author: '민주',
    rating: 5,
    reviewDate: '2024-08-02',
    verified: true,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '7',
    platform: '당근',
    business: '연남 1인 헤어샵',
    content:
      '동네에서 믿고 맡길 디자이너 찾다가 알게 됐어요. 상담이 꼼꼼해서 처음인데도 불안하지 않았습니다.',
    author: '연남단골',
    rating: 5,
    reviewDate: '2024-07-28',
    verified: false,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: null,
    originalUrl: null,
    proofType: 'archived'
  },
  {
    id: '8',
    platform: 'Re:cord',
    business: '레이어드컷 · 톤다운 컬러',
    content:
      '리뷰 요청 링크를 통해 직접 남긴 후기입니다. 예약 전 스타일 상담이 명확했고 결과도 기대 이상이었어요.',
    author: '직접후기',
    rating: 5,
    reviewDate: '2024-07-20',
    verified: false,
    isFeatured: false,
    verifiedAt: null,
    verifiedBy: 'request',
    originalUrl: null,
    proofType: 'direct'
  }
];

type UserWithReviews = Prisma.UserGetPayload<{
  select: typeof USER_SELECT;
}>;

function buildProfilePayload(
  user: UserWithReviews,
  includeDemoFallback: boolean
): PublicProfile {
  const reviews = user.reviews ?? [];
  const totalReviews = reviews.length;
  const platforms = Array.from(new Set(reviews.map(review => review.platform)));

  // Use an existing public asset to avoid image optimizer 400s on missing files.
  const fallbackCover = '/sample.png';
  const professionFromBio = user.bio?.split('\n')?.[0]?.trim();
  const profession = user.profession?.trim() || professionFromBio || `${user.name} 전문가`;
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
    isPublic: user.isPublic,
    profession,
    bio,
    avatar: toImageSrc(user.avatar) ?? '',
    coverImage: user.bgImage || fallbackCover,
    totalReviews,
    platforms,
    experience: user.experience?.trim() || yearsExperience,
    location: user.location ?? '',
    phone: user.phone ?? undefined,
    portfolioImages: parsePortfolioImages(user.portfolioImages),
    careerTimeline: parseCareerTimeline(user.careerTimeline),
    specialties: [],
    certifications: [],
    socialLinks: {
      instagram: undefined,
      website: user.website ?? undefined
    },
    plan: user.plan as 'free' | 'premium' | 'pro' | undefined,
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
      rating: review.rating ?? null,
      reviewDate: review.reviewDate.toISOString(),
      verified: Boolean(review.isVerified || review.verifiedAt),
      isFeatured: Boolean(review.isFeatured),
      verifiedAt: review.verifiedAt ? review.verifiedAt.toISOString() : null,
      verifiedBy: review.verifiedBy,
      originalUrl: review.originalUrl,
      proofType: review.platform === 'Re:cord' ? 'direct' : 'archived',
      imageUrl: review.imageUrl
    }))
  };

  const enhancements = PROFILE_ENHANCEMENTS[user.username] ?? {};
  baseProfile.profession = enhancements.profession ?? baseProfile.profession;
  baseProfile.experience = enhancements.experience ?? baseProfile.experience;
  baseProfile.location = enhancements.location ?? baseProfile.location;
  baseProfile.careerTimeline = enhancements.careerTimeline ?? baseProfile.careerTimeline;
  baseProfile.specialties = enhancements.specialties ?? baseProfile.specialties;
  baseProfile.certifications = enhancements.certifications ?? baseProfile.certifications;
  baseProfile.portfolioImages = baseProfile.portfolioImages.length > 0
    ? baseProfile.portfolioImages
    : (enhancements.portfolioImages ?? []);
  baseProfile.socialLinks = {
    ...baseProfile.socialLinks,
    ...enhancements.socialLinks
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
  const {
    incrementView = false,
    includeDemoFallback = true,
    allowPrivateProfile = false
  } = options;

  const input = typeof username === 'string' ? username.trim() : '';

  if (!input) {
    return {
      ok: false,
      status: 400,
      message: '프로필 주소가 올바르지 않습니다'
    };
  }

  try {
    // 1) 사용자 ID 기반 조회 (username이 아직 설정되지 않은 계정 공유 대비)
    if (input.length >= POSSIBLE_ID_LENGTH) {
      const userById = await prisma.user.findUnique({
        where: { id: input },
        select: USER_SELECT
      });

      if (userById) {
        if (!allowPrivateProfile && userById.isPublic === false) {
          return {
            ok: false,
            status: 404,
            message: '프로필을 찾을 수 없습니다'
          };
        }
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

    if (!allowPrivateProfile && user.isPublic === false) {
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
  } catch (error) {
    console.error('fetchPublicProfile failed', { username: input, error });
    return {
      ok: false,
      status: 503,
      message: '프로필 데이터를 잠시 불러올 수 없습니다'
    };
  }
}
