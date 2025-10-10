import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date().toISOString()

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'ok',
      checks: { database: 'ok' },
      timestamp: now,
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        checks: { database: 'unavailable' },
        timestamp: now,
      },
      { status: 503 },
    )
  }
}
