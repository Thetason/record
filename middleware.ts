import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
    const isApiAdminPath = req.nextUrl.pathname.startsWith('/api/admin')
    
    // 관리자 경로 접근 시 권한 체크
    if ((isAdminPath || isApiAdminPath) && token) {
      // role이 admin 또는 super_admin이 아니면 접근 거부
      if (token.role !== 'admin' && token.role !== 'super_admin') {
        if (isApiAdminPath) {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden' }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          )
        }
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/reviews/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ]
}