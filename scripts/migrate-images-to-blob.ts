import { PrismaClient } from './prisma-client'
import { ensureBlobUrl, isDataUri, hasBlobToken } from '../lib/blob-storage'

// One-off migration: move base64 data-URI images out of DB columns into
// Vercel Blob, storing only the URL. This is what shrinks the public profile
// SSR payload from ~12MB to a normal size.
//
// Dry run (counts + sizes only):
//   sh scripts/prod-run.sh migrate-images-to-blob.ts
// Apply:
//   sh scripts/prod-run.sh --confirm migrate-images-to-blob.ts
//   (--confirm sets AVATAR_FIX_CONFIRM=YES; reused here as the confirm flag)

const prisma = new PrismaClient()
const CONFIRM = process.env.AVATAR_FIX_CONFIRM === 'YES' || process.env.BLOB_MIGRATE_CONFIRM === 'YES'

const mb = (n: number) => (n / 1024 / 1024).toFixed(2) + 'MB'

function parsePortfolio(raw: string | null): string[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

async function main() {
  if (!hasBlobToken()) {
    console.error('BLOB_READ_WRITE_TOKEN 이 없습니다. prod-run.sh 로 실행하세요.')
    process.exit(1)
  }

  let foundCount = 0
  let foundBytes = 0
  let migrated = 0

  // ── users: avatar, bgImage, portfolioImages ──
  const users = await prisma.user.findMany({
    select: { id: true, username: true, avatar: true, bgImage: true, portfolioImages: true }
  })

  for (const u of users) {
    const portfolio = parsePortfolio(u.portfolioImages)
    const items: Array<{ field: string; value: string }> = []
    if (isDataUri(u.avatar)) items.push({ field: 'avatar', value: u.avatar! })
    if (isDataUri(u.bgImage)) items.push({ field: 'bgImage', value: u.bgImage! })
    portfolio.forEach((p, i) => {
      if (isDataUri(p)) items.push({ field: `portfolio[${i}]`, value: p })
    })
    if (items.length === 0) continue

    const bytes = items.reduce((s, it) => s + it.value.length, 0)
    foundCount += items.length
    foundBytes += bytes
    console.log(`user ${u.username}: ${items.map((i) => i.field).join(', ')} (${mb(bytes)})`)

    if (!CONFIRM) continue

    const newAvatar = isDataUri(u.avatar) ? await ensureBlobUrl(u.avatar, 'avatar') : u.avatar
    const newBg = isDataUri(u.bgImage) ? await ensureBlobUrl(u.bgImage, 'cover') : u.bgImage
    const newPortfolio = await Promise.all(
      portfolio.map((p) => (isDataUri(p) ? ensureBlobUrl(p, 'portfolio') : Promise.resolve(p)))
    )
    const stillData = [newAvatar, newBg, ...newPortfolio].some((v) => isDataUri(v as string))
    if (stillData) {
      console.error(`  ⚠ ${u.username}: 일부 업로드 실패 — 이 유저는 건너뜀`)
      continue
    }
    await prisma.user.update({
      where: { id: u.id },
      data: {
        avatar: newAvatar as string | null,
        bgImage: newBg as string | null,
        portfolioImages: portfolio.length > 0 ? JSON.stringify(newPortfolio) : u.portfolioImages
      }
    })
    migrated += items.length
    console.log(`  ✓ migrated`)
  }

  // ── reviews: imageUrl ──
  const reviews = await prisma.review.findMany({
    where: { imageUrl: { startsWith: 'data:image/' } },
    select: { id: true, imageUrl: true, userId: true }
  })

  for (const r of reviews) {
    const bytes = r.imageUrl!.length
    foundCount += 1
    foundBytes += bytes
    if (!CONFIRM) continue
    const url = await ensureBlobUrl(r.imageUrl, 'review')
    if (isDataUri(url as string)) {
      console.error(`  ⚠ review ${r.id}: 업로드 실패 — 건너뜀`)
      continue
    }
    await prisma.review.update({ where: { id: r.id }, data: { imageUrl: url as string } })
    migrated += 1
  }
  if (reviews.length > 0) {
    console.log(`reviews: ${reviews.length}개 캡처 (${mb(reviews.reduce((s, r) => s + r.imageUrl!.length, 0))})`)
  }

  console.log(`\n합계: base64 이미지 ${foundCount}개, ${mb(foundBytes)}`)
  if (!CONFIRM) {
    console.log('dry run. 적용하려면: sh scripts/prod-run.sh --confirm migrate-images-to-blob.ts')
  } else {
    console.log(`마이그레이션 완료: ${migrated}/${foundCount}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
