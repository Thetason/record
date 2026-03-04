export const REVIEW_SOURCE_TYPES = {
  PLATFORM_IMPORT: 'PLATFORM_IMPORT',
  DIRECT_TESTIMONIAL: 'DIRECT_TESTIMONIAL',
  MANUAL: 'MANUAL'
} as const;

export const REVIEW_RIGHTS_STATUSES = {
  IMPORTED_PRIVATE: 'IMPORTED_PRIVATE',
  PENDING_PUBLIC: 'PENDING_PUBLIC',
  CONSENTED_PUBLIC: 'CONSENTED_PUBLIC',
  PLATFORM_SNIPPET: 'PLATFORM_SNIPPET',
  BLOCKED: 'BLOCKED',
  TAKEDOWN_REQUESTED: 'TAKEDOWN_REQUESTED',
  TAKEN_DOWN: 'TAKEN_DOWN'
} as const;

export const REVIEW_MASKING_STATUSES = {
  UNKNOWN: 'UNKNOWN',
  MASKED: 'MASKED',
  UNMASKED_ALLOWED: 'UNMASKED_ALLOWED'
} as const;

export type ReviewSourceType = (typeof REVIEW_SOURCE_TYPES)[keyof typeof REVIEW_SOURCE_TYPES];
export type ReviewRightsStatus = (typeof REVIEW_RIGHTS_STATUSES)[keyof typeof REVIEW_RIGHTS_STATUSES];
export type ReviewMaskingStatus = (typeof REVIEW_MASKING_STATUSES)[keyof typeof REVIEW_MASKING_STATUSES];

type PolicyReviewLike = {
  isPublic?: boolean | null;
  rightsStatus?: string | null;
  content?: string | null;
  publicSnippet?: string | null;
  userId?: string | null;
};

const PUBLIC_RIGHTS_STATUSES = new Set<ReviewRightsStatus>([
  REVIEW_RIGHTS_STATUSES.CONSENTED_PUBLIC,
  REVIEW_RIGHTS_STATUSES.PLATFORM_SNIPPET
]);

const VALID_RIGHTS_STATUSES = new Set<string>(Object.values(REVIEW_RIGHTS_STATUSES));
const VALID_SOURCE_TYPES = new Set<string>(Object.values(REVIEW_SOURCE_TYPES));
const VALID_MASKING_STATUSES = new Set<string>(Object.values(REVIEW_MASKING_STATUSES));

export function normalizeRightsStatus(
  value?: string | null,
  fallback: ReviewRightsStatus = REVIEW_RIGHTS_STATUSES.IMPORTED_PRIVATE
): ReviewRightsStatus {
  if (value && VALID_RIGHTS_STATUSES.has(value)) {
    return value as ReviewRightsStatus;
  }
  return fallback;
}

export function normalizeSourceType(
  value?: string | null,
  fallback: ReviewSourceType = REVIEW_SOURCE_TYPES.PLATFORM_IMPORT
): ReviewSourceType {
  if (value && VALID_SOURCE_TYPES.has(value)) {
    return value as ReviewSourceType;
  }
  return fallback;
}

export function normalizeMaskingStatus(
  value?: string | null,
  fallback: ReviewMaskingStatus = REVIEW_MASKING_STATUSES.UNKNOWN
): ReviewMaskingStatus {
  if (value && VALID_MASKING_STATUSES.has(value)) {
    return value as ReviewMaskingStatus;
  }
  return fallback;
}

export function canExposeReviewPublicly(review: PolicyReviewLike): boolean {
  if (!review?.isPublic) return false;
  const rightsStatus = normalizeRightsStatus(
    review.rightsStatus,
    REVIEW_RIGHTS_STATUSES.CONSENTED_PUBLIC
  );

  // Backward compatibility:
  // legacy public reviews can have IMPORTED_PRIVATE after schema/policy transition.
  // Keep them visible until the owner explicitly switches to private.
  if (rightsStatus === REVIEW_RIGHTS_STATUSES.IMPORTED_PRIVATE) {
    return true;
  }

  return PUBLIC_RIGHTS_STATUSES.has(rightsStatus);
}

export function getPublicDisplayContent(review: PolicyReviewLike): string {
  const rightsStatus = normalizeRightsStatus(
    review.rightsStatus,
    REVIEW_RIGHTS_STATUSES.CONSENTED_PUBLIC
  );
  if (rightsStatus === REVIEW_RIGHTS_STATUSES.PLATFORM_SNIPPET) {
    return review.publicSnippet || '';
  }
  return review.content || '';
}

export function deriveCreationRightsStatus(
  sourceType: ReviewSourceType
): ReviewRightsStatus {
  if (sourceType === REVIEW_SOURCE_TYPES.DIRECT_TESTIMONIAL) {
    return REVIEW_RIGHTS_STATUSES.PENDING_PUBLIC;
  }
  return REVIEW_RIGHTS_STATUSES.IMPORTED_PRIVATE;
}

export function canOwnerAccessReview(review: PolicyReviewLike, ownerId?: string | null): boolean {
  if (!ownerId) return false;
  return review.userId === ownerId;
}
