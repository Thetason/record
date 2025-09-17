import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { ImageAnnotatorClient, protos } from '@google-cloud/vision'
import crypto from 'crypto'
import sharp from 'sharp'
import { LRUCache } from 'lru-cache'
import Tesseract from 'tesseract.js'
import cleanKoreanReview, { stripCommonNoiseLines as stripNoiseLocal } from '@/lib/text-clean'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

const cache = new LRUCache<string, OCRSuccessPayload>({ max: 500, ttl: 1000 * 60 * 60 * 24 * 7 })

let visionClient: ImageAnnotatorClient | null = null

class OCRRequestError extends Error {
  public readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'OCRRequestError'
    this.status = status
  }
}

type AnnotateImageResponse = protos.google.cloud.vision.v1.IAnnotateImageResponse
type EntityAnnotation = protos.google.cloud.vision.v1.IEntityAnnotation
type VisionVertex = protos.google.cloud.vision.v1.IVertex

interface ParsedImage {
  file: File
  buffer: Buffer
}

type ReviewPlatform = 'naver' | 'kakao' | 'instagram' | 'google' | 'unknown'

interface ParsedReview {
  platform: ReviewPlatform
  rating: number
  date: string
  author: string
  business?: string
  reviewText: string
}

interface OCRSuccessPayload extends ParsedReview {
  text: string
  rawText: string
  normalizedText: string
  confidence: number
  engine: 'google' | 'tesseract'
  postprocess: 'local' | 'service+local'
}

type OCRResponseBody =
  | { success: true; data: OCRSuccessPayload; cache?: boolean; mock?: boolean; message?: string }
  | { success: false; error: string }

