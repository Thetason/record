import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const MAX_BODY_SIZE_BYTES = Number(process.env.API_BODY_LIMIT_BYTES ?? 10_485_760); // 10MB 기본값 (이미지 OCR용)
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/api') &&
    METHODS_WITH_BODY.has(request.method)
  ) {
    const contentLength = request.headers.get('content-length');
    const bodySize = contentLength ? Number(contentLength) : 0;

    if (!Number.isNaN(bodySize) && bodySize > MAX_BODY_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: '요청 본문이 허용된 용량을 초과했습니다.',
          limit: MAX_BODY_SIZE_BYTES
        },
        { status: 413 }
      );
    }
  }

  const response = NextResponse.next();
  
  // CORS 헤더 설정
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXTAUTH_URL || ''
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Preflight 요청 처리
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  // 보안 헤더 추가
  // X-Frame-Options is intentionally omitted so CSP controls iframe embedding.
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP (Content Security Policy) 설정
  const allowedFrameAncestors = [
    "'self'",
    'https://record-ebon.vercel.app',
    'https://www.record-ebon.vercel.app',
    'https://re-cord.kr',
    'https://www.re-cord.kr'
  ].join(' ');

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.resend.com",
    "worker-src 'self' blob:",
    `frame-ancestors ${allowedFrameAncestors}`,
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // 인증이 필요한 경로 보호
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  
  // 보호된 경로들
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/profile',
    '/settings'
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // 관리자 전용 경로
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  
  // 인증되지 않은 사용자가 보호된 경로 접근 시
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 인증된 사용자가 인증 페이지 접근 시
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 관리자 권한 확인
  if (
    isAdminPath &&
    token?.role !== 'admin' &&
    token?.role !== 'super_admin'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
