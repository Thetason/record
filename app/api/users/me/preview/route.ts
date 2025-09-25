import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchPublicProfile } from '@/lib/profile'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.username) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const result = await fetchPublicProfile(session.user.username, {
    incrementView: false,
    includeDemoFallback: true
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status })
  }

  return NextResponse.json(result.profile)
}
