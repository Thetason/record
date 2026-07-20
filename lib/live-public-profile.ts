import type { PublicProfile, PublicReview } from "@/lib/profile"

const DEFAULT_ACCENT = "#FF6B35"
const DEFAULT_COVER = "/sample.png"
const RESERVED_LIVE_PROFILE_USERNAMES = new Set(["syb2020"])
const LIVE_PROFILE_OVERRIDES: Record<string, Partial<PublicProfile>> = {
  syb2020: {
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
    certifications: ["10년차 현장 경력", "직접 받은 후기 검토 완료"],
  },
}

type RemotePublicProfilePayload = {
  profile?: Partial<PublicProfile> & {
    reviews?: Array<Partial<PublicReview>>
    socialLinks?: Partial<PublicProfile["socialLinks"]>
  }
}

type NormalizeRemotePublicProfileOptions = {
  fallbackProfile?: PublicProfile
}

export function shouldUseLivePublicProfile(username: string): boolean {
  return RESERVED_LIVE_PROFILE_USERNAMES.has(username)
}

export function normalizeRemotePublicProfile(
  payload: RemotePublicProfilePayload,
  options?: NormalizeRemotePublicProfileOptions
): PublicProfile | null {
  const remoteProfile = payload.profile

  if (!remoteProfile || typeof remoteProfile.username !== "string" || typeof remoteProfile.name !== "string") {
    return null
  }

  const fallbackProfile = options?.fallbackProfile
  const remoteReviews = Array.isArray(remoteProfile.reviews) ? remoteProfile.reviews : []
  const fallbackReviews = fallbackProfile?.reviews ?? []
  const normalizedReviews: PublicReview[] = remoteReviews.map((review, index) => {
    const fallbackReview = fallbackReviews[index] ?? fallbackReviews[0]
    const platform = typeof review.platform === "string" && review.platform.trim().length > 0
      ? review.platform
      : fallbackReview?.platform ?? "Re:cord"

    return {
      id: typeof review.id === "string" ? review.id : `remote-${remoteProfile.username}-${index + 1}`,
      platform,
      business: typeof review.business === "string" && review.business.trim().length > 0
        ? review.business
        : fallbackReview?.business ?? remoteProfile.name,
      content: typeof review.content === "string" ? review.content : fallbackReview?.content ?? "",
      author: typeof review.author === "string" && review.author.trim().length > 0
        ? review.author
        : fallbackReview?.author ?? "고객",
      rating: typeof review.rating === "number" ? review.rating : fallbackReview?.rating ?? 5,
      reviewDate: typeof review.reviewDate === "string" ? review.reviewDate : fallbackReview?.reviewDate ?? new Date().toISOString(),
      verified: typeof review.verified === "boolean" ? review.verified : fallbackReview?.verified ?? false,
      isFeatured: typeof review.isFeatured === "boolean" ? review.isFeatured : fallbackReview?.isFeatured ?? index < 3,
      verifiedAt: typeof review.verifiedAt === "string" || review.verifiedAt === null
        ? review.verifiedAt
        : fallbackReview?.verifiedAt ?? null,
      verifiedBy: typeof review.verifiedBy === "string" || review.verifiedBy === null
        ? review.verifiedBy
        : fallbackReview?.verifiedBy ?? null,
      originalUrl: typeof review.originalUrl === "string" || review.originalUrl === null
        ? review.originalUrl
        : fallbackReview?.originalUrl ?? null,
      proofType: review.proofType === "direct" || review.proofType === "archived"
        ? review.proofType
        : fallbackReview?.proofType ?? (platform === "Re:cord" ? "direct" : "archived"),
      imageUrl: typeof review.imageUrl === "string" || review.imageUrl === null
        ? review.imageUrl
        : fallbackReview?.imageUrl ?? null
    }
  })

  const normalizedPlatforms = Array.isArray(remoteProfile.platforms)
    ? remoteProfile.platforms.filter((platform): platform is string => typeof platform === "string" && platform.trim().length > 0)
    : []
  const normalizedPortfolioImages = Array.isArray(remoteProfile.portfolioImages)
    ? remoteProfile.portfolioImages.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    : fallbackProfile?.portfolioImages ?? []
  const normalizedSpecialties = Array.isArray(remoteProfile.specialties)
    ? remoteProfile.specialties.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : fallbackProfile?.specialties ?? []
  const normalizedCertifications = Array.isArray(remoteProfile.certifications)
    ? remoteProfile.certifications.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : fallbackProfile?.certifications ?? []
  const normalizedCareerTimeline = Array.isArray(remoteProfile.careerTimeline)
    ? remoteProfile.careerTimeline
        .map((item) => {
          const entry = typeof item === "object" && item !== null ? item : null
          return {
            period: typeof entry?.period === "string" ? entry.period.trim() : "",
            title: typeof entry?.title === "string" ? entry.title.trim() : "",
            detail: typeof entry?.detail === "string" ? entry.detail.trim() : "",
          }
        })
        .filter(
          (item): item is PublicProfile["careerTimeline"][number] =>
            Boolean(item.period && item.title && item.detail)
        )
    : fallbackProfile?.careerTimeline ?? []

  const normalizedProfile: PublicProfile = {
    id: typeof remoteProfile.id === "string" ? remoteProfile.id : fallbackProfile?.id ?? `remote-${remoteProfile.username}`,
    username: remoteProfile.username,
    name: remoteProfile.name,
    isPublic: typeof remoteProfile.isPublic === "boolean" ? remoteProfile.isPublic : true,
    profession: typeof remoteProfile.profession === "string" && remoteProfile.profession.trim().length > 0
      ? remoteProfile.profession
      : fallbackProfile?.profession ?? `${remoteProfile.name} 전문가`,
    bio: typeof remoteProfile.bio === "string" ? remoteProfile.bio : fallbackProfile?.bio ?? "",
    avatar: typeof remoteProfile.avatar === "string" ? remoteProfile.avatar : fallbackProfile?.avatar ?? "",
    coverImage: typeof remoteProfile.coverImage === "string" && remoteProfile.coverImage.trim().length > 0
      ? remoteProfile.coverImage
      : fallbackProfile?.coverImage ?? DEFAULT_COVER,
    totalReviews: typeof remoteProfile.totalReviews === "number" ? remoteProfile.totalReviews : normalizedReviews.length,
    platforms: normalizedPlatforms.length > 0
      ? normalizedPlatforms
      : Array.from(new Set(normalizedReviews.map((review) => review.platform))),
    experience: typeof remoteProfile.experience === "string" ? remoteProfile.experience : fallbackProfile?.experience ?? "",
    location: typeof remoteProfile.location === "string" ? remoteProfile.location : fallbackProfile?.location ?? "",
    phone: typeof remoteProfile.phone === "string" ? remoteProfile.phone : fallbackProfile?.phone,
    portfolioImages: normalizedPortfolioImages,
    careerTimeline: normalizedCareerTimeline,
    specialties: normalizedSpecialties,
    certifications: normalizedCertifications,
    socialLinks: {
      ...(fallbackProfile?.socialLinks ?? {}),
      ...(remoteProfile.socialLinks ?? {})
    },
    plan: remoteProfile.plan === "free" || remoteProfile.plan === "premium" || remoteProfile.plan === "pro"
      ? remoteProfile.plan
      : fallbackProfile?.plan,
    theme: typeof remoteProfile.theme === "string" ? remoteProfile.theme : fallbackProfile?.theme ?? "default",
    layout: typeof remoteProfile.layout === "string" ? remoteProfile.layout : fallbackProfile?.layout ?? "grid",
    bgImage: typeof remoteProfile.bgImage === "string" || remoteProfile.bgImage === null
      ? remoteProfile.bgImage
      : fallbackProfile?.bgImage ?? null,
    bgColor: typeof remoteProfile.bgColor === "string" ? remoteProfile.bgColor : fallbackProfile?.bgColor ?? "#ffffff",
    accentColor: typeof remoteProfile.accentColor === "string" ? remoteProfile.accentColor : fallbackProfile?.accentColor ?? DEFAULT_ACCENT,
    introVideo: typeof remoteProfile.introVideo === "string" || remoteProfile.introVideo === null
      ? remoteProfile.introVideo
      : fallbackProfile?.introVideo ?? null,
    customCss: typeof remoteProfile.customCss === "string" || remoteProfile.customCss === null
      ? remoteProfile.customCss
      : fallbackProfile?.customCss ?? null,
    reviews: normalizedReviews
  }

  return {
    ...normalizedProfile,
    ...(LIVE_PROFILE_OVERRIDES[remoteProfile.username] ?? {})
  }
}

export async function fetchLivePublicProfile(
  username: string,
  options?: NormalizeRemotePublicProfileOptions
): Promise<PublicProfile | null> {
  if (!shouldUseLivePublicProfile(username)) {
    return null
  }

  try {
    const response = await fetch(`https://www.recordyours.com/api/profile/${username}?increment=false`, {
      cache: "no-store"
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as RemotePublicProfilePayload
    return normalizeRemotePublicProfile(payload, options)
  } catch (error) {
    console.error(`Failed to fetch live public profile for ${username}:`, error)
    return null
  }
}
