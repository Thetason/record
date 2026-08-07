import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { randomBytes } from 'crypto'
import { authOptions } from '@/lib/auth'
import { baseUrl, buildAuthUrl, googleConfigured } from '@/lib/google-business'

// Kick off owner OAuth for the one-click Google review import.
export async function GET() {
  if (!googleConfigured()) {
    return NextResponse.json({ error: '구글 연동이 아직 설정되지 않았습니다.' }, { status: 503 })
  }
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(`${baseUrl()}/login?callbackUrl=/dashboard/import`)
  }

  const state = randomBytes(16).toString('hex')
  const res = NextResponse.redirect(buildAuthUrl(state))
  res.cookies.set('g_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
