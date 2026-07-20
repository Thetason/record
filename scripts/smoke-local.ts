import { spawn, type ChildProcess } from 'child_process'

const port = Number(process.env.SMOKE_PORT || 3016)
const baseUrl = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`
const shouldBootServer = process.env.SMOKE_SKIP_BOOT !== 'true'
const shouldPrepDatabase = process.env.SMOKE_SKIP_PREP !== 'true'
const startupTimeoutMs = 60_000
const devScript = process.env.SMOKE_DEV_SCRIPT || 'dev:smoke'
const loginUsername = process.env.SMOKE_LOGIN_USERNAME || 'stylist-demo'
const loginPassword = process.env.SMOKE_LOGIN_PASSWORD || 'Syb20201234!'
const prepScripts = (process.env.SMOKE_PREP_SCRIPTS || 'db:push:smoke,seed:demo:smoke')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const endpoints = [
  { path: '/', expectedStatus: 200, label: 'home' },
  { path: '/api/health', expectedStatus: 200, label: 'health' },
  { path: '/api/profile/stylist-demo?increment=false', expectedStatus: 200, label: 'demo profile api' },
  { path: '/stylist-demo/review-request', expectedStatus: 200, label: 'review request page' },
  { path: '/migration-request?audience=%ED%97%A4%EC%96%B4%EB%94%94%EC%9E%90%EC%9D%B4%EB%84%88&platform=%EB%84%A4%EC%9D%B4%EB%B2%84&method=%ED%99%94%EB%A9%B4%20%EB%85%B9%ED%99%94%201%EA%B0%9C&from=smoke-local', expectedStatus: 200, label: 'migration request page' },
]

let serverProcess: ChildProcess | null = null
let recentLogs = ''

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
      if (name) {
        this.cookies.set(name, value)
      }
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

function appendLog(chunk: Buffer | string) {
  const text = chunk.toString()
  recentLogs = `${recentLogs}${text}`.slice(-12_000)
}

async function runNpmScript(scriptName: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npm', ['run', scriptName], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout?.on('data', appendLog)
    child.stderr?.on('data', appendLog)
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${scriptName} failed with exit code ${code}\n${recentLogs}`))
    })
  })
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < startupTimeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) {
        return
      }
    } catch {
      // server still starting
    }

    if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
      throw new Error(`개발 서버가 조기 종료되었습니다.\n${recentLogs}`)
    }

    await delay(1_000)
  }

  throw new Error(`개발 서버 시작 타임아웃 (${startupTimeoutMs}ms).\n${recentLogs}`)
}

async function verifyEndpoints() {
  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint.path}`)
    if (response.status !== endpoint.expectedStatus) {
      const body = await response.text()
      throw new Error(
        `${endpoint.label} 실패: ${endpoint.path} -> ${response.status} (expected ${endpoint.expectedStatus})\n${body.slice(0, 1000)}`
      )
    }
  }
}

async function verifyDirectReviewSubmission() {
  const reviewPayload = {
    customerName: `smoke-${Date.now()}`,
    serviceName: '레이어드컷',
    reviewContent: '상담이 꼼꼼했고 결과도 만족스러워서 다시 방문하고 싶은 후기입니다.',
    contact: 'smoke-test'
  }

  const response = await fetch(`${baseUrl}/api/public/reviews/stylist-demo`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(reviewPayload),
  })

  if (response.status !== 200) {
    const body = await response.text()
    throw new Error(`direct review submit failed: ${response.status}\n${body.slice(0, 1000)}`)
  }
}

async function verifyMigrationRequestSubmission() {
  const payload = {
    name: `smoke-migration-${Date.now()}`,
    email: `smoke-migration-${Date.now()}@example.com`,
    audience: '헤어디자이너',
    platforms: ['네이버', '당근'],
    reviewCount: '17',
    preferredMethod: '스크린샷 업로드',
    currentProfileUrl: 'https://example.com/profile',
    message: '이관 요청 smoke test입니다. 새 링크 발행 흐름만 확인합니다.',
    source: 'smoke-local'
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

async function verifyAuthenticatedArea() {
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
}

async function main() {
  try {
    if (shouldBootServer && shouldPrepDatabase) {
      for (const scriptName of prepScripts) {
        await runNpmScript(scriptName)
      }
    }

    if (shouldBootServer) {
      // The smoke flow uses a dedicated SQLite database so it never mutates the main dev.db.
      serverProcess = spawn('npm', ['run', devScript], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: String(port),
        },
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      serverProcess.stdout?.on('data', appendLog)
      serverProcess.stderr?.on('data', appendLog)
    }

    await waitForServer()
    await verifyEndpoints()
    await verifyDirectReviewSubmission()
    await verifyMigrationRequestSubmission()
    await verifyAuthenticatedArea()

    console.log(
      JSON.stringify(
        {
          status: 'ok',
          baseUrl,
          checked: [
            ...endpoints.map((endpoint) => endpoint.path),
            'POST /api/public/reviews/stylist-demo',
            'POST /api/migration-requests',
            '/api/auth/csrf',
            '/api/auth/session',
            '/api/dashboard/stats'
          ],
        },
        null,
        2
      )
    )
  } finally {
    if (serverProcess && serverProcess.exitCode === null && serverProcess.pid) {
      try {
        process.kill(-serverProcess.pid, 'SIGTERM')
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException
        if (nodeError.code !== 'ESRCH') {
          throw error
        }
      }
      await delay(1_000)

      if (serverProcess.exitCode === null) {
        try {
          process.kill(-serverProcess.pid, 'SIGKILL')
        } catch (error) {
          const nodeError = error as NodeJS.ErrnoException
          if (nodeError.code !== 'ESRCH') {
            throw error
          }
        }
      }
    }
  }
}

main().catch((error) => {
  console.error('smoke test failed:', error)
  process.exit(1)
})