const MOCK_PAYLOAD: OCRSuccessPayload = {
  platform: 'naver',
  rating: 5,
  date: '2024-12-15',
  author: '김고객',
  business: '레코드 필라테스',
  reviewText: '정말 만족스러운 서비스였습니다! 선생님이 너무 친절하시고 전문적이세요. 다음에도 꼭 다시 찾고 싶습니다.',
  text: '⭐⭐⭐⭐⭐ 5.0\n정말 만족스러운 서비스였습니다!\n선생님이 너무 친절하시고 전문적이세요.\n다음에도 꼭 다시 찾고 싶습니다.\n2024년 12월 15일\n네이버 리뷰',
  rawText: '⭐⭐⭐⭐⭐ 5.0\n정말 만족스러운 서비스였습니다!\n선생님이 너무 친절하시고 전문적이세요.\n다음에도 꼭 다시 찾고 싶습니다.\n2024년 12월 15일\n네이버 리뷰',
  normalizedText: '⭐⭐⭐⭐⭐ 5.0\n정말 만족스러운 서비스였습니다!\n선생님이 너무 친절하시고 전문적이세요.\n다음에도 꼭 다시 찾고 싶습니다.\n2024년 12월 15일\n네이버 리뷰',
  confidence: 0.95,
  engine: 'google',
  postprocess: 'local'
}
export async function POST(req: NextRequest) {
  let parsedImage: ParsedImage | null = null
  let cacheKey: string | null = null
  let processedBuffer: Buffer | null = null

  try {
    parsedImage = await parseImageFromRequest(req)
    cacheKey = createCacheKey(parsedImage.buffer)

    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json<OCRResponseBody>({ success: true, data: cached, cache: true })
    }

    processedBuffer = await preprocessImage(parsedImage.buffer)

    if (!isOcrEnabled()) {
      return respondWithMock()
    }

    const client = await getVisionClient()
    if (!client) {
      return respondWithMock()
    }

    const visionResult = await runVisionDetection(client, processedBuffer)
    let payload = visionResult ? await buildPayloadFromVision(visionResult) : null

    if (!payload) {
      payload = processedBuffer ? await runTesseractFallback(processedBuffer) : null
    }

    if (!payload) {
      throw new OCRRequestError('텍스트를 찾을 수 없습니다.', 422)
    }

    if (cacheKey) {
      cache.set(cacheKey, payload)
    }

    return NextResponse.json<OCRResponseBody>({ success: true, data: payload })
  } catch (error) {
    if (error instanceof OCRRequestError) {
      return NextResponse.json<OCRResponseBody>({ success: false, error: error.message }, { status: error.status })
    }

    console.error('OCR 처리 에러:', error)

    if (parsedImage) {
      const fallback = await runTesseractFallback(processedBuffer ?? parsedImage.buffer)
      if (fallback) {
        const key = cacheKey ?? createCacheKey(parsedImage.buffer)
        cache.set(key, fallback)
        return NextResponse.json<OCRResponseBody>({ success: true, data: fallback })
      }
    }

    return NextResponse.json<OCRResponseBody>({ success: false, error: 'OCR 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

async function parseImageFromRequest(req: NextRequest): Promise<ParsedImage> {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    throw new OCRRequestError('잘못된 요청 형식입니다.', 400)
  }

  const entry = formData.get('image')
  if (!entry) {
    throw new OCRRequestError('이미지가 필요합니다.', 400)
  }

  if (!(entry instanceof File)) {
    throw new OCRRequestError('이미지 파일 형식이 잘못되었습니다.', 400)
  }

  if (entry.size > MAX_FILE_SIZE) {
    throw new OCRRequestError('이미지 크기는 10MB 이하여야 합니다.', 400)
  }

  if (entry.type && !ALLOWED_IMAGE_TYPES.has(entry.type.toLowerCase())) {
    throw new OCRRequestError('지원되지 않는 이미지 형식입니다. (JPG, PNG, WebP 지원)', 415)
  }

  const buffer = Buffer.from(await entry.arrayBuffer())
  if (!buffer.length) {
    throw new OCRRequestError('비어있는 이미지입니다.', 400)
  }

  return { file: entry, buffer }
}

function isOcrEnabled(): boolean {
  return process.env.ENABLE_OCR !== 'false'
}

function respondWithMock(): NextResponse<OCRResponseBody> {
  return NextResponse.json({
    success: true,
    data: MOCK_PAYLOAD,
    mock: true,
    message: 'Google Vision API가 설정되지 않아 샘플 데이터를 반환합니다.'
  })
}
async function getVisionClient(): Promise<ImageAnnotatorClient | null> {
  if (visionClient) {
    return visionClient
  }

  try {
    if (process.env.GOOGLE_VISION_API_KEY) {
      const decoded = Buffer.from(process.env.GOOGLE_VISION_API_KEY, 'base64').toString('utf8')
      const credentials = JSON.parse(decoded) as { project_id?: string }
      visionClient = new ImageAnnotatorClient({
        credentials,
        projectId: credentials.project_id
      })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      visionClient = new ImageAnnotatorClient({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS })
    } else {
      return null
    }

    return visionClient
  } catch (error) {
    console.error('Google Vision API 클라이언트 초기화 실패:', error)
    return null
  }
}

function createCacheKey(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .grayscale()
      .normalize()
      .toBuffer()
  } catch (error) {
    console.warn('이미지 전처리 실패, 원본 사용:', error)
    return buffer
  }
}

async function runVisionDetection(client: ImageAnnotatorClient, buffer: Buffer): Promise<AnnotateImageResponse | null> {
  try {
    const [result] = await client.documentTextDetection({
      image: { content: buffer },
      imageContext: { languageHints: ['ko', 'en'] }
    })
    return result ?? null
  } catch (error) {
    console.error('Google Vision API 호출 실패:', error)
    return null
  }
}

async function buildPayloadFromVision(result: AnnotateImageResponse): Promise<OCRSuccessPayload | null> {
  const rawText = (rebuildReadingOrder(result) ?? result.fullTextAnnotation?.text ?? result.textAnnotations?.[0]?.description ?? '')
    .toString()
    .trim()

  if (!rawText) {
    return null
  }

  const normalized = refineSpacing(rawText)
  const denoised = stripNoiseLocal(normalized)

  const { cleaned, usedExternal } = await applyCleaning(denoised)
  const extracted = analyzeReviewText(denoised)
  const confidence = getPrimaryConfidence(result.textAnnotations)

  return {
    ...extracted,
    text: cleaned,
    rawText,
    normalizedText: cleaned,
    confidence,
    engine: 'google',
    postprocess: usedExternal ? 'service+local' : 'local'
  }
}

async function runTesseractFallback(buffer: Buffer): Promise<OCRSuccessPayload | null> {
  try {
    const result = await Tesseract.recognize(buffer, 'kor+eng')
    const rawText = (result?.data?.text ?? '').trim()
    if (!rawText) {
      return null
    }

    const normalized = refineSpacing(rawText)
    const denoised = stripNoiseLocal(normalized)
    const { cleaned, usedExternal } = await applyCleaning(denoised)
    const extracted = analyzeReviewText(denoised)

    return {
      ...extracted,
      text: cleaned,
      rawText,
      normalizedText: cleaned,
      confidence: 0.7,
      engine: 'tesseract',
      postprocess: usedExternal ? 'service+local' : 'local'
    }
  } catch (error) {
    console.error('Tesseract OCR 실패:', error)
    return null
  }
}

async function applyCleaning(text: string): Promise<{ cleaned: string; usedExternal: boolean }> {
  const serviceUrl = process.env.TEXT_CLEAN_SERVICE_URL
  if (!serviceUrl) {
    return { cleaned: cleanKoreanReview(text, { maskPII: true, strong: true }), usedExternal: false }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return { cleaned: cleanKoreanReview(text, { maskPII: true, strong: true }), usedExternal: false }
    }

    const json = (await response.json()) as { cleaned?: unknown; text?: unknown }
    const candidate = typeof json.cleaned === 'string' ? json.cleaned : typeof json.text === 'string' ? json.text : null
    if (!candidate) {
      return { cleaned: cleanKoreanReview(text, { maskPII: true, strong: true }), usedExternal: false }
    }

    return {
      cleaned: cleanKoreanReview(candidate, { maskPII: true, strong: true }),
      usedExternal: true
    }
  } catch (error) {
    console.warn('외부 텍스트 정규화 서비스 호출 실패:', error)
    return { cleaned: cleanKoreanReview(text, { maskPII: true, strong: true }), usedExternal: false }
  }
}

