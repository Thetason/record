// Generates a large, realistic set of 네이버-style review captures for a
// scale/accuracy benchmark of the multi-image OCR pipeline. Renders N reviews
// per image across many images (like a scrolled review list), embedding the
// same traps the extractor must survive: keyword-aggregate block, 사장님 답글
// (owner replies must be excluded), masked nicknames, and no-rating reviews.
//
// Output: fixtures/scale/naver-###.png + fixtures/scale/ground-truth.json
// Usage: node scripts/make-scale-fixtures.mjs [totalReviews] [perImage]

import sharp from 'sharp'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'fixtures', 'scale')
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const TOTAL = parseInt(process.argv[2] || '300', 10)
const PER_IMAGE = parseInt(process.argv[3] || '6', 10)
const W = 400
const FONT = 'Apple SD Gothic Neo, AppleGothic, sans-serif'

// Deterministic-ish PRNG so a rerun reproduces the same ground truth.
let seed = 424242
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── content pools (hair-salon flavored, varied) ──
const OPEN = [
  '오랜만에 방문했는데', '친구 소개로 처음 갔는데', '단골이라 매번 가는데',
  '이사 오고 나서 계속 다니는데', '연예인 담당이라길래 큰맘 먹고 갔는데',
  '펌이 잘 안 풀려서 고민하다 갔는데', '염색 색이 항상 애매했는데',
  '앞머리 때문에 스트레스였는데', '숱이 많아서 늘 무거웠는데', '곱슬이 심한 편인데',
]
const MID = [
  '얼굴형에 맞게 커트를 잡아주셔서', '두피 상태까지 봐주시면서', '원하는 무드를 정확히 캐치하셔서',
  '손질 방법을 하나하나 알려주셔서', '기장을 살리면서도 가볍게 해주셔서', '톤 다운 컬러를 자연스럽게 해주셔서',
  '펌 컬이 3개월째 살아있어서', '앞머리를 얼굴에 맞게 잘라주셔서', '뿌리 볼륨을 살려주셔서',
  '상담을 오래 해주시고 무리하지 않게 해주셔서',
]
const CLOSE = [
  '너무 만족스러웠어요. 다음에도 예약할게요!', '주변에 다 소개하고 있어요.', '재방문 확정입니다 ㅎㅎ',
  '집에서도 손질이 편해졌어요.', '결과물 보고 깜짝 놀랐어요.', '가격 대비 진짜 최고예요.',
  '이제 여기 아니면 못 갈 것 같아요.', '오래 다닐 단골집 찾았네요.', '친절함은 말할 것도 없고요.',
  '사진보다 실물이 더 예뻐서 감동...', '무궁한 발전을 기원합니다 화이팅!',
]
const MASKED = ['김**', '이**', '박**', '최**', '정**', '강**', '윤**']
const NICKS = ['goo5614', 'lifeofyoung', 'parksh0011', 'hairlover_2', 'mint***', 'sujin_p', 'daily.log', 'yeol****']
const NAMES = ['서윤', '민지', '하늘', '지현', '수아', '예린', '도윤', '하준']

function makeReview(i) {
  const author = pick([...MASKED, ...NICKS, ...NAMES])
  const r = rnd()
  const rating = r < 0.72 ? 5 : r < 0.9 ? 4 : r < 0.95 ? 3 : null // ~5% null
  const reviewType = rnd() < 0.5 ? '방문자리뷰' : '영수증리뷰'
  const y = 2025 + Math.floor(rnd() * 2) // 2025 or 2026
  const mo = 1 + Math.floor(rnd() * (y === 2026 ? 7 : 12))
  const da = 1 + Math.floor(rnd() * 28)
  const date = `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`
  const content = `${pick(OPEN)} ${pick(MID)} ${pick(CLOSE)}`
  const hasOwnerReply = rnd() < 0.14 // ~14% carry an owner reply (trap: must be excluded)
  return { id: i, author, rating, date, reviewType, content, hasOwnerReply }
}

