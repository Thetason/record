// Real-API smoke test for the multi-review vision extractor.
// Runs the exact production code path (lib/claude-vision.ts) against local
// capture images — use this to verify accuracy before/after model changes.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... npx tsx scripts/test-vision-extract.ts [--model claude-fable-5] [image.png ...]
//
// With no image args, runs the bundled fixtures in fixtures/vision-captures/
// and prints results next to their ground truth.

import { readFileSync, existsSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import { extractReviewsFromImages, type VisionImage } from '../lib/claude-vision'

const here = dirname(fileURLToPath(import.meta.url))
const fixtureDir = join(here, '..', 'fixtures', 'vision-captures')

function parseArgs(argv: string[]) {
  const images: string[] = []
  let model: string | undefined
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--model') {
      model = argv[++i]
    } else {
      images.push(argv[i])
    }
  }
  if (images.length === 0) {
    images.push(
      join(fixtureDir, 'naver-scroll.png'),
      join(fixtureDir, 'mixed-daangn-kmong.png'),
      join(fixtureDir, 'kakao-dm.png')
    )
  }
  return { images, model }
}

function toVisionImage(path: string): VisionImage {
  const buf = readFileSync(path)
  const lower = path.toLowerCase()
  const mediaType = lower.endsWith('.jpg') || lower.endsWith('.jpeg')
    ? ('image/jpeg' as const)
    : lower.endsWith('.webp')
      ? ('image/webp' as const)
      : ('image/png' as const)
  return { base64: buf.toString('base64'), mediaType }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY 가 필요합니다. (없으면 mock 경로만 돌아 실검증이 아님)')
    process.exit(1)
  }

  const { images, model } = parseArgs(process.argv.slice(2))
  const gtPath = join(fixtureDir, 'ground-truth.json')
  const groundTruth = existsSync(gtPath) ? JSON.parse(readFileSync(gtPath, 'utf8')) : null

  for (const imagePath of images) {
    console.log(`\n━━━ ${basename(imagePath)} ${model ? `(model: ${model})` : ''} ━━━`)
    const started = Date.now()
    const result = await extractReviewsFromImages([toVisionImage(imagePath)], model)
    const ms = Date.now() - started

    console.log(
      `engine=${result.engine} model=${result.model ?? '-'} reviews=${result.reviews.length} ` +
        `in=${result.usage?.inputTokens ?? '-'} out=${result.usage?.outputTokens ?? '-'} ${ms}ms`
    )
    for (const r of result.reviews) {
      console.log(
        `  [${r.platform}/${r.reviewType || '-'}] rating=${r.rating ?? 'null'} date=${r.date ?? 'null'} ` +
          `author=${JSON.stringify(r.author)} conf=${r.confidence.toFixed(2)}`
      )
      console.log(`    ${r.content.slice(0, 72)}${r.content.length > 72 ? '…' : ''}`)
    }

    const gt = groundTruth?.[basename(imagePath)]
    if (gt) {
      console.log(`  · 기대: ${gt.expectReviews}개 — 함정: ${gt.traps.join(' / ')}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
