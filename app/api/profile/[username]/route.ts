import { NextRequest, NextResponse } from 'next/server'
import { fetchPublicProfile } from '@/lib/profile'
import { fetchLivePublicProfile, shouldUseLivePublicProfile } from '@/lib/live-public-profile'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const incrementView = _req.nextUrl.searchParams.get('increment') !== 'false'

    const result = await fetchPublicProfile(username, {
      incrementView,
      includeDemoFallback: false
    })

    if (!result.ok && result.status === 404 && shouldUseLivePublicProfile(username)) {
      const liveProfile = await fetchLivePublicProfile(username)

      if (liveProfile) {
        return NextResponse.json({
          profile: liveProfile,
          user: liveProfile,
          username: liveProfile.username,
          truncated: false
        })
      }
    }

    if (!result.ok) {
      const code =
        result.status === 404
          ? 'PROFILE_NOT_FOUND'
          : result.status >= 500
          ? 'PROFILE_UNAVAILABLE'
          : 'INVALID_USERNAME'

      return NextResponse.json(
        { error: result.message, code },
        { status: result.status }
      )
    }

    return NextResponse.json({
      profile: result.profile,
      user: result.profile,
      username: result.normalizedUsername,
      truncated: result.truncated
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: '프로필을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
