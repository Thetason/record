import { existsSync } from 'fs'
import { getLemonCheckoutUrl } from './lemonsqueezy'

export type ReadinessStatus = 'ok' | 'warn' | 'error' | 'disabled'

export type ReadinessCheck = {
  status: ReadinessStatus
  message: string
}

export type LaunchReadinessReport = {
  mode: 'development' | 'production'
  overallStatus: 'ok' | 'degraded' | 'error'
  checks: {
    database: ReadinessCheck
    authSecret: ReadinessCheck
    authUrl: ReadinessCheck
    publicUrl: ReadinessCheck
    healthToken: ReadinessCheck
    ocr: ReadinessCheck
    payments: ReadinessCheck
    email: ReadinessCheck
  }
  criticalFailures: string[]
  warnings: string[]
}

type LaunchReadinessInput = {
  databaseReachable: boolean
  databaseError?: string | null
}

function isTruthyEnv(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

function looksLikePlaceholder(value: string | undefined) {
  if (!value) return false

  const normalized = value.trim().toLowerCase()
  const patterns = [
    'placeholder',
    'changeme',
    'change-me',
    'example',
    'sample',
    'dummy',
    'dev_secret',
    'your-',
    'replace-',
  ]

  return (
    patterns.some((pattern) => normalized.includes(pattern)) ||
    normalized.startsWith('ci-')
  )
}

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    ''
  )
}

function getDatabaseProtocolLabel(databaseUrl: string) {
  if (!databaseUrl) return 'missing'
  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    return 'postgres'
  }
  if (databaseUrl.startsWith('file:')) {
    return 'sqlite'
  }
  return 'unknown'
}

