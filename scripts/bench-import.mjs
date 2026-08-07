// Benchmarks the real production multi-image OCR + batch pipeline against the
// synthetic 네이버 scale fixtures. Replicates exactly what the import page does
// (chunk into 5-image batches, concurrency 3, dedupe), then scores the result
// against ground-truth: recall, precision, owner-reply/keyword-trap exclusion,
// and rating/date field accuracy — plus wall-clock throughput.
//
// Usage: node scripts/bench-import.mjs [baseUrl]
//   requires env RC_USER / RC_PASS for a test login.

import { readFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const dir = join(here, '..', 'fixtures', 'scale')
const BASE = process.argv[2] || 'https://www.recordyours.com'
const USER = process.env.RC_USER || 'rc-import-test'
const PASS = process.env.RC_PASS || 'TestImport2026'
const OCR_BATCH = 3
const CONCURRENCY = 3

const norm = (s) => (s || '').replace(/\s+/g, '').replace(/[.,!?~…]/g, '')

// ── login (NextAuth credentials) ──
async function login() {
  const jar = new Map()
  const setCookies = (res) => {
    const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : []
    for (const c of raw) {
      const [kv] = c.split(';')
      const idx = kv.indexOf('=')
      jar.set(kv.slice(0, idx), kv.slice(idx + 1))
    }
  }
  const cookieHeader = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')

  let res = await fetch(`${BASE}/api/auth/csrf`, {})
  setCookies(res)
  const { csrfToken } = await res.json()

  const body = new URLSearchParams({ csrfToken, username: USER, password: PASS, redirect: 'false', json: 'true' })
  res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie: cookieHeader() },
    body,
    redirect: 'manual',
  })
  setCookies(res)

  res = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: cookieHeader() } })
  const session = await res.json()
  if (!session?.user?.username) throw new Error('login failed')
  return cookieHeader()
}

// ── one OCR batch ──
async function ocrBatch(cookie, files) {
  const form = new FormData()
  for (const f of files) {
    const buf = readFileSync(join(dir, f))
    form.append('images', new Blob([buf], { type: 'image/png' }), f)
  }
  const t0 = Date.now()
  const res = await fetch(`${BASE}/api/ocr/multi`, { method: 'POST', headers: { cookie }, body: form })
  const ms = Date.now() - t0
  let data
  try {
    data = await res.json()
  } catch {
    data = { success: false }
  }
  return { ok: res.ok && data.success, status: res.status, reviews: data.reviews || [], ms, count: data.count }
}

async function run() {
  const gt = JSON.parse(readFileSync(join(dir, 'ground-truth.json'), 'utf8'))
  const images = readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
  console.log(`fixtures: ${images.length} images, ground truth ${gt.total} reviews\nlogging in as ${USER}…`)
  const cookie = await login()
  console.log('logged in. running batches…\n')

  const batches = []
  for (let i = 0; i < images.length; i += OCR_BATCH) batches.push(images.slice(i, i + OCR_BATCH))

  const results = new Array(batches.length)
  let cursor = 0
  let failed = 0
  const startAll = Date.now()
  const worker = async () => {
    while (cursor < batches.length) {
      const idx = cursor++
      const r = await ocrBatch(cookie, batches[idx])
      results[idx] = r
      if (!r.ok) failed++
      process.stdout.write(`  batch ${idx + 1}/${batches.length}: ${r.ok ? r.reviews.length + ' reviews' : 'FAIL ' + r.status} (${r.ms}ms)\n`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batches.length) }, () => worker()))
  const wallMs = Date.now() - startAll

  // flatten + dedupe (mirror client dedupeKey)
  const seen = new Set()
  const extracted = []
  for (const r of results) {
    if (!r) continue
    for (const rev of r.reviews) {
      const key = [rev.platform, (rev.author || '').trim(), rev.rating ?? '', rev.date ?? '', norm(rev.content)].join('|')
      if (seen.has(key)) continue
      seen.add(key)
      extracted.push(rev)
    }
  }

  // ── scoring ──
  const gtByContent = new Map()
  for (const g of gt.reviews) gtByContent.set(norm(g.content), g)

  let matched = 0
  let ratingOk = 0
  let dateOk = 0
  const ownerReplyLeak = []
  const keywordLeak = []
  const matchedIds = new Set()

  for (const ex of extracted) {
    const nc = norm(ex.content)
    // trap leaks
    if (nc.includes('소중한후기감사') || (ex.author && ex.author.includes('사장'))) {
      ownerReplyLeak.push(ex.content?.slice(0, 30))
      continue
    }
    if (/^"?(컷이예뻐요|친절해요|실력이좋아요)/.test(nc) || /좋았어요\d+$/.test(nc)) {
      keywordLeak.push(ex.content?.slice(0, 30))
      continue
    }
    // best content match against GT (exact normalized, else prefix overlap)
    let g = gtByContent.get(nc)
    if (!g) {
      for (const cand of gt.reviews) {
        const gn = norm(cand.content)
        if (gn && (nc.startsWith(gn.slice(0, 18)) || gn.startsWith(nc.slice(0, 18)))) { g = cand; break }
      }
    }
    if (g && !matchedIds.has(g.id)) {
      matched++
      matchedIds.add(g.id)
      if ((ex.rating ?? null) === (g.rating ?? null)) ratingOk++
      if (ex.date === g.date) dateOk++
    }
  }

  const recall = ((matched / gt.total) * 100).toFixed(1)
  const precision = ((matched / Math.max(extracted.length, 1)) * 100).toFixed(1)

  console.log('\n════════ 성능 리포트 ════════')
  console.log(`이미지: ${images.length}장 → 배치 ${batches.length}개 (동시 ${CONCURRENCY})`)
  console.log(`총 소요: ${(wallMs / 1000).toFixed(1)}s · 배치 실패: ${failed}`)
  console.log(`추출(중복제거 후): ${extracted.length}건`)
  console.log(`─────────────────────────────`)
  console.log(`정답지: ${gt.total}건`)
  console.log(`매칭(recall): ${matched}/${gt.total} = ${recall}%`)
  console.log(`정밀도(precision): ${matched}/${extracted.length} = ${precision}%`)
  console.log(`  · 별점 정확: ${matched ? ((ratingOk / matched) * 100).toFixed(1) : 0}% (${ratingOk}/${matched})`)
  console.log(`  · 날짜 정확: ${matched ? ((dateOk / matched) * 100).toFixed(1) : 0}% (${dateOk}/${matched})`)
  console.log(`함정 통과:`)
  console.log(`  · 사장님 답글 누출: ${ownerReplyLeak.length}건 ${ownerReplyLeak.length ? '❌' : '✅'}`)
  console.log(`  · 키워드 집계 누출: ${keywordLeak.length}건 ${keywordLeak.length ? '❌' : '✅'}`)
  console.log('═════════════════════════════')
  if (ownerReplyLeak.length) console.log('누출 샘플(답글):', ownerReplyLeak.slice(0, 3))
}

run().catch((e) => {
  console.error('bench failed:', e)
  process.exit(1)
})
