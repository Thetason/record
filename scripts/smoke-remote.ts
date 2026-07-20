const baseUrl = (process.env.SMOKE_BASE_URL || '').trim()
const profileUsername = (process.env.SMOKE_PROFILE_USERNAME || 'stylist-demo').trim()
const healthToken = (process.env.SMOKE_HEALTH_TOKEN || process.env.HEALTHCHECK_TOKEN || '').trim()
const shouldWrite = process.env.SMOKE_REMOTE_WRITE === 'true'
const loginUsername = (process.env.SMOKE_LOGIN_USERNAME || '').trim()
const loginPassword = (process.env.SMOKE_LOGIN_PASSWORD || '').trim()

type EndpointCheck = {
  path: string
  expectedStatus: number
  label: string
  headers?: Record<string, string>
}

class CookieJar {
  private cookies = new Map<string, string>()

  mergeFromResponse(response: Response) {
    const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
    const setCookies = typeof getSetCookie === 'function'
      ? getSetCookie.call(response.headers)
      : splitSetCookieHeader(response.headers.get('set-cookie'))

    for (const cookieHeader of setCookies) {
      const [pair] = cookieHeader.split(';')
      const separatorIndex = pair.indexOf('=')
      if (separatorIndex === -1) {
        continue
      }

      const name = pair.slice(0, separatorIndex).trim()
      const value = pair.slice(separatorIndex + 1).trim()
      if (!name) {
        continue
      }
      this.cookies.set(name, value)
    }
  }

  toHeader() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }
}

function splitSetCookieHeader(headerValue: string | null) {
  if (!headerValue) {
    return []
  }

  return headerValue.split(/,(?=[^;]+=[^;]+)/g).map((value) => value.trim()).filter(Boolean)
}

function requireBaseUrl() {
  if (!baseUrl) {
    throw new Error('SMOKE_BASE_URL is required for smoke:remote')
  }
}

async function fetchWithJar(jar: CookieJar, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const cookieHeader = jar.toHeader()
  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    redirect: 'manual',
  })

  jar.mergeFromResponse(response)
  return response
}

async function expectEndpoint({ path, expectedStatus, label, headers }: EndpointCheck) {
  const response = await fetch(`${baseUrl}${path}`, { headers })
  if (response.status !== expectedStatus) {
    const body = await response.text()
    throw new Error(
      `${label} failed: ${path} -> ${response.status} (expected ${expectedStatus})\n${body.slice(0, 1000)}`
    )
  }

  return response
}

