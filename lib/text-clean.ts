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
    return line.replace(/(?<=\p{Script=Hangul})\s+(?=\p{Script=Hangul})/gu, '')
  }
  return line
}

export function stripCommonNoiseLines(text: string): string {
  const rawLines = text.split('\n').map(l => l.trim())
  const uiWords = [
    '팔로우','팔로잉','프로필','번역','공유','신고','접기','더보기','지도보기','길찾기','전화',
    '좋아요','댓글','메뉴','사장님','사장님 댓글','답글','관심'
  ]
  const isSymbolOnly = (s: string) => s.length <= 3 && /^[^\w가-힣]+$/.test(s)
  const filtered = rawLines.filter(l => l && !uiWords.some(w => l === w || l.includes(w)) && !isSymbolOnly(l))
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
  if (opts.removeUrls !== false) s = removeUrlsHashtags(s, opts.removeHashtags !== false)
  if (opts.maskPII) s = maskSensitive(s)
  // strong cleanup: drop very short symbol lines
  if (opts.strong) {
    s = s.split('\n').filter(l => /[\p{Script=Hangul}A-Za-z0-9]/u.test(l) && l.length >= 2).join('\n')
  }
  // trim excessive blank lines
  s = s.split('\n').filter((l, i, arr) => !(l === '' && arr[i-1] === '')).join('\n').trim()
  return s
}

export default cleanKoreanReview

