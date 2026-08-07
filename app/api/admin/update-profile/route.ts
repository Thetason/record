import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin-only: overwrite a user's bio. The middleware role gate only covers
// /admin page paths, so API routes must re-check the role from the DB
// themselves (same pattern as /api/admin/users and /api/admin/stats).
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { username, bio } = await request.json()

    if (typeof username !== 'string' || typeof bio !== 'string' || !username || !bio) {
      return NextResponse.json({ error: 'username과 bio가 필요합니다' }, { status: 400 })
    }
    if (bio.length > 500) {
      return NextResponse.json({ error: 'bio는 500자 이내여야 합니다' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { username },
      data: { bio },
    })

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        bio: user.bio,
      },
    })
  } catch (error) {
    console.error('프로필 업데이트 오류:', error)
    return NextResponse.json({ error: '프로필 업데이트 실패' }, { status: 500 })
  }
}
