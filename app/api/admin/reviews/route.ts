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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 필터 조건 설정
    let where: Prisma.ReviewWhereInput = {}
    
    if (status !== 'all') {
      if (status === 'flagged') {
        where = {
          reports: {
            some: {
              status: 'pending'
            }
          }
        }
      } else {
        where = {
          verificationStatus: status
        }
      }
    }

    // 리뷰 조회
    const [reviews] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              plan: true
            }
          },
          _count: {
            select: {
              reports: true
            }
          }
        },
        orderBy: [
          // 신고된 리뷰 우선
          {
            reports: {
              _count: 'desc'
            }
          },
          // 대기중인 리뷰 우선
          {
            verificationStatus: 'asc'
          },
          // 최신순
          {
            createdAt: 'desc'
          }
        ],
        skip,
        take: limit
      })
    ])

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
