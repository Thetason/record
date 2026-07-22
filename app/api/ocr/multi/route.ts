import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const maxDuration = 60

import { getServerSession } from 'next-auth'
import sharp from 'sharp'
import { authOptions } from '@/lib/auth'
import { rateLimit, getIP, rateLimitResponse, apiLimits } from '@/lib/rate-limit'
import { extractReviewsFromImages, type VisionImage } from '@/lib/claude-vision'

const MAX_IMAGES = 5
const MAX_DIMENSION = 8000 // tall scroll-captures are expected; cap the long edge

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 })

export async function POST(req: NextRequest) {
  try {
    const clientIp = getIP(req) || 'unknown'
    try {
      await limiter.check(req, apiLimits.ocr, `ocr_multi_${clientIp}`)
    } catch {
      return rateLimitResponse(60)
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ success: false, error: '이미지를 읽을 수 없습니다.' }, { status: 400 })
    }

    const files = formData.getAll('images').filter((f): f is File => f instanceof File)
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: '이미지가 필요합니다.' }, { status: 400 })
    }
    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { success: false, error: `한 번에 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.` },
        { status: 400 }
      )
    }

    const images: VisionImage[] = []
    let skipped = 0
    for (const file of files) {
      try {
        const input = Buffer.from(await file.arrayBuffer())
        // Normalize to PNG and bound the long edge so Claude vision sees a clean,
        // reasonably-sized image regardless of the phone's capture format.
        const normalized = await sharp(input)
          .rotate()
          .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer()
        images.push({ base64: normalized.toString('base64'), mediaType: 'image/png' })
      } catch {
        // One unreadable frame (e.g. HEIC, truncated capture) must not sink the
        // other good images in the same batch — skip it and keep going.
        skipped++
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: '이미지를 읽을 수 없어요. PNG·JPG로 캡처해 다시 올려주세요.' },
        { status: 400 }
      )
    }

    const { reviews, engine, model, usage } = await extractReviewsFromImages(images)
    if (skipped > 0) {
      console.log(`multi OCR: skipped ${skipped} unreadable image(s), processed ${images.length}`)
    }

    if (usage) {
      console.log(
        `multi OCR ok: model=${model} images=${images.length} reviews=${reviews.length} in=${usage.inputTokens} out=${usage.outputTokens}`
      )
    }

    return NextResponse.json({ success: true, engine, count: reviews.length, reviews })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown'
    if (message === 'ANTHROPIC_API_KEY_MISSING') {
      return NextResponse.json(
        { success: false, error: '리뷰 자동 인식이 아직 설정되지 않았습니다. 관리자에게 문의해주세요.' },
        { status: 503 }
      )
    }
    if (message === 'VISION_REFUSED') {
      return NextResponse.json(
        { success: false, error: '이 이미지는 자동 인식이 어려워요. 리뷰 화면만 담기게 다시 캡처해 주세요.' },
        { status: 422 }
      )
    }
    console.error('multi OCR failed:', error)
    return NextResponse.json(
      { success: false, error: '리뷰 인식 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