function getPrimaryConfidence(annotations?: EntityAnnotation[] | null): number {
  if (!annotations || annotations.length === 0) {
    return 0.9
  }

  const primary = annotations[0]
  if (typeof primary.confidence === 'number') {
    return primary.confidence
  }
  if (typeof primary.score === 'number') {
    return primary.score
  }
  return 0.9
}
function analyzeReviewText(text: string): ParsedReview {
  const normalized = normalizeText(text)
  const platform = detectPlatform(normalized)
  const rating = extractRating(normalized)
  const baseDate = extractDate(normalized)
  const baseAuthor = extractAuthor(normalized)

  if (platform === 'naver') {
    const parsed = parseNaver(normalized, baseAuthor, baseDate)
    return {
      platform,
      rating,
      date: parsed.date ?? baseDate,
      author: parsed.author ?? baseAuthor,
      business: parsed.business,
      reviewText: parsed.body ?? normalized
    }
  }

  if (platform === 'kakao') {
    const parsed = parseKakao(normalized, baseAuthor, baseDate)
    return {
      platform,
      rating,
      date: parsed.date ?? baseDate,
      author: parsed.author ?? baseAuthor,
      reviewText: parsed.body ?? normalized
    }
  }

  return {
    platform,
    rating,
    date: baseDate,
    author: baseAuthor,
    reviewText: parseGeneric(normalized)
  }
}

function detectPlatform(text: string): ReviewPlatform {
  if (
    text.includes('네이버') ||
    text.includes('NAVER') ||
    /리뷰\s*[\d,]+.*사진\s*[\d,]+/.test(text) ||
    /^팔로우$/m.test(text)
  ) {
    return 'naver'
  }

  if (text.includes('카카오') || text.includes('Kakao') || text.includes('카카오맵')) {
    return 'kakao'
  }

  if (text.includes('인스타그램') || text.includes('Instagram')) {
    return 'instagram'
  }

  if (text.includes('구글') || text.includes('Google')) {
    return 'google'
  }

  return 'unknown'
}

