import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 },
  )
}
