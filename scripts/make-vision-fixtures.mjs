// Generates adversarial review-capture fixtures for the multi-review vision
// extractor. Each image embeds the traps that distinguish a smart extractor
// from a naive one (keyword aggregates, owner replies, no-rating platforms,
// masked nicknames, own DM bubbles). Ground truth lives beside the PNGs.
//
// Usage: node scripts/make-vision-fixtures.mjs
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'fixtures', 'vision-captures')
mkdirSync(outDir, { recursive: true })

const W = 390
const FONT = 'Apple SD Gothic Neo, AppleGothic, sans-serif'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function stars(x, y, filled, size = 14) {
  let out = ''
  for (let i = 0; i < 5; i++) {
    const fill = i < filled ? '#FFB300' : '#E0E0E0'
    out += `<text x="${x + i * (size + 1)}" y="${y}" font-size="${size}" fill="${fill}">★</text>`
  }
  return out
}

function text(x, y, s, { size = 13, fill = '#222', weight = 'normal', anchor = 'start' } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`
}

function wrap(x, yStart, lines, opts = {}) {
  const lh = opts.lh ?? 19
  return lines.map((l, i) => text(x, yStart + i * lh, l, opts)).join('')
}

function card(y, h, fill = '#FFFFFF') {
  return `<rect x="12" y="${y}" width="${W - 24}" height="${h}" rx="12" fill="${fill}" stroke="#EEEEEE"/>`
}

// ─── 1) 네이버 스타일: 키워드 태그 집계 + 사장님 답글 함정 ───────────────
function naverSvg() {
  const H = 1210
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#F5F6F8"/>`
  // header / tabs (UI noise)
  s += `<rect width="${W}" height="52" fill="#FFFFFF"/>`
  s += text(16, 33, '세타쓴 보컬스튜디오', { size: 16, weight: 'bold' })
  s += text(16, 74, '방문자 리뷰 137', { size: 14, weight: 'bold', fill: '#03C75A' })
  s += text(140, 74, '블로그 리뷰 24', { size: 14, fill: '#888' })

  // TRAP: keyword aggregate block
  s += card(90, 150)
  s += text(28, 116, '이런 점이 좋았어요', { size: 14, weight: 'bold' })
  const tags = [
    ['"레슨이 체계적이에요"', '42'],
    ['"원장님이 친절해요"', '31'],
    ['"실력이 빨리 늘어요"', '17'],
  ]
  tags.forEach(([t, n], i) => {
    const y = 140 + i * 32
    s += `<rect x="26" y="${y}" width="220" height="24" rx="12" fill="#EAF7EF"/>`
    s += text(36, y + 16, t, { size: 12, fill: '#0B7A3E' })
    s += text(256, y + 16, n, { size: 12, fill: '#0B7A3E', weight: 'bold' })
  })

  // Review 1 + owner reply trap
  s += card(258, 300)
  s += `<circle cx="42" cy="290" r="16" fill="#D8E6FF"/>`
  s += text(42, 295, '민', { size: 13, anchor: 'middle', fill: '#3366CC' })
  s += text(66, 286, '민지언니', { size: 14, weight: 'bold' })
  s += text(66, 303, '리뷰 12 · 사진 8', { size: 11, fill: '#999' })
  s += stars(26, 330, 5)
  s += text(110, 328, '2026.5.2.토 · 3번째 방문', { size: 11, fill: '#999' })
  s += wrap(26, 356, [
    '축가 준비로 8주 다녔어요. 호흡부터 고음까지',
    '단계별로 잡아주셔서 결혼식에서 무사히 잘',
    '불렀습니다. 녹음본 비교해주시는게 제일 좋았어요.',
  ])
  // TRAP: owner reply
  s += `<rect x="26" y="420" width="${W - 52}" height="120" rx="10" fill="#F2F4F6"/>`
  s += text(38, 444, '사장님', { size: 12, weight: 'bold', fill: '#03C75A' })
  s += text(84, 444, '2026.5.3', { size: 11, fill: '#AAA' })
  s += wrap(38, 468, [
    '민지님 축하드려요! 결혼식 영상 꼭 보여주세요.',
    '언제든 원포인트 레슨 놀러오세요 :)',
  ], { size: 12, fill: '#555' })

  // Review 2 (4 stars)
  s += card(574, 200)
  s += `<circle cx="42" cy="606" r="16" fill="#FFE7D6"/>`
  s += text(42, 611, '곰', { size: 13, anchor: 'middle', fill: '#CC6633' })
  s += text(66, 602, '노래하는곰', { size: 14, weight: 'bold' })
  s += text(66, 619, '리뷰 3', { size: 11, fill: '#999' })
  s += stars(26, 646, 4)
  s += text(110, 644, '2026.3.15.일 · 영수증', { size: 11, fill: '#999' })
  s += wrap(26, 672, [
    '취미로 시작했는데 발성 교정 받고 나서 회사',
    '노래방에서 칭찬 들었습니다. 주차가 조금',
    '불편한 것만 빼면 만족해요.',
  ])

  // Review 3 (no stars, relative date)
  s += card(790, 170)
  s += `<circle cx="42" cy="822" r="16" fill="#E6F0E6"/>`
  s += text(42, 827, '하', { size: 13, anchor: 'middle', fill: '#338855' })
  s += text(66, 818, '하이디', { size: 14, weight: 'bold' })
  s += text(66, 835, '리뷰 1', { size: 11, fill: '#999' })
  s += text(26, 862, '3일 전 · 방문자 리뷰', { size: 11, fill: '#999' })
  s += wrap(26, 888, [
    '입시 상담 받으러 갔는데 커리큘럼 설명이',
    '구체적이라 바로 등록했어요. 선생님이 귀가',
    '정말 좋으십니다.',
  ])

  // footer noise
  s += text(W / 2, 1000, '리뷰 더보기 ▾', { size: 13, fill: '#888', anchor: 'middle' })
  s += `</svg>`
  return { name: 'naver-scroll.png', svg: s }
}

