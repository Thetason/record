import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Korean-capable font for the card. The bundled public/fonts/*.woff files are
// empty placeholders, so pull a real subset at render time (edge-cached).
const FONT_URL =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/alternative/woff/PretendardStd-Bold.woff'

let fontPromise: Promise<ArrayBuffer | null> | null = null
function loadFont(): Promise<ArrayBuffer | null> {
  if (!fontPromise) {
    fontPromise = fetch(FONT_URL)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null)
  }
  return fontPromise
}

const INK = '#191f28'
const ACCENT = '#FF6B35'
const MUTED = '#8b95a1'
const SURFACE = '#f2f4f6'

function baseUrl(req: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(req.url).origin
  )
}

type Card = {
  name: string
  profession: string
  totalReviews: number
  platforms: number
  username: string
}

export async function GET(req: NextRequest) {
  const font = await loadFont()
  const fonts = font
    ? [{ name: 'Pretendard', data: font, style: 'normal' as const, weight: 700 as const }]
    : undefined

  let card: Card = {
    name: 'Re:cord',
    profession: '상담 전에 보내는 신뢰 링크',
    totalReviews: 0,
    platforms: 0,
    username: '',
  }

  try {
    const username = new URL(req.url).searchParams.get('username')
    if (username) {
      // increment=false so preview crawlers don't inflate profile view counts.
      const res = await fetch(
        `${baseUrl(req)}/api/profile/${encodeURIComponent(username)}?increment=false`
      )
      if (res.ok) {
        // The route wraps the payload: { profile, user, username }
        const { profile } = await res.json()
        if (profile) {
          card = {
            name: profile.name || username,
            profession: profile.profession || '전문가',
            totalReviews: profile.totalReviews ?? profile.reviews?.length ?? 0,
            platforms: Array.isArray(profile.platforms) ? profile.platforms.length : 0,
            username,
          }
        }
      }
    }
  } catch {
    // fall through to the brand card
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: SURFACE,
          padding: '72px 80px',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: INK, letterSpacing: '-0.03em' }}>
            Re:cord
          </div>
          <div style={{ fontSize: 34, color: ACCENT }}>*</div>
        </div>

        {/* name + profession */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: card.name.length > 12 ? 76 : 96,
              fontWeight: 700,
              color: INK,
              letterSpacing: '-0.05em',
              lineHeight: 1.05,
            }}
          >
            {card.name}
          </div>
          <div style={{ fontSize: 34, color: MUTED, marginTop: 16 }}>{card.profession}</div>
        </div>

        {/* stats + url */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {card.totalReviews > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: 999,
                  padding: '16px 30px',
                  fontSize: 30,
                  fontWeight: 700,
                  color: INK,
                }}
              >
                고객 후기 {card.totalReviews}개
              </div>
            )}
            {card.platforms > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: 999,
                  padding: '16px 30px',
                  fontSize: 30,
                  fontWeight: 700,
                  color: ACCENT,
                }}
              >
                {card.platforms}개 플랫폼
              </div>
            )}
          </div>
          <div style={{ fontSize: 26, color: MUTED }}>
            {card.username ? `recordyours.com/${card.username}` : 'recordyours.com'}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  )
}