function extractRating(text: string): number {
  const starMatch = text.match(/⭐+/)
  if (starMatch) {
    return Math.min(5, starMatch[0].length)
  }

  const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:점|\/\s*5|stars?)/i)
  if (ratingMatch) {
    const value = Number.parseFloat(ratingMatch[1])
    if (!Number.isNaN(value)) {
      return Math.min(5, Math.max(1, value))
    }
  }

  return 5
}

function extractDate(text: string): string {
  const today = new Date()
  const defaultDate = today.toISOString().split('T')[0]

  const patterns: Array<{ regex: RegExp; handler: (match: RegExpMatchArray) => string | null }> = [
    {
      regex: /(\d{4})[년.\/-](\d{1,2})[월.\/-](\d{1,2})/,
      handler: (match) => `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
    },
    {
      regex: /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
      handler: (match) => `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
    },
    {
      regex: /(\d{1,2})[월.\/-](\d{1,2})[일]?/,
      handler: (match) => `${today.getFullYear()}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
    },
    {
      regex: /(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/,
      handler: (match) => {
        const year = match[3] ? normalizeYear(match[3]) : today.getFullYear().toString()
        return `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
      }
    },
    {
      regex: /(\d+)\s*일\s*전/,
      handler: (match) => {
        const offset = Number.parseInt(match[1], 10)
        if (Number.isNaN(offset)) {
          return null
        }
        const d = new Date()
        d.setDate(d.getDate() - offset)
        return d.toISOString().split('T')[0]
      }
    },
    {
      regex: /(어제|그제|오늘)/,
      handler: (match) => {
        const keyword = match[1]
        const d = new Date()
        if (keyword === '어제') {
          d.setDate(d.getDate() - 1)
        } else if (keyword === '그제') {
          d.setDate(d.getDate() - 2)
        }
        return d.toISOString().split('T')[0]
      }
    }
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match) {
      const result = pattern.handler(match)
      if (result) {
        return result
      }
    }
  }

  return defaultDate
}

function normalizeYear(year: string): string {
  if (year.length === 2) {
    const currentYear = new Date().getFullYear()
    const prefix = Math.floor(currentYear / 100)
    return `${prefix}${year}`
  }
  return year
}

