import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { baseUrl, exchangeCode, googleConfigured } from '@/lib/google-business'

// OAuth redirect target. Exchanges the code and parks the access token in a
// short-lived httpOnly cookie — never persisted, never visible to the client
// JS. The import page then calls /api/google/reviews to pull everything.
export async function GET(req: NextRequest) {
  const to = (q: string) => NextResponse.redirect(`${baseUrl()}/dashboard/import?google=${q}`)
  if (!googleConfigured()) return to('unconfigured')

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expected = req.cookies.get('g_oauth_state')?.value

  if (!code || !state || !expected || state !== expected) {
    return to('denied')
  }

  const token = await exchangeCode(code)
  if (!token) return to('error')

  const res = to('connected')
  res.cookies.set('g_oauth_state', '', { maxAge: 0, path: '/' })
  res.cookies.set('g_access_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 900, // one import session; not stored anywhere else
    path: '/',
  })
  return res
}
