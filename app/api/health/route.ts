import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildLaunchReadiness } from '@/lib/launch-readiness'

function shouldExposeDetailedHealth(request: Request) {
  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  const token = process.env.HEALTHCHECK_TOKEN
  if (!token) {
    return false
  }

  const headerToken =
    request.headers.get('x-health-token') ||
    request.headers.get('x-healthcheck-token')
  return headerToken === token
}

export async function GET(request: Request) {
  const now = new Date().toISOString()
  const includeDetails = shouldExposeDetailedHealth(request)

  try {
    await prisma.$queryRaw`SELECT 1`
    const readiness = buildLaunchReadiness({ databaseReachable: true })

    return NextResponse.json(
      {
        status: readiness.overallStatus,
        mode: readiness.mode,
        timestamp: now,
        ...(includeDetails
          ? {
              checks: readiness.checks,
              criticalFailures: readiness.criticalFailures,
              warnings: readiness.warnings,
            }
          : {}),
      },
      { status: readiness.overallStatus === 'error' ? 503 : 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    const readiness = buildLaunchReadiness({
      databaseReachable: false,
      databaseError: error instanceof Error ? error.message : 'Database unavailable'
    })

    return NextResponse.json(
      {
        status: readiness.overallStatus,
        mode: readiness.mode,
        timestamp: now,
        ...(includeDetails
          ? {
              checks: readiness.checks,
              criticalFailures: readiness.criticalFailures,
              warnings: readiness.warnings,
            }
          : {}),
      },
      { status: 503 },
    )
  }
}
