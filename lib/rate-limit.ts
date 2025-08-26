// 메모리 기반 Rate Limiting (프로덕션에서는 Redis 사용 권장)
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitResult {
  success: boolean
  count: number
  limit: number
  remaining: number
  retryAfter?: number
}

export async function rateLimit(
  identifier: string,
  limit: number = 60,
  window: number = 60000 // 1분
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - window
  
  // 기존 요청 정보 가져오기
  const current = requests.get(identifier)
  
  // 윈도우가 지났으면 초기화
  if (!current || current.resetTime <= windowStart) {
    requests.set(identifier, { count: 1, resetTime: now + window })
    return {
      success: true,
      count: 1,
      limit,
      remaining: limit - 1
    }
  }
  
  // 제한 초과 확인
  if (current.count >= limit) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return {
      success: false,
      count: current.count,
      limit,
      remaining: 0,
      retryAfter
    }
  }
  
  // 카운트 증가
  current.count++
  requests.set(identifier, current)
  
  return {
    success: true,
    count: current.count,
    limit,
    remaining: limit - current.count
  }
}

// 정기적으로 오래된 항목 정리
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requests.entries()) {
    if (value.resetTime < now) {
      requests.delete(key)
    }
  }
}, 60000) // 1분마다 정리