// ─── 2) 당근(무별점) + 크몽(마스킹) 혼합 캡처 ────────────────────────────
function mixedSvg() {
  const H = 1230
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#F5F6F8"/>`
  // Karrot section
  s += `<rect width="${W}" height="48" fill="#FFFFFF"/>`
  s += text(16, 31, '받은 매너 평가 · 거래 후기', { size: 15, weight: 'bold', fill: '#FF6F0F' })

  s += card(64, 200)
  s += `<circle cx="42" cy="96" r="16" fill="#FFE3CC"/>`
  s += text(42, 101, '당', { size: 13, anchor: 'middle', fill: '#FF6F0F' })
  s += text(66, 92, '당근이웃22', { size: 14, weight: 'bold' })
  s += text(66, 109, '동작구 상도동 · 2026.1.20', { size: 11, fill: '#999' })
  s += `<rect x="26" y="122" width="150" height="22" rx="11" fill="#FFF1E6"/>`
  s += text(34, 137, '👍 친절하고 매너가 좋아요', { size: 10.5, fill: '#D45500' })
  s += `<rect x="182" y="122" width="140" height="22" rx="11" fill="#FFF1E6"/>`
  s += text(190, 137, '👍 시간 약속을 잘 지켜요', { size: 10.5, fill: '#D45500' })
  s += wrap(26, 168, [
    '중고 마이크 사면서 보컬 원데이 레슨도 받았',
    '는데 소리가 확 달라져서 신기했어요. 설명이',
    '쉽고 친절하십니다!',
  ])

  s += card(280, 150)
  s += `<circle cx="42" cy="312" r="16" fill="#E2F0DA"/>`
  s += text(42, 317, '주', { size: 13, anchor: 'middle', fill: '#557711' })
  s += text(66, 308, '상도동주민', { size: 14, weight: 'bold' })
  s += text(66, 325, '동작구 · 2025.12.03', { size: 11, fill: '#999' })
  s += wrap(26, 352, [
    '약속 시간 정확하게 지켜주시고 거래도 깔끔',
    '했습니다. 다음에 또 거래하고 싶어요.',
  ])

  // Kmong section
  s += `<rect x="0" y="470" width="${W}" height="48" fill="#FFFFFF"/>`
  s += text(16, 501, '크몽 · 서비스 평가', { size: 15, weight: 'bold' })
  s += text(160, 501, '★ 4.9 (128개 평가)', { size: 13, fill: '#FFB300' })

  s += card(534, 300)
  s += text(26, 566, 'ho****', { size: 14, weight: 'bold' })
  s += stars(26, 592, 5)
  s += text(110, 590, '2026.2.11', { size: 11, fill: '#999' })
  // per-item ratings
  s += text(26, 618, '결과물 만족도 5.0 · 친절한 상담 5.0 · 신속한 대응 5.0', { size: 11, fill: '#777' })
  // purchase option (noise line)
  s += text(26, 640, '구매 옵션: 원포인트 보컬 레슨 60분 1회', { size: 11, fill: '#AAA' })
  s += wrap(26, 668, [
    '오디션 곡 봐주셨는데 딕션이랑 브레스 포인트',
    '정리해주신게 진짜 도움됐어요. 녹음 파일로',
    '피드백 주셔서 복습하기 좋았습니다.',
  ])
  // TRAP: seller reply
  s += `<rect x="26" y="740" width="${W - 52}" height="70" rx="10" fill="#F2F4F6"/>`
  s += text(38, 764, '전문가 답변', { size: 12, weight: 'bold', fill: '#F9A825' })
  s += wrap(38, 786, ['좋은 결과 있으시길 바랍니다! 감사합니다.'], { size: 12, fill: '#555' })

  s += card(850, 190)
  s += text(26, 882, 'si***2', { size: 14, weight: 'bold' })
  s += stars(26, 908, 4)
  s += text(110, 906, '2026.1.28 · 재구매', { size: 11, fill: '#999' })
  s += wrap(26, 934, [
    '두번째 구매입니다. 지난번보다 어려운 곡으로',
    '했는데도 꼼꼼하게 봐주셨어요. 다만 예약이',
    '좀 밀려있어서 일정 잡기가 어려웠네요.',
  ])

  s += text(W / 2, 1090, '평가 더보기', { size: 13, fill: '#888', anchor: 'middle' })
  s += `</svg>`
  return { name: 'mixed-daangn-kmong.png', svg: s }
}