function extractAuthor(text: string): string {
  const patterns = [
    /작성자\s*[:：]\s*([^\n]+)/,
    /닉네임\s*[:：]\s*([^\n]+)/,
    /([가-힣A-Za-z0-9*]{2,15})\s*님/
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  const firstLine = text.split('\n').map((line) => line.trim()).find((line) => line.length > 1)
  if (firstLine && /^[A-Za-z0-9가-힣*]{2,15}$/.test(firstLine)) {
    return firstLine
  }

  return ''
}

interface ParsedNaver {
  author?: string
  date?: string
  business?: string
  body?: string
}
function parseNaver(text: string, fallbackAuthor: string, fallbackDate: string): ParsedNaver {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) {
    return {}
  }

  let author = fallbackAuthor
  let date = fallbackDate
  let business = ''
  let bodyLines = [...lines]

  if (/^[A-Za-z0-9가-힣*]{2,15}$/.test(lines[0])) {
    author = lines[0]
    bodyLines = bodyLines.slice(1)
  }

  const authorLine = lines.find((line) => /작성자\s*[:：]/.test(line))
  if (authorLine) {
    author = authorLine.split(/[:：]/)[1]?.trim() ?? author
  }

  const topNoisePatterns: RegExp[] = [
    /^리뷰\s*\d+(?:개)?$/,
    /^사진\s*\d+(?:장)?$/,
    /^팔로우(?:\s*\+?\d+)?$/i,
    /^팔로잉$/,
    /^프로필$/,
    /^후기\s*모아보기$/,
    /^(홈\s*)(소식)?\s*(예약)?\s*(리뷰)?$/,
    /^주변$/,
    /^정보$/,
    /^지도보기?$/,
    /^길찾기$/,
    /^전화$/,
    /^저장$/
  ]

  bodyLines = bodyLines.filter((line, index) => {
    if (index < 6 && (topNoisePatterns.some((pattern) => pattern.test(line)) || isSymbolLine(line))) {
      return false
    }
    if (/^리뷰\s*[\d,]+\s*[.,·]\s*사진\s*[\d,]+$/.test(line)) {
      return false
    }
    return true
  })

  const bottomNoiseKeywords = ['접기', '더보기', '번역', '공유', '신고', '사장님', '사장님 댓글', '시설이', '친절해요', '재방문', '추천', '가성비']
  const bottomIndex = bodyLines.findIndex((line, idx) => idx > 0 && bottomNoiseKeywords.some((keyword) => line.includes(keyword)))
  if (bottomIndex !== -1) {
    bodyLines = bodyLines.slice(0, bottomIndex)
  }

  const dateLine = bodyLines.find((line) => DATE_CANDIDATE_REGEX.test(line))
  if (dateLine) {
    date = extractDate(dateLine)
    bodyLines = bodyLines.filter((line) => line !== dateLine)
  }

  const tagHints = ['해요', '좋아요', '깔끔', '아늑', '재방문', '추천', '친절', '실력', '가성비']
  bodyLines = bodyLines.filter((line) => !/^[•♡♥※▶·ㆍ]+/.test(line))
  bodyLines = bodyLines.filter((line) => !(line.length <= 6 && tagHints.some((keyword) => line.includes(keyword))))
  bodyLines = bodyLines.filter((line) => !/^리뷰\s*\d+/.test(line) && !/^사진\s*\d+/.test(line) && !/^팔로우/.test(line))
  bodyLines = bodyLines.filter((line) => !/^(\?|x|X|☆|★|\*|\-|=|—|·|ㆍ)$/.test(line))

  const businessKeywords = ['학원', '클래스', '스튜디오', '센터', '샵', '뮤직', '필라테스', 'PT', '뷰티', '헤어', '네일', '요가', '보컬']
  const topWindow = lines.slice(0, Math.min(lines.length, 12))
  const businessCandidate = topWindow
    .filter((line) => !isSymbolLine(line) && /[가-힣]{2,}/.test(line) && line.length <= 30)
    .map((line) => ({ line, score: businessKeywords.some((keyword) => line.includes(keyword)) ? 2 : 1 }))
    .sort((a, b) => b.score - a.score || b.line.length - a.line.length)
    .at(0)

  if (businessCandidate) {
    business = businessCandidate.line.replace(/[†‡★☆✩✭✮✯⭐️]+/g, '').trim()
  }

  return {
    author,
    date,
    business,
    body: bodyLines.join('\n').trim()
  }
}

interface ParsedKakao {
  author?: string
  date?: string
  body?: string
}

function parseKakao(text: string, fallbackAuthor: string, fallbackDate: string): ParsedKakao {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) {
    return {}
  }

  let author = fallbackAuthor
  let date = fallbackDate
  let bodyLines = [...lines]

  if (/^[A-Za-z0-9가-힣*]{2,15}$/.test(lines[0])) {
    author = lines[0]
    bodyLines = bodyLines.slice(1)
  }

  const authorLine = lines.find((line) => /작성자\s*[:：]/.test(line))
  if (authorLine) {
    author = authorLine.split(/[:：]/)[1]?.trim() ?? author
  }

  const topNoise = [/^지도보기$/, /^공유$/, /^신고$/, /^좋아요\s*\d*$/, /^팔로우$/]
  bodyLines = bodyLines.filter((line, index) => !(index <= 2 && (line === author || topNoise.some((pattern) => pattern.test(line)))))

  const bottomNoise = ['더보기', '접기', '공유', '신고', '번역', '좋아요']
  const bottomIndex = bodyLines.findIndex((line, idx) => idx > 0 && bottomNoise.some((keyword) => line.includes(keyword)))
  if (bottomIndex !== -1) {
    bodyLines = bodyLines.slice(0, bottomIndex)
  }

  const dateLine = bodyLines.find((line) => DATE_CANDIDATE_REGEX.test(line))
  if (dateLine) {
    date = extractDate(dateLine)
    bodyLines = bodyLines.filter((line) => line !== dateLine)
  }

  const attrHints = ['분위기', '서비스', '가격', '메뉴', '청결', '직원', '추천']
  bodyLines = bodyLines.filter((line) => !attrHints.some((keyword) => line.includes(keyword)))

  return {
    author,
    date,
    body: bodyLines.join('\n').trim()
  }
}

