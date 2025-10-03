import { NextRequest, NextResponse } from 'next/server'
import { fetchPublicProfile } from '@/lib/profile'

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const incrementView = _req.nextUrl.searchParams.get('increment') !== 'false'

    const result = await fetchPublicProfile(params.username, {
      incrementView,
      includeDemoFallback: true
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      )
    }

    return NextResponse.json(result.profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: '프로필을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
