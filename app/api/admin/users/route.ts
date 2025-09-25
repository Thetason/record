import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    // 관리자 권한 체크
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''

    // 필터 조건 설정
    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (filter === 'premium') {
      where.plan = { not: 'free' }
    } else if (filter === 'free') {
      where.plan = 'free'
    }

    // 사용자 조회
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            sessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 마지막 로그인 시간 조회 (최근 세션)
    const usersWithLastLogin = await Promise.all(
      users.map(async (user) => {
        const lastSession = await prisma.session.findFirst({
          where: { userId: user.id },
          orderBy: { expires: 'desc' },
          select: { expires: true }
        })

        return {
          ...user,
          lastLoginAt: lastSession?.expires || null
        }
      })
    )

    return NextResponse.json(usersWithLastLogin)
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
