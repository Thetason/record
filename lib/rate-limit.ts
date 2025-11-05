import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

// Rate limiter 인스턴스 생성
export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 60초
  });

  return {
    check: (req: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCache.set(token, [tokenCount[0] + 1]);
        }
        
        const currentUsage = (tokenCache.get(token) as number[])[0];
        const isRateLimited = currentUsage > limit;
        
        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
}

// IP 주소 추출 헬퍼
export function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

// Rate limit 응답 헬퍼
export function rateLimitResponse(retryAfter: number = 60) {
  return NextResponse.json(
    { 
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retryAfter 
    },
    { 
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
      }
    }
  );
}

// API별 rate limit 설정
export const apiLimits = {
  // 인증 관련
  login: 5,        // 분당 5회
  signup: 3,       // 분당 3회
  resetPassword: 3, // 분당 3회
  
  // 데이터 조회
  read: 100,       // 분당 100회
  
  // 데이터 생성/수정
  write: 30,       // 분당 30회
  upload: 10,      // 분당 10회
  
  // OCR
  ocr: 20,         // 분당 20회 (대량 업로드 지원)
  
  // 결제
  payment: 5,      // 분당 5회
  
  // 기본값
  default: 60      // 분당 60회
};