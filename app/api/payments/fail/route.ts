import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const message = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  console.error('결제 실패:', { code, message, orderId })

  // 실패 페이지로 리다이렉트
  return NextResponse.redirect(
    new URL(`/payment/fail?code=${code}&message=${encodeURIComponent(message || '')}`, req.url)
  )
}