// ─── 3) 카카오톡 DM: 내 말풍선 제외 함정 ─────────────────────────────────
function dmSvg() {
  const H = 780
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#BACEE0"/>`
  s += `<rect width="${W}" height="48" fill="#A9C2D8"/>`
  s += text(W / 2, 31, '수강생 지현님', { size: 15, weight: 'bold', anchor: 'middle' })
  s += text(W / 2, 82, '─ 2026년 6월 14일 토요일 ─', { size: 11, fill: '#5B7A94', anchor: 'middle' })

  // customer bubble 1 (left, white) — the review
  s += `<circle cx="34" cy="122" r="16" fill="#FFF3D6"/>`
  s += text(34, 127, '지', { size: 13, anchor: 'middle', fill: '#AA8833' })
  s += `<rect x="58" y="104" width="260" height="96" rx="14" fill="#FFFFFF"/>`
  s += wrap(70, 130, [
    '쌤!! 오늘 오디션 2차 합격했어요 ㅠㅠ',
    '3개월 전엔 고음만 나오면 목 조였는데',
    '이제 편하게 올라가요. 쌤 만난게 올해',
    '제일 잘한 일이에요 진짜 감사해요!!',
  ], { size: 12.5, lh: 20 })
  s += text(326, 196, '오후 2:41', { size: 10, fill: '#5B7A94' })

  // customer bubble 2 (left) — continuation
  s += `<rect x="58" y="214" width="240" height="52" rx="14" fill="#FFFFFF"/>`
  s += wrap(70, 240, ['다음 학기에도 계속 배우고 싶은데', '토요일 오전 자리 있을까요?'], { size: 12.5, lh: 20 })
  s += text(306, 262, '오후 2:42', { size: 10, fill: '#5B7A94' })

  // TRAP: my bubbles (right, yellow)
  s += `<rect x="112" y="292" width="252" height="72" rx="14" fill="#FEE500"/>`
  s += wrap(124, 318, [
    '지현님 축하드려요!! 연습한 만큼 결과가',
    '나온거예요. 3차도 같이 준비해봐요 💪',
  ], { size: 12.5, lh: 20 })
  s += text(96, 358, '오후 3:05', { size: 10, fill: '#5B7A94', anchor: 'end' })

  s += `<rect x="150" y="378" width="214" height="48" rx="14" fill="#FEE500"/>`
  s += wrap(162, 404, ['토요일 10시 비어있어요. 잡아둘게요!'], { size: 12.5, lh: 20 })
  s += text(134, 420, '오후 3:06', { size: 10, fill: '#5B7A94', anchor: 'end' })

  // customer bubble 3 (left) — short thanks (borderline; not a review)
  s += `<rect x="58" y="446" width="150" height="40" rx="14" fill="#FFFFFF"/>`
  s += wrap(70, 471, ['네!! 감사합니다 쌤 ❤'], { size: 12.5 })
  s += text(216, 482, '오후 3:10', { size: 10, fill: '#5B7A94' })

  s += `</svg>`
  return { name: 'kakao-dm.png', svg: s }
}

