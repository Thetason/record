import { NextRequest } from 'next/server'
import { rateLimit, rateLimitResponse } from './rate-limit'

// CORS 설정
const envOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([
  'https://record-rho.vercel.app',
  'https://re-cord.co.kr',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
  ...envOrigins,
]));

export function corsHeaders(origin?: string) {
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// API 보안 헤더
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
  }
}

const sharedRateLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 1000,
})

// Rate limiting 적용
export async function withRateLimit(req: NextRequest, identifier: string, limit = 60) {
  try {
    await sharedRateLimiter.check(req, limit, identifier)
    return null
  } catch {
    const response = rateLimitResponse()
    const origin = req.headers.get('origin') || undefined

    Object.entries({
      ...corsHeaders(origin),
      ...securityHeaders(),
    }).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

// 입력 검증
type Validator = (value: unknown) => boolean

export function validateInput(
  data: Record<string, unknown>,
  rules: Record<string, Validator>
) {
  const errors: string[] = []
  
  for (const [field, validator] of Object.entries(rules)) {
    if (!validator(data[field])) {
      errors.push(`Invalid ${field}`)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// SQL Injection 방지를 위한 입력 정제
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // XSS 방지
    .replace(/['"\\]/g, '') // SQL Injection 기본 방지
    .trim()
    .slice(0, 1000) // 최대 길이 제한
}