function parseGeneric(text: string): string {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  const uiWords = ['접기', '더보기', '공유', '신고', '번역', '팔로우', '프로필']
  return lines.filter((line) => !uiWords.includes(line)).join('\n').trim()
}

const DATE_CANDIDATE_REGEX = /(\d{4})[년.\/-](\d{1,2})[월.\/-](\d{1,2})|(\d{1,2})[월.\/-](\d{1,2})|(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?|(\d+)\s*일\s*전|(어제|그제|오늘)/

function rebuildReadingOrder(result: AnnotateImageResponse): string | null {
  const pages = result.fullTextAnnotation?.pages ?? []
  const lines: Array<{ x: number; y: number; text: string }> = []
  let pageMaxY = 0

  for (const page of pages) {
    for (const block of page?.blocks ?? []) {
      for (const paragraph of block?.paragraphs ?? []) {
        const words = paragraph?.words ?? []
        const text = words
          .map((word) => (word?.symbols ?? []).map((symbol) => symbol?.text ?? '').join(''))
          .join(' ')
          .trim()
        if (!text) {
          continue
        }
        const center = getCenter(paragraph?.boundingBox?.vertices)
        pageMaxY = Math.max(pageMaxY, center.maxY)
        lines.push({ x: center.x, y: center.y, text })
      }
    }
  }

  if (lines.length === 0 && result.textAnnotations && result.textAnnotations.length > 1) {
    const words = result.textAnnotations
      .slice(1)
      .map((annotation) => {
        const geometry = getCenter(annotation.boundingPoly?.vertices)
        return { x: geometry.x, y: geometry.y, height: geometry.height, text: annotation.description?.trim() ?? '' }
      })
      .filter((item) => item.text.length > 0)

    if (words.length === 0) {
      return null
    }

    words.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
    const grouped: Array<{ y: number; items: typeof words }> = []

    for (const word of words) {
      const band = grouped.find((group) => Math.abs(group.y - word.y) <= Math.max(8, word.height * 0.6))
      if (band) {
        band.items.push(word)
        band.y = (band.y * (band.items.length - 1) + word.y) / band.items.length
      } else {
        grouped.push({ y: word.y, items: [word] })
      }
    }

    grouped.sort((a, b) => a.y - b.y)
    return (
      grouped
        .map((group) => group.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(' '))
        .join('\n')
        .trim() || null
    )
  }

  if (lines.length === 0) {
    return null
  }

  const cutRatio = Number(process.env.OCR_TOP_CUT_RATIO || 0.12)
  const yCut = pageMaxY ? pageMaxY * cutRatio : 0
  const filtered = yCut ? lines.filter((line) => line.y >= yCut) : lines

  filtered.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
  return filtered.map((line) => line.text).join('\n').trim() || null
}

function refineSpacing(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const tokens = line.trim().split(/\s+/)
      const hangul = /[\uAC00-\uD7AF]/
      const singleHangul = tokens.filter((token) => token.length === 1 && hangul.test(token)).length
      const ratio = tokens.length ? singleHangul / tokens.length : 0
      if (ratio >= 0.5) {
        return line
          .replace(/(?<=[\uAC00-\uD7AF])\s+(?=[\uAC00-\uD7AF])/g, '')
          .replace(/\s+([,\.\!\?%\)\]\}])/g, '$1')
          .replace(/([\(\[\{])\s+/g, '$1')
      }
      return line
    })
    .join('\n')
}

function normalizeText(input: string): string {
  return input.replace(/\r\n?/g, '\n').replace(/[\t\f\v]+/g, ' ').replace(/ +/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

function isSymbolLine(value: string): boolean {
  return /^[^\w가-힣]+$/.test(value)
}

interface GeometryCenter {
  x: number
  y: number
  height: number
  maxY: number
}

function getCenter(vertices?: VisionVertex[] | null): GeometryCenter {
  const xs = (vertices ?? []).map((vertex) => vertex?.x ?? 0)
  const ys = (vertices ?? []).map((vertex) => vertex?.y ?? 0)
  if (xs.length === 0 || ys.length === 0) {
    return { x: 0, y: 0, height: 0, maxY: 0 }
  }

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    height: maxY - minY,
    maxY
  }
}