const groundTruth = {
  'naver-scroll.png': {
    platform: '네이버',
    expectReviews: 3,
    traps: ['키워드 태그 집계(레슨이 체계적이에요 42 등) 제외', '사장님 답글 제외', '더보기/탭 UI 제외'],
    reviews: [
      { author: '민지언니', rating: 5, date: '2026-05-02', contentHint: '축가 준비로 8주' },
      { author: '노래하는곰', rating: 4, date: '2026-03-15', contentHint: '노래방에서 칭찬' },
      { author: '하이디', rating: null, date: null, contentHint: '입시 상담' },
    ],
  },
  'mixed-daangn-kmong.png': {
    platform: '당근+크몽 혼합',
    expectReviews: 4,
    traps: ['당근 후기 rating=null(별점 지어내기 금지)', '크몽 마스킹 닉네임 유지', '전문가 답변 제외', '구매옵션/집계(4.9) 제외'],
    reviews: [
      { platform: '당근', author: '당근이웃22', rating: null, date: '2026-01-20', contentHint: '중고 마이크' },
      { platform: '당근', author: '상도동주민', rating: null, date: '2025-12-03', contentHint: '약속 시간' },
      { platform: '크몽', author: 'ho****', rating: 5, date: '2026-02-11', contentHint: '오디션 곡' },
      { platform: '크몽', author: 'si***2', rating: 4, date: '2026-01-28', contentHint: '두번째 구매' },
    ],
  },
  'kakao-dm.png': {
    platform: '카톡 DM',
    expectReviews: '1~2 (고객 말풍선만; 연속 말풍선 병합 허용)',
    traps: ['내(노란) 말풍선 제외', '단순 인사("감사합니다 쌤") 단독 추출은 감점 아님이지만 리뷰 본문은 합격 말풍선이어야 함'],
    reviews: [
      { author: '지현', rating: null, date: '2026-06-14', contentHint: '오디션 2차 합격' },
    ],
  },
}

for (const build of [naverSvg, mixedSvg, dmSvg]) {
  const { name, svg } = build()
  const out = join(outDir, name)
  await sharp(Buffer.from(svg)).png().toFile(out)
  console.log('wrote', out)
}
writeFileSync(join(outDir, 'ground-truth.json'), JSON.stringify(groundTruth, null, 2))
console.log('wrote ground-truth.json')