async function maybeSubmitDirectReview() {
  if (!shouldWrite) {
    return { skipped: true }
  }

  const payload = {
    customerName: `remote-smoke-${Date.now()}`,
    serviceName: '레이어드컷',
    reviewContent: '런칭 smoke test용 직접 후기입니다. 저장 및 moderation 흐름만 확인합니다.',
    contact: 'remote-smoke'
  }

  const response = await fetch(`${baseUrl}/api/public/reviews/${profileUsername}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (response.status !== 200) {
    const body = await response.text()
    throw new Error(`direct review submit failed: ${response.status}\n${body.slice(0, 1000)}`)
  }

  return { skipped: false }
}

async function maybeSubmitMigrationRequest() {
  if (!shouldWrite) {
    return { skipped: true }
  }

  const payload = {
    name: `remote-migration-${Date.now()}`,
    email: `remote-migration-${Date.now()}@example.com`,
    audience: '크몽 프리랜서',
    platforms: ['크몽', '네이버'],
    reviewCount: '25',
    preferredMethod: '리뷰 옮겨드림 상담',
    currentProfileUrl: 'https://example.com/profile',
    message: '원격 smoke test용 이관 요청입니다. 저장과 운영자 수신 흐름만 확인합니다.',
    source: 'smoke-remote',
  }

  const response = await fetch(`${baseUrl}/api/migration-requests`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (response.status !== 200) {
    const body = await response.text()
    throw new Error(`migration request submit failed: ${response.status}\n${body.slice(0, 1000)}`)
  }

  return { skipped: false }
}

async function maybeVerifyAuthenticatedArea() {
  if (!loginUsername || !loginPassword) {
    return { skipped: true as const }
  }

  const jar = new CookieJar()

  const csrfResponse = await fetchWithJar(jar, '/api/auth/csrf')
  if (csrfResponse.status !== 200) {
    throw new Error(`csrf fetch failed: ${csrfResponse.status}`)
  }

  const csrfPayload = await csrfResponse.json().catch(() => null)
  const csrfToken = typeof csrfPayload?.csrfToken === 'string' ? csrfPayload.csrfToken : null
  if (!csrfToken) {
    throw new Error(`csrf payload unexpected: ${JSON.stringify(csrfPayload)}`)
  }

  const callbackBody = new URLSearchParams({
    csrfToken,
    username: loginUsername,
    password: loginPassword,
    callbackUrl: `${baseUrl}/dashboard`,
    json: 'true',
  })

  const loginResponse = await fetchWithJar(jar, '/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: callbackBody.toString(),
  })

  if (loginResponse.status !== 200) {
    const body = await loginResponse.text()
    throw new Error(`credentials callback failed: ${loginResponse.status}\n${body.slice(0, 1000)}`)
  }

  const loginPayload = await loginResponse.json().catch(() => null)
  const loginUrl = typeof loginPayload?.url === 'string' ? loginPayload.url : ''
  if (!loginUrl || loginUrl.includes('error=')) {
    throw new Error(`credentials login failed: ${JSON.stringify(loginPayload)}`)
  }

  const sessionResponse = await fetchWithJar(jar, '/api/auth/session')
  if (sessionResponse.status !== 200) {
    throw new Error(`session fetch failed: ${sessionResponse.status}`)
  }

  const sessionPayload = await sessionResponse.json().catch(() => null)
  if (!sessionPayload?.user?.username || sessionPayload.user.username !== loginUsername) {
    throw new Error(`session payload unexpected: ${JSON.stringify(sessionPayload)}`)
  }

  const dashboardStatsResponse = await fetchWithJar(jar, '/api/dashboard/stats')
  if (dashboardStatsResponse.status !== 200) {
    const body = await dashboardStatsResponse.text()
    throw new Error(`dashboard stats failed: ${dashboardStatsResponse.status}\n${body.slice(0, 1000)}`)
  }

  const dashboardStatsPayload = await dashboardStatsResponse.json().catch(() => null)
  if (!dashboardStatsPayload?.overview || !dashboardStatsPayload?.subscription) {
    throw new Error(`dashboard stats payload unexpected: ${JSON.stringify(dashboardStatsPayload)}`)
  }

  return {
    skipped: false as const,
    username: loginUsername,
    checked: ['/api/auth/csrf', '/api/auth/session', '/api/dashboard/stats'],
  }
}

async function main() {
  requireBaseUrl()

  const checks: string[] = []
  const healthHeaders = healthToken ? { 'x-health-token': healthToken } : undefined

  const endpoints: EndpointCheck[] = [
    { path: '/', expectedStatus: 200, label: 'home' },
    { path: '/login', expectedStatus: 200, label: 'login' },
    { path: '/signup', expectedStatus: 200, label: 'signup' },
    { path: '/migration-request?audience=%ED%97%A4%EC%96%B4%EB%94%94%EC%9E%90%EC%9D%B4%EB%84%88&platform=%EB%84%A4%EC%9D%B4%EB%B2%84&method=%ED%99%94%EB%A9%B4%20%EB%85%B9%ED%99%94%201%EA%B0%9C&from=smoke-remote', expectedStatus: 200, label: 'migration request page' },
    { path: `/api/profile/${profileUsername}?increment=false`, expectedStatus: 200, label: 'profile api' },
    { path: `/${profileUsername}`, expectedStatus: 200, label: 'public profile' },
    { path: `/${profileUsername}/review-request`, expectedStatus: 200, label: 'review request page' },
    { path: '/api/health', expectedStatus: 200, label: 'health', headers: healthHeaders },
  ]

  for (const endpoint of endpoints) {
    await expectEndpoint(endpoint)
    checks.push(endpoint.path)
  }

  const healthResponse = await fetch(`${baseUrl}/api/health`, { headers: healthHeaders })
  const healthJson = await healthResponse.json().catch(() => null)
  if (!healthJson || !['ok', 'degraded'].includes(healthJson.status)) {
    throw new Error(`health payload unexpected: ${JSON.stringify(healthJson)}`)
  }

  const directReview = await maybeSubmitDirectReview()
  if (!directReview.skipped) {
    checks.push(`POST /api/public/reviews/${profileUsername}`)
  }

  const migrationRequest = await maybeSubmitMigrationRequest()
  if (!migrationRequest.skipped) {
    checks.push('POST /api/migration-requests')
  }

  const authSmoke = await maybeVerifyAuthenticatedArea()
  if (!authSmoke.skipped) {
    checks.push(...authSmoke.checked)
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        baseUrl,
        profileUsername,
        writeMode: shouldWrite,
        authMode: authSmoke.skipped ? 'skipped' : 'credentials',
        checked: checks,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error('remote smoke failed:', error)
  process.exit(1)
})
