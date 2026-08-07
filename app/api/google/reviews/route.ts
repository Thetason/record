import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const maxDuration = 120

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchAllReviews, googleConfigured } from '@/lib/google-business'

// Pulls every review from the owner's own Google Business Profile via the
// official API and returns them in the same shape the OCR extractor uses, so
// the import page's review/edit/save flow is reused as-is.
export async function GET(req: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.json(
      { success: false, error: '구글 연동이 아직 설정되지 않았습니다.' },
      { status: 503 }
    )
  }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }
  const token = req.cookies.get('g_access_token')?.value
  if (!token) {
    return NextResponse.json(
      { success: false, error: '구글 연결이 만료됐어요. 다시 연결해 주세요.', reconnect: true },
      { status: 401 }
    )
  }

  try {
    const { reviews, locations } = await fetchAllReviews(token)
    console.log(`google import: user=${session.user.id} locations=${locations} reviews=${reviews.length}`)
    const res = NextResponse.json({ success: true, count: reviews.length, locations, reviews })
    // Single-use: drop the token once the pull is done.
    res.cookies.set('g_access_token', '', { maxAge: 0, path: '/' })
    return res
  } catch (e) {
    console.error('google import failed:', e instanceof Error ? e.message : e)
    return NextResponse.json(
      { success: false, error: '구글 리뷰를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }
}
