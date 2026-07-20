export type MigrationRequestPayload = {
  name: string
  email: string
  phone?: string
  audience: string
  platforms: string[]
  reviewCount?: string
  preferredMethod: string
  preferredContact?: string
  urgency?: string
  materials?: string[]
  currentProfileUrl?: string
  message: string
  source?: string
}

export type ParsedMigrationRequest = {
  summary: Record<string, string>
  message: string
}

const FIELD_LABELS: Record<string, string> = {
  name: '이름',
  email: '이메일',
  phone: '전화번호',
  audience: '직군',
  platforms: '플랫폼',
  reviewCount: '예상 리뷰 수',
  preferredMethod: '선호 방식',
  preferredContact: '선호 연락 방식',
  urgency: '시급도',
  materials: '현재 보유 자료',
  currentProfileUrl: '현재 링크',
  source: '유입 경로'
}

const SOURCE_LABELS: Record<string, string> = {
  direct: '직접 접속',
  'public-page': '공개 페이지',
  hero: '메인 히어로',
  'home-import': '홈 - 이전 후기 보관',
  'home-how-it-works': '홈 - 사용 방법',
  'home-bottom-cta': '홈 - 하단 CTA',
  'guide-hero': '가이드 상단',
  'guide-import': '가이드 - 이관 안내',
  'pricing-offer': '가격 페이지',
  'hair-landing': '헤어 랜딩',
  'pt-landing': 'PT 랜딩',
  'kmong-landing': '크몽 랜딩',
}

function displayValue(value?: string) {
  return value && value.trim() ? value.trim() : '미입력'
}

export function buildMigrationRequestDescription(payload: MigrationRequestPayload) {
  const metadata = {
    name: displayValue(payload.name),
    email: displayValue(payload.email),
    phone: displayValue(payload.phone),
    audience: displayValue(payload.audience),
    platforms: payload.platforms.length > 0 ? payload.platforms.join(', ') : '미입력',
    reviewCount: displayValue(payload.reviewCount),
    preferredMethod: displayValue(payload.preferredMethod),
    preferredContact: displayValue(payload.preferredContact),
    urgency: displayValue(payload.urgency),
    materials: payload.materials && payload.materials.length > 0 ? payload.materials.join(', ') : '미입력',
    currentProfileUrl: displayValue(payload.currentProfileUrl),
    source: displayValue(payload.source || 'direct')
  }

  const metadataLines = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`)

  return [
    '[MIGRATION_REQUEST]',
    ...metadataLines,
    '[/MIGRATION_REQUEST]',
    '',
    '[상세 요청]',
    payload.message.trim()
  ].join('\n')
}

export function parseMigrationRequestDescription(description: string): ParsedMigrationRequest | null {
  const startToken = '[MIGRATION_REQUEST]'
  const endToken = '[/MIGRATION_REQUEST]'
  const startIndex = description.indexOf(startToken)
  const endIndex = description.indexOf(endToken)

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null
  }

  const metadataBlock = description
    .slice(startIndex + startToken.length, endIndex)
    .trim()

  const summary: Record<string, string> = {}
  for (const line of metadataBlock.split('\n')) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (key) {
      summary[key] = value
    }
  }

  const messageStart = description.indexOf('[상세 요청]')
  const message = messageStart === -1
    ? description.slice(endIndex + endToken.length).trim()
    : description.slice(messageStart + '[상세 요청]'.length).trim()

  return {
    summary,
    message,
  }
}

export function getMigrationRequestFieldLabel(key: string) {
  return FIELD_LABELS[key] || key
}

export function getMigrationSourceLabel(value?: string) {
  if (!value) return '미입력'
  return SOURCE_LABELS[value] || value
}

export function getMigrationUrgencyLabel(value?: string) {
  switch (value) {
    case 'today':
      return '오늘 안에 필요'
    case 'this_week':
      return '이번 주 안에 필요'
    case 'this_month':
      return '이번 달 안에 필요'
    case 'exploring':
      return '일단 상담부터'
    default:
      return value || '미입력'
  }
}

export function getMigrationContactLabel(value?: string) {
  switch (value) {
    case 'email':
      return '이메일'
    case 'phone':
      return '전화'
    case 'kakao':
      return '카카오톡/문자'
    default:
      return value || '미입력'
  }
}
