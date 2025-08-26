import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    const where = status === 'all' ? {} : { status }

    const [payments, totalStats, monthlyStats] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.payment.aggregate({
        where: { status: 'DONE' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          status: 'DONE',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      })
    ])

    const totalPayments = await prisma.payment.count()
    const successPayments = await prisma.payment.count({ where: { status: 'DONE' } })

    const stats = {
      totalRevenue: totalStats._sum.amount || 0,
      monthlyRevenue: monthlyStats._sum.amount || 0,
      successRate: totalPayments > 0 ? (successPayments / totalPayments * 100) : 0,
      averageAmount: totalStats._count > 0 ? 
        (totalStats._sum.amount || 0) / totalStats._count : 0
    }

    return NextResponse.json({ payments, stats })
  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}