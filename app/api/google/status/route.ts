import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { googleConfigured } from '@/lib/google-business'

// UI gate: the one-click Google card only renders when OAuth env is present,
// so shipping this before API approval is harmless.
export async function GET() {
  return NextResponse.json({ configured: googleConfigured() })
}