// ── SVG rendering ──
function stars(x, y, filled) {
  let out = ''
  for (let i = 0; i < 5; i++) {
    out += `<text x="${x + i * 15}" y="${y}" font-size="14" fill="${i < filled ? '#FFB300' : '#E0E0E0'}">★</text>`
  }
  return out
}
function text(x, y, s, o = {}) {
  const { size = 13, fill = '#222', weight = 'normal', anchor = 'start' } = o
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`
}
function wrapText(x, yStart, str, maxChars, lh = 19, o = {}) {
  const words = str.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      lines.push(cur.trim())
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return { svg: lines.map((l, i) => text(x, yStart + i * lh, l, o)).join(''), lines: lines.length }
}

// Renders one review card starting at y, returns { svg, height }.
function renderCard(rev, y) {
  const body = wrapText(24, y + 82, rev.content, 26, 19)
  let h = 70 + body.lines * 19 + 16
  let s = ''
  const cardStart = y
  // avatar + author
  s += `<circle cx="38" cy="${y + 26}" r="15" fill="#EAF1FF"/>`
  s += text(38, y + 31, rev.author.slice(0, 1), { size: 12, anchor: 'middle', fill: '#3366CC' })
  s += text(60, y + 22, rev.author, { size: 14, weight: 'bold' })
  s += text(60, y + 39, `리뷰 ${1 + Math.floor(rnd() * 40)} · 사진 ${Math.floor(rnd() * 10)}`, { size: 10, fill: '#999' })
  // stars + date + type
  if (rev.rating) s += stars(24, y + 62, rev.rating)
  s += text(rev.rating ? 110 : 24, y + 60, `${rev.date.replace(/-/g, '.')} · ${rev.reviewType}`, { size: 11, fill: '#999' })
  // content
  s += body.svg
  // owner reply trap
  if (rev.hasOwnerReply) {
    const ry = y + 82 + body.lines * 19 + 6
    s += `<rect x="24" y="${ry}" width="${W - 48}" height="46" rx="8" fill="#F2F4F6"/>`
    s += text(36, ry + 20, '사장님', { size: 11, weight: 'bold', fill: '#03C75A' })
    s += text(78, ry + 20, rev.date.replace(/-/g, '.'), { size: 10, fill: '#AAA' })
    s += text(36, ry + 37, '소중한 후기 감사합니다! 또 방문해 주세요 :)', { size: 11, fill: '#555' })
    h += 52
  }
  s = `<rect x="12" y="${cardStart}" width="${W - 24}" height="${h - 8}" rx="12" fill="#FFFFFF" stroke="#EEEEEE"/>` + s
  return { svg: s, height: h }
}

function renderImage(reviews, withKeywordTrap) {
  let y = withKeywordTrap ? 220 : 60
  let body = ''
  // header
  let head = `<rect width="${W}" height="50" fill="#FFFFFF"/>`
  head += text(16, 32, '학원헤어 성수점', { size: 16, weight: 'bold' })
  head += text(16, 46, '방문자 리뷰 296 · 블로그 리뷰 41', { size: 12, fill: '#03C75A' })
  // keyword aggregate trap (first image only)
  if (withKeywordTrap) {
    head += `<rect x="12" y="60" width="${W - 24}" height="150" rx="12" fill="#FFFFFF" stroke="#EEEEEE"/>`
    head += text(28, 86, '이런 점이 좋았어요', { size: 13, weight: 'bold' })
    const tags = [['"컷이 예뻐요"', '132'], ['"친절해요"', '98'], ['"실력이 좋아요"', '87']]
    tags.forEach(([t, n], i) => {
      const ty = 108 + i * 32
      head += `<rect x="26" y="${ty}" width="240" height="24" rx="12" fill="#EAF7EF"/>`
      head += text(36, ty + 16, t, { size: 11, fill: '#0B7A3E' })
      head += text(276, ty + 16, n, { size: 11, fill: '#0B7A3E', weight: 'bold' })
    })
  }
  for (const rev of reviews) {
    const c = renderCard(rev, y)
    body += c.svg
    y += c.height + 10
  }
  const H = y + 20
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#F5F6F8"/>${head}${body}</svg>`
}

// ── generate ──
const all = Array.from({ length: TOTAL }, (_, i) => makeReview(i))
const groundTruth = all.map((r) => ({
  id: r.id,
  author: r.author,
  rating: r.rating,
  date: r.date,
  content: r.content,
  hasOwnerReply: r.hasOwnerReply,
}))

let imgIndex = 0
const manifest = []
for (let i = 0; i < all.length; i += PER_IMAGE) {
  const chunk = all.slice(i, i + PER_IMAGE)
  const svg = renderImage(chunk, imgIndex === 0)
  const name = `naver-${String(imgIndex).padStart(3, '0')}.png`
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, name))
  manifest.push({ image: name, reviewIds: chunk.map((c) => c.id) })
  imgIndex++
}

writeFileSync(
  join(outDir, 'ground-truth.json'),
  JSON.stringify({ total: TOTAL, perImage: PER_IMAGE, images: imgIndex, reviews: groundTruth, manifest }, null, 2)
)

const withReply = groundTruth.filter((r) => r.hasOwnerReply).length
const nullRating = groundTruth.filter((r) => r.rating === null).length
console.log(`generated ${imgIndex} images, ${TOTAL} reviews`)
console.log(`  traps: ${withReply} owner-reply cards (must be excluded), ${nullRating} null-rating reviews`)
console.log(`  out: ${outDir}`)