export function buildLaunchReadiness({
  databaseReachable,
  databaseError
}: LaunchReadinessInput): LaunchReadinessReport {
  const mode: LaunchReadinessReport['mode'] =
    process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const isProduction = mode === 'production'
  const criticalFailures: string[] = []
  const warnings: string[] = []

  const databaseUrl = getDatabaseUrl()
  const databaseProtocol = getDatabaseProtocolLabel(databaseUrl)

  const checks: LaunchReadinessReport['checks'] = {
    database: {
      status: 'ok',
      message: '데이터베이스 연결이 정상입니다.'
    },
    authSecret: {
      status: 'ok',
      message: 'NEXTAUTH_SECRET이 설정되어 있습니다.'
    },
    authUrl: {
      status: 'ok',
      message: 'NEXTAUTH_URL이 현재 런타임과 호환됩니다.'
    },
    publicUrl: {
      status: 'ok',
      message: 'NEXT_PUBLIC_URL이 설정되어 있습니다.'
    },
    healthToken: {
      status: 'ok',
      message: 'HEALTHCHECK_TOKEN이 설정되어 있습니다.'
    },
    ocr: {
      status: 'disabled',
      message: 'OCR이 비활성화되어 있습니다.'
    },
    payments: {
      status: 'warn',
      message: '결제 공급자 설정이 아직 확인되지 않았습니다.'
    },
    email: {
      status: 'disabled',
      message: '이메일 발송이 비활성화되어 있습니다.'
    }
  }

  if (!databaseReachable) {
    checks.database = {
      status: 'error',
      message: databaseError || '데이터베이스에 연결할 수 없습니다.'
    }
    criticalFailures.push('database')
  } else if (isProduction && databaseProtocol !== 'postgres') {
    checks.database = {
      status: 'error',
      message: `프로덕션에서는 PostgreSQL 연결이 필요합니다. 현재: ${databaseProtocol}`
    }
    criticalFailures.push('database')
  } else if (!databaseUrl) {
    checks.database = {
      status: 'error',
      message: 'DATABASE_URL 계열 환경 변수가 없습니다.'
    }
    criticalFailures.push('database')
  } else if (isProduction && (databaseUrl.includes('localhost') || looksLikePlaceholder(databaseUrl))) {
    checks.database = {
      status: 'error',
      message: '프로덕션 DB URL이 localhost 또는 placeholder 값으로 보입니다.'
    }
    criticalFailures.push('database')
  }

  const authSecret = process.env.NEXTAUTH_SECRET
  if (!isTruthyEnv(authSecret)) {
    checks.authSecret = {
      status: 'error',
      message: 'NEXTAUTH_SECRET이 없습니다.'
    }
    criticalFailures.push('authSecret')
  } else if (authSecret!.trim().length < 32) {
    checks.authSecret = {
      status: 'error',
      message: 'NEXTAUTH_SECRET은 최소 32자 이상이어야 합니다.'
    }
    criticalFailures.push('authSecret')
  } else if (isProduction && looksLikePlaceholder(authSecret)) {
    checks.authSecret = {
      status: 'error',
      message: '프로덕션에서 placeholder 형태의 NEXTAUTH_SECRET을 사용 중입니다.'
    }
    criticalFailures.push('authSecret')
  } else if (isProduction && authSecret?.includes('dev_secret')) {
    checks.authSecret = {
      status: 'error',
      message: '프로덕션에서 개발용 NEXTAUTH_SECRET을 사용 중입니다.'
    }
    criticalFailures.push('authSecret')
  }

  const authUrl = process.env.NEXTAUTH_URL
  if (!isTruthyEnv(authUrl)) {
    checks.authUrl = {
      status: 'error',
      message: 'NEXTAUTH_URL이 없습니다.'
    }
    criticalFailures.push('authUrl')
  } else if (isProduction && (!authUrl!.startsWith('https://') || authUrl!.includes('localhost'))) {
    checks.authUrl = {
      status: 'error',
      message: '프로덕션 NEXTAUTH_URL은 https 도메인이어야 합니다.'
    }
    criticalFailures.push('authUrl')
  } else if (!isProduction && authUrl!.startsWith('http://localhost')) {
    checks.authUrl = {
      status: 'ok',
      message: '개발 환경용 NEXTAUTH_URL이 설정되어 있습니다.'
    }
  }

  const publicUrl = process.env.NEXT_PUBLIC_URL
  if (!isTruthyEnv(publicUrl)) {
    checks.publicUrl = {
      status: isProduction ? 'error' : 'warn',
      message: 'NEXT_PUBLIC_URL이 없습니다.'
    }
    if (isProduction) {
      criticalFailures.push('publicUrl')
    } else {
      warnings.push('publicUrl')
    }
  } else if (isProduction && (!publicUrl!.startsWith('https://') || publicUrl!.includes('localhost'))) {
    checks.publicUrl = {
      status: 'error',
      message: '프로덕션 NEXT_PUBLIC_URL은 https 도메인이어야 합니다.'
    }
    criticalFailures.push('publicUrl')
  } else if (isProduction && authUrl && new URL(publicUrl!).origin !== new URL(authUrl!).origin) {
    checks.publicUrl = {
      status: 'error',
      message: '프로덕션 NEXT_PUBLIC_URL과 NEXTAUTH_URL의 origin이 일치해야 합니다.'
    }
    criticalFailures.push('publicUrl')
  }

  const healthToken = process.env.HEALTHCHECK_TOKEN
  if (!isTruthyEnv(healthToken)) {
    checks.healthToken = {
      status: isProduction ? 'error' : 'warn',
      message: 'HEALTHCHECK_TOKEN이 없습니다.'
    }
    if (isProduction) {
      criticalFailures.push('healthToken')
    } else {
      warnings.push('healthToken')
    }
  } else if (healthToken!.length < 24) {
    checks.healthToken = {
      status: isProduction ? 'error' : 'warn',
      message: 'HEALTHCHECK_TOKEN은 더 길고 예측 불가능한 값이어야 합니다.'
    }
    if (isProduction) {
      criticalFailures.push('healthToken')
    } else {
      warnings.push('healthToken')
    }
  } else if (isProduction && looksLikePlaceholder(healthToken)) {
    checks.healthToken = {
      status: 'error',
      message: '프로덕션 HEALTHCHECK_TOKEN이 placeholder 값으로 보입니다.'
    }
    criticalFailures.push('healthToken')
  }

  const ocrEnabled = process.env.ENABLE_OCR !== 'false'
  if (!ocrEnabled) {
    checks.ocr = {
      status: 'disabled',
      message: 'ENABLE_OCR=false 로 비활성화되어 있습니다.'
    }
  } else if (isTruthyEnv(process.env.GOOGLE_VISION_API_KEY)) {
    checks.ocr = {
      status: 'ok',
      message: 'Base64 Google Vision 자격 증명이 설정되어 있습니다.'
    }
  } else if (isTruthyEnv(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS as string
    if (existsSync(credentialsPath)) {
      checks.ocr = {
        status: 'ok',
        message: 'Google Vision 자격 증명 파일 경로가 유효합니다.'
      }
    } else {
      checks.ocr = {
        status: isProduction ? 'error' : 'warn',
        message: `Google Vision 자격 증명 파일을 찾을 수 없습니다: ${credentialsPath}`
      }
      if (isProduction) {
        criticalFailures.push('ocr')
      } else {
        warnings.push('ocr')
      }
    }
  } else {
    checks.ocr = {
      status: isProduction ? 'error' : 'warn',
      message: 'Google Vision 자격 증명이 없습니다. 운영 OCR이 동작하지 않습니다.'
    }
    if (isProduction) {
      criticalFailures.push('ocr')
    } else {
      warnings.push('ocr')
    }
  }

  const hasLemonHostedCheckout =
    Boolean(getLemonCheckoutUrl('premium', 'monthly')) &&
    Boolean(getLemonCheckoutUrl('pro', 'monthly'))
  const hasLemonLegacyApi =
    isTruthyEnv(process.env.LEMONSQUEEZY_API_KEY) &&
    isTruthyEnv(process.env.LEMONSQUEEZY_STORE_ID)
  const hasLemonWebhookSecret = isTruthyEnv(process.env.LEMONSQUEEZY_SIGNING_SECRET)
  const hasLemon = (hasLemonHostedCheckout || hasLemonLegacyApi) && hasLemonWebhookSecret
  const hasPolar =
    isTruthyEnv(process.env.POLAR_ACCESS_TOKEN) &&
    isTruthyEnv(process.env.POLAR_ORGANIZATION_ID) &&
    isTruthyEnv(process.env.POLAR_PREMIUM_PRODUCT_ID) &&
    isTruthyEnv(process.env.POLAR_BUSINESS_PRODUCT_ID)

  if (hasLemon || hasPolar) {
    const lemonPlaceholder =
      looksLikePlaceholder(process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_CHECKOUT_URL) ||
      looksLikePlaceholder(process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_CHECKOUT_URL) ||
      looksLikePlaceholder(process.env.LEMONSQUEEZY_API_KEY) ||
      looksLikePlaceholder(process.env.LEMONSQUEEZY_STORE_ID) ||
      looksLikePlaceholder(process.env.LEMONSQUEEZY_SIGNING_SECRET)
    const polarPlaceholder =
      looksLikePlaceholder(process.env.POLAR_ACCESS_TOKEN) ||
      looksLikePlaceholder(process.env.POLAR_ORGANIZATION_ID) ||
      looksLikePlaceholder(process.env.POLAR_PREMIUM_PRODUCT_ID) ||
      looksLikePlaceholder(process.env.POLAR_BUSINESS_PRODUCT_ID)

    if (isProduction && ((hasLemon && lemonPlaceholder) || (hasPolar && polarPlaceholder))) {
      checks.payments = {
        status: 'error',
        message: '프로덕션 결제 환경 변수가 placeholder 값으로 보입니다.'
      }
      criticalFailures.push('payments')
    } else {
      checks.payments = {
        status: 'ok',
        message: hasLemon
          ? 'LemonSqueezy 결제 설정이 감지되었습니다.'
          : 'Polar 결제 설정이 감지되었습니다.'
      }
    }
  } else {
    checks.payments = {
      status: 'warn',
      message: '결제 공급자 환경 변수가 아직 완성되지 않았습니다.'
    }
    warnings.push('payments')
  }

  if (isTruthyEnv(process.env.RESEND_API_KEY) || isTruthyEnv(process.env.SENDGRID_API_KEY)) {
    if (
      isProduction &&
      (looksLikePlaceholder(process.env.RESEND_API_KEY) || looksLikePlaceholder(process.env.SENDGRID_API_KEY))
    ) {
      checks.email = {
        status: 'error',
        message: '프로덕션 이메일 공급자 키가 placeholder 값으로 보입니다.'
      }
      criticalFailures.push('email')
    } else {
      checks.email = {
        status: 'ok',
        message: '이메일 발송 공급자가 설정되어 있습니다.'
      }
    }
  } else if (process.env.ENABLE_EMAIL === 'false') {
    checks.email = {
      status: 'disabled',
      message: '이메일 발송이 비활성화되어 있습니다.'
    }
  } else {
    checks.email = {
      status: 'warn',
      message: '이메일 발송 공급자가 설정되지 않았습니다.'
    }
    warnings.push('email')
  }

  const overallStatus =
    criticalFailures.length > 0 ? 'error' : warnings.length > 0 ? 'degraded' : 'ok'

  return {
    mode,
    overallStatus,
    checks,
    criticalFailures,
    warnings
  }
}
