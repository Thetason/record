import { NextResponse } from 'next/server'

import { getLaunchOfferSnapshot } from '@/lib/launch-offer'

export async function GET() {
  try {
    const snapshot = await getLaunchOfferSnapshot()
    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Failed to fetch launch offer snapshot:', error)
    return NextResponse.json({ error: 'Failed to fetch launch offer' }, { status: 500 })
  }
}
