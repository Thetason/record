// Lightweight, free post-processing pipeline for Korean OCR text
// - Removes common UI noise lines
// - Normalizes punctuation and whitespace
// - Preserves natural word spaces; collapses spurious Hangul-separated letters
// - Masks PII and trims boilerplate

const HANGUL = /[\uAC00-\uD7AF]/

export type CleanOptions = {
  removeHashtags?: boolean
  removeUrls?: boolean
  maskPII?: boolean
  strong?: boolean
}

export function normalizeWhitespacePunct(text: string): string {
  if (!text) return text
  // Standardize newlines and remove zero-width chars
  let s = text.replace(/\r\n?/g, '\n').replace(/[\u200B-\u200D\uFEFF]/g, '')
  // Normalize spaces around punctuation
  s = s
    .replace(/\s+([,\.\!\?%\)\]\}])/g, '$1')
    .replace(/([\(\[\{])\s+/g, '$1')
  // Replace multiple spaces with single
  s = s.replace(/ {2,}/g, ' ')
  // Collapse triple dots etc.
  s = s.replace(/([.!?]){3,}/g, '$1$1')
  return s
}

export function collapseSpuriousHangulSpaces(line: string): string {
  const tokens = line.split(/\s+/).filter(Boolean)
  const singleHangul = tokens.filter(t => t.length === 1 && HANGUL.test(t)).length
  const ratio = tokens.length ? singleHangul / tokens.length : 0
  if (ratio >= 0.6) {
    // Likely "자 유 로 운" style artifacts: remove spaces between Hangul letters only
    return line.replace(/(?<=[\uAC00-\uD7AF])\s+(?=[\uAC00-\uD7AF])/g, '')
  }
  return line
}

export function stripCommonNoiseLines(text: string): string {
  const rawLines = text.split('\n').map(l => l.trim())
  const uiWords = [
    '팔로우','팔로잉','프로필','번역','공유','신고','접기','더보기','지도보기','길찾기','전화',
    '좋아요','댓글','메뉴','사장님','사장님 댓글','답글','관심'
  ]
  const isCaption = (s: string) => /리뷰\s*\d+(?:개)?\s*[·\.\-]\s*사진\s*\d+(?:장)?/.test(s)
    || /^리뷰\s*\d+(?:개)?$/.test(s) || /^사진\s*\d+(?:장)?$/.test(s)
  const isSymbolOnly = (s: string) => s.length <= 3 && /^[^\w가-힣]+$/.test(s)
  const chipKeywords = [
    '열정적','소통','맞춤','지도','체계적','실력','친절','전문','정성','세심','깔끔','깨끗','가성비','분위기','추천','재방문','설명','응대','서비스'
  ]
  const isEmojiStart = (s: string) => /^[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]\s?/u.test(s) || /^[🔥✅📈👨‍🏫👩‍🏫✨😀🙂👍👉➡️📌]/.test(s)
  const isNaverChip = (s: string) => {
    if (s.length === 0) return false
    if (s.length > 24) return false
    if (/[.,!?…]/.test(s)) return false
    const tail = /(에요|예요|좋아요|잘해요|좋습니다|괜찮아요|만족해요)$/.test(s)
    if (!tail) return false
    return isEmojiStart(s) || chipKeywords.some(k => s.includes(k))
  }
  const filtered = rawLines.filter((l, idx) => {
    if (!l) return false
    if (uiWords.some(w => l === w || l.includes(w))) return false
    if (isSymbolOnly(l)) return false
    if (idx <= 5 && isCaption(l)) return false
    if (isNaverChip(l)) return false
    return true
  })
  // cut off first noisy header lines (up to 10%)
  const startIdx = Math.min(3, Math.floor(filtered.length * 0.1))
  return filtered.slice(startIdx).join('\n').trim()
}

export function maskSensitive(text: string): string {
  if (!text) return text
  return text
    // emails
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, m => m.replace(/(^.).+(@)/, '$1***$2'))
    // phones (한글 캡처 다양성 고려)
    .replace(/(01[016789]|02|0[3-9][0-9])[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{4})/g, (_m, a) => `${a}-****-****`)
}

export function removeUrlsHashtags(text: string, removeHash = true): string {
  let s = text.replace(/https?:\/\/\S+/g, '')
  if (removeHash) s = s.replace(/(^|\s)#\S+/g, ' ')
  return s
}

export function cleanKoreanReview(text: string, opts: CleanOptions = {}): string {
  let s = text || ''
  s = normalizeWhitespacePunct(s)
  s = stripCommonNoiseLines(s)
  s = s.split('\n').map(l => collapseSpuriousHangulSpaces(l)).join('\n')
  s = fixParticlesAndUnits(s)
  if (opts.removeUrls !== false) s = removeUrlsHashtags(s, opts.removeHashtags !== false)
  if (opts.maskPII) s = maskSensitive(s)
  // strong cleanup: drop very short symbol lines
  if (opts.strong) {
    s = s.split('\n').filter(l => /[\uAC00-\uD7AFA-Za-z0-9]/.test(l) && l.length >= 2).join('\n')
  }
  // trim excessive blank lines
  s = s.split('\n').filter((l, i, arr) => !(l === '' && arr[i-1] === '')).join('\n').trim()
  return s
}

// Collapse spaces in common Korean particles and numeral units while preserving natural word spaces
export function fixParticlesAndUnits(text: string): string {
  const PARTICLES = [
    '은','는','이','가','을','를','과','와','로','으로','에','에서','에게','한테','께','께서','의',
    '까지','부터','만','뿐','도','처럼','같이','마다','대로','밖에','조차','마저','이라도','라도','이나','나','이나마','라면','라서','이며'
  ]
  // Hangul + space + particle + (end|space|punct) => collapse space
  const particleRe = new RegExp(`(?<=[\\uAC00-\\uD7AF])\\s+(?:${PARTICLES.join('|')})(?=(?:[\\s,\.!\?…:;\)\]\}”’\"]|$))`, 'g')
  // Number/alpha + unit
  const unitRe = /(\d+|[A-Za-z])\s+(차|번|명|개|년|월|일|시|분|초|회|장|건|단계|차수)(?=\b)/g
  // quotes/brackets
  const quoteRe1 = /\s+([’”"\)\]\}])/g; // before closing quotes/brackets
  const quoteRe2 = /([‘“"\(\[\{])\s+/g; // after opening quotes/brackets
  // collapse spaces around middle dots/bullets frequently coming from OCR
  const midDot = /\s*[·•]\s*/g
  return text
    .replace(particleRe, (m) => m.replace(/\s+/g, ''))
    .replace(unitRe, '$1$2')
    .replace(quoteRe1, '$1')
    .replace(quoteRe2, '$1')
    .replace(midDot, ' · ')
}

export default cleanKoreanReview
