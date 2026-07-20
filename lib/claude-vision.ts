import Anthropic from '@anthropic-ai/sdk'
import { buildPlatformGuide, normalizePlatform } from '@/lib/review-platforms'

// Multi-review extraction from a single (tall) screenshot.
// The user captures their own logged-in review page (scroll capture / a few
// long screenshots); our server never touches the source platform. Claude
// vision parses many reviews from one image at once — turning "screenshot each
// review" into "capture once, confirm once".
//
// Naver / Kakao / 당근 / 숨고 / 크몽 each lay reviews out differently. A vision
// model reads the image semantically (unlike brittle DOM/regex parsing), and we
// inject a per-platform anatomy guide so it applies each platform's conventions
// and avoids their traps (e.g. 당근 has no star rating; 네이버 keyword tags are
// aggregates, not reviews).

export type ExtractedReview = {
  platform: string
  reviewType: string
  business: string
  author: string
  rating: number | null
  date: string | null // YYYY-MM-DD
  content: string
  confidence: number // 0..1
}

const VISION_MODEL = process.env.ANTHROPIC_VISION_MODEL || 'claude-opus-4-8'

// json_schema structured output — guarantees a parseable shape back.
// (Range/length limits aren't expressible here, so they're enforced below.)
const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reviews: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          platform: { type: 'string' },
          reviewType: { type: 'string' },
          business: { type: 'string' },
          author: { type: 'string' },
          rating: { type: ['integer', 'null'] },
          date: { type: ['string', 'null'] },
          content: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: [
          'platform',
          'reviewType',
          'business',
          'author',
          'rating',
          'date',
          'content',
          'confidence',
        ],
      },
    },
  },
  required: ['reviews'],
} as const

const SYSTEM_PROMPT = `You extract customer reviews from Korean review screenshots for a reputation-portfolio product.

The image is usually a long scroll-capture that may contain MANY separate reviews, and a single upload can even mix platforms (네이버, 카카오, 당근, 숨고, 크몽, 인스타/카톡 DM). Each platform lays reviews out differently — FIRST identify which platform each review is from (by its logo, colors, and layout), THEN apply that platform's rules below.

Extract EVERY distinct customer review you can read, per-review.

Return for each review:
- platform: source platform in Korean — one of 네이버 / 카카오 / 당근 / 숨고 / 크몽 / 인스타그램 / 기타. Detect it per review; a mixed capture should have reviews labeled with their own platform.
- reviewType: short Korean label (예: "방문자리뷰","영수증리뷰","블로그리뷰","거래후기","고수리뷰","구매후기","직접후기"). If unsure, "".
- business: the business/shop/professional/service name if visible, else "".
- author: reviewer's displayed nickname exactly as shown (keep masking like "ho****"). If absent, "".
- rating: integer 1-5 ONLY if a real star rating for this review is visible; otherwise null. NEVER invent or infer a rating from sentiment.
- date: YYYY-MM-DD if an absolute date is shown (convert "26.4.11", "2026.4.11.화", "2026년 4월 11일"). If only relative ("3일 전") or absent, null.
- content: the review body text, cleaned of UI noise ("더보기", "답글", reaction/like counts, "N번째 방문" prefixes). Keep the reviewer's ORIGINAL wording; never summarize or translate.
- confidence: 0.0-1.0 — how sure you are this is a real, correctly-parsed single review (lower if text is cut off, ambiguous, or platform is unclear).

PLATFORM ANATOMY (apply per detected platform):

${buildPlatformGuide()}

GLOBAL RULES:
- One card = one review. Do not merge two reviews, do not split one review.
- Skip the professional's own replies (사장님/원장/판매자/고수 답글) — customers only.
- Skip navigation, ads, tab headers, aggregate stats, and non-review UI text.
- When a platform's rule says a rating doesn't exist (당근 거래후기, DM 후기), rating MUST be null — do not fabricate one.
- If the image contains no readable customer reviews, return an empty list.`

let client: Anthropic | null = null
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!client) client = new Anthropic()
  return client
}

export type VisionImage = { base64: string; mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' }

function sanitize(reviews: unknown): ExtractedReview[] {
  if (!Array.isArray(reviews)) return []
  return reviews
    .map((r): ExtractedReview | null => {
      if (!r || typeof r !== 'object') return null
      const o = r as Record<string, unknown>
      const content = typeof o.content === 'string' ? o.content.trim() : ''
      if (content.length < 4) return null
      let rating: number | null = null
      if (typeof o.rating === 'number' && o.rating >= 1 && o.rating <= 5) {
        rating = Math.round(o.rating)
      }
      const date = typeof o.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.date) ? o.date : null
      const confidence =
        typeof o.confidence === 'number' ? Math.min(1, Math.max(0, o.confidence)) : 0.5
      return {
        platform: normalizePlatform(typeof o.platform === 'string' ? o.platform : ''),
        reviewType: typeof o.reviewType === 'string' ? o.reviewType.trim().slice(0, 20) : '',
        business: typeof o.business === 'string' ? o.business.trim() : '',
        author: typeof o.author === 'string' ? o.author.trim() : '',
        rating,
        date,
        content: content.slice(0, 2000),
        confidence,
      }
    })
    .filter((r): r is ExtractedReview => r !== null)
}

// Dev mock so the whole capture→confirm→save flow is testable without a key.
function mockReviews(): ExtractedReview[] {
  return [
    {
      platform: '네이버',
      reviewType: '방문자리뷰',
      business: '세타쓴 보컬레슨',
      author: 'Colin KOO',
      rating: 5,
      date: '2026-04-11',
      content:
        '생애 첫 축가를 위해 레슨을 받았습니다. 부족한 부분을 정확히 짚어주시고 너무 친절하고 프로페셔널하셨어요. 덕분에 자신감 있게 무대에 섰습니다.',
      confidence: 0.94,
    },
    {
      platform: '당근',
      reviewType: '거래후기',
      business: '세타쓴 보컬레슨',
      author: '동네주민',
      rating: null, // 당근 거래후기는 별점이 없다 — 지어내지 않음
      date: '2026-03-02',
      content: '시간 약속을 잘 지켜요. 취미로 시작했는데 3개월 만에 노래방 점수가 확 올랐어요. 발성부터 차근차근 잡아주십니다.',
      confidence: 0.86,
    },
    {
      platform: '크몽',
      reviewType: '구매후기',
      business: '1:1 온라인 보컬 코칭',
      author: 'ho****',
      rating: 5,
      date: null,
      content: '결과물 만족도, 상담 모두 최고예요. 커리큘럼이 체계적이고 피드백이 구체적이라 좋았습니다.',
      confidence: 0.79,
    },
  ]
}

export async function extractReviewsFromImages(images: VisionImage[]): Promise<{
  reviews: ExtractedReview[]
  engine: 'claude' | 'mock'
}> {
  const anthropic = getClient()

  if (!anthropic) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ANTHROPIC_API_KEY_MISSING')
    }
    return { reviews: mockReviews(), engine: 'mock' }
  }

  const imageBlocks = images.map((img) => ({
    type: 'image' as const,
    source: { type: 'base64' as const, media_type: img.mediaType, data: img.base64 },
  }))

  const response = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: EXTRACTION_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: '이 캡처들에서 모든 개별 리뷰를 스키마에 맞춰 추출하세요.',
          },
        ],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  const raw = textBlock && 'text' in textBlock ? textBlock.text : '{"reviews":[]}'

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { reviews: [] }
  }

  const reviews = sanitize((parsed as { reviews?: unknown }).reviews)
  return { reviews, engine: 'claude' }
}
