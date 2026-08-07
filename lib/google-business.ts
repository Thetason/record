// Google Business Profile one-click review import.
//
// Legal shape mirrors the capture flow: the OWNER authorizes access to their
// own listing via Google OAuth, and we read their own reviews through the
// official API — no scraping, no third-party data. Tokens are held only in a
// short-lived httpOnly cookie (never persisted server-side).
//
// Requires GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET (Vercel env)
// and an approved Business Profile API application (quota 0 until approved —
// see docs/GOOGLE_REVIEWS_ONE_CLICK_2026-07-22.md).

const ACCOUNTS_API = 'https://mybusinessaccountmanagement.googleapis.com/v1'
const LOCATIONS_API = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const REVIEWS_API = 'https://mybusiness.googleapis.com/v4'

export const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/business.manage'

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET)
}

export function baseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'https://www.recordyours.com'
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: `${baseUrl()}/api/google/callback`,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    access_type: 'online',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCode(code: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: `${baseUrl()}/api/google/callback`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return typeof data.access_token === 'string' ? data.access_token : null
}

async function gget(token: string, url: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return res.json()
}

export type GoogleReview = {
  platform: '구글'
  reviewType: '구글리뷰'
  business: string
  author: string
  rating: number | null
  date: string | null
  content: string
  confidence: number
}

const STAR: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

function cleanComment(raw: string): string {
  // Google appends "(Translated by Google) …\n\n(Original)\n…" — keep the original.
  const originalMarker = raw.indexOf('(Original)')
  if (originalMarker >= 0) return raw.slice(originalMarker + '(Original)'.length).trim()
  return raw.replace(/^\(Translated by Google\)[^\n]*\n?/, '').trim()
}

// Fetch every review across the owner's accounts and locations.
// Bounded pagination so a pathological listing can't spin forever.
export async function fetchAllReviews(token: string): Promise<{ reviews: GoogleReview[]; locations: number }> {
  const out: GoogleReview[] = []
  let locationCount = 0

  const accountsData = await gget(token, `${ACCOUNTS_API}/accounts`)
  const accounts = (accountsData?.accounts as Array<{ name: string }> | undefined) ?? []

  for (const account of accounts.slice(0, 5)) {
    let locPage: string | undefined
    for (let i = 0; i < 10; i++) {
      const q = new URLSearchParams({ readMask: 'name,title', pageSize: '100' })
      if (locPage) q.set('pageToken', locPage)
      const locData = await gget(token, `${LOCATIONS_API}/${account.name}/locations?${q.toString()}`)
      const locations =
        (locData?.locations as Array<{ name: string; title?: string }> | undefined) ?? []

      for (const loc of locations) {
        locationCount++
        const business = loc.title || '내 비즈니스'
        // Reviews API (v4) wants accounts/{a}/locations/{l}; the v1 location
        // resource name is "locations/{l}" — recompose with the account.
        const locId = loc.name.split('/').pop()
        let revPage: string | undefined
        for (let j = 0; j < 40; j++) {
          const rq = new URLSearchParams({ pageSize: '50' })
          if (revPage) rq.set('pageToken', revPage)
          const revData = await gget(
            token,
            `${REVIEWS_API}/${account.name}/locations/${locId}/reviews?${rq.toString()}`
          )
          const reviews =
            (revData?.reviews as Array<{
              reviewer?: { displayName?: string }
              starRating?: string
              comment?: string
              createTime?: string
            }> | undefined) ?? []

          for (const r of reviews) {
            const content = r.comment ? cleanComment(r.comment) : ''
            if (content.length < 4) continue // 별점만 남긴 리뷰는 본문이 없어 저장 스키마 미달
            out.push({
              platform: '구글',
              reviewType: '구글리뷰',
              business,
              author: r.reviewer?.displayName || '구글 사용자',
              rating: r.starRating ? (STAR[r.starRating] ?? null) : null,
              date: r.createTime ? r.createTime.slice(0, 10) : null,
              content,
              confidence: 1,
            })
          }

          revPage = revData?.nextPageToken as string | undefined
          if (!revPage) break
        }
      }

      locPage = locData?.nextPageToken as string | undefined
      if (!locPage) break
    }
  }

  return { reviews: out, locations: locationCount }
}
