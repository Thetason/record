// Per-platform review "anatomy" so the vision model reads each platform's
// distinct layout correctly instead of applying one generic guess.
// The model sees the actual image — this just teaches it each platform's
// conventions and the traps that would otherwise corrupt extraction.

export type PlatformId =
  | '네이버'
  | '카카오'
  | '당근'
  | '숨고'
  | '크몽'
  | '인스타그램'
  | '기타'

export const PLATFORM_IDS: PlatformId[] = [
  '네이버',
  '카카오',
  '당근',
  '숨고',
  '크몽',
  '인스타그램',
  '기타',
]

type PlatformProfile = {
  id: PlatformId
  aliases: string[] // lowercased fragments that map to this platform
  // rating: how a numeric star rating appears, or that it doesn't exist
  hasStarRating: boolean
  // anatomy + quirks, injected into the extraction prompt
  guide: string
}

const PROFILES: PlatformProfile[] = [
  {
    id: '네이버',
    aliases: ['네이버', 'naver', '스마트플레이스', 'smartplace', '플레이스', '네이버지도', '네이버예약'],
    hasStarRating: true,
    guide: [
      '네이버 플레이스: 방문자 리뷰(영수증/예약 인증), 블로그 리뷰, 키워드 리뷰가 섞여 있다.',
      '- 별점: 2026년 4월 별점이 부활했다. 최근 리뷰엔 별점이 있고, 오래된 리뷰엔 없을 수 있다. 없으면 rating=null.',
      '- 작성자: 닉네임 + "N번째 방문"·방문 시점이 함께 표기되기도 한다. 닉네임만 author로.',
      '- reviewType: "방문자리뷰"/"영수증리뷰"/"블로그리뷰" 중 판별.',
      '- 반드시 건너뛸 것: 키워드 리뷰(예: "음식이 맛있어요 42", "친절해요 31" 같은 태그+숫자 집계)는 개별 리뷰가 아니라 통계이므로 추출하지 말 것.',
      '- 사장님(업체) 답글, "OO님 외 N명 방문" 요약도 건너뛸 것.',
    ].join('\n'),
  },
  {
    id: '카카오',
    aliases: ['카카오', 'kakao', '카카오맵', 'kakaomap', '카카오지도'],
    hasStarRating: true,
    guide: [
      '카카오맵: 닉네임 + 별점(5점) + 날짜 + 본문 + 사진 구조.',
      '- 별점이 보이면 1~5로, 없으면 null.',
      '- 업체 답글은 건너뛸 것.',
    ].join('\n'),
  },
  {
    id: '당근',
    aliases: ['당근', '당근마켓', 'daangn', 'karrot'],
    hasStarRating: false,
    guide: [
      '당근: 거래 후기에는 별점이 없다. 절대 별점을 지어내지 말 것 — rating=null.',
      '- 후기 = 매너칭찬 뱃지(예: "시간 약속을 잘 지켜요", "친절하고 매너가 좋아요") + 자유 텍스트.',
      '- 매너온도(36.5도~99도)는 그 사람의 종합 지표이지 이 거래의 별점이 아니다. rating으로 쓰지 말 것.',
      '- 매너칭찬 뱃지 문구는 content에 포함해도 좋다(그게 후기의 핵심일 때가 많다).',
      '- 예외: 당근 비즈니스(동네 가게) 후기에 실제 별점이 보이면 그때만 rating 사용.',
      '- reviewType: "거래후기".',
    ].join('\n'),
  },
  {
    id: '숨고',
    aliases: ['숨고', 'soomgo', '숨은고수'],
    hasStarRating: true,
    guide: [
      '숨고: 고객이 고수(전문가)에게 남긴 리뷰. 닉네임 + 별점(5점) + 서비스 카테고리/요청 항목 + 본문.',
      '- 서비스 카테고리(예: "이사/청소", "레슨")가 있으면 business에 참고로 넣어도 된다.',
      '- reviewType: "고수리뷰".',
    ].join('\n'),
  },
  {
    id: '크몽',
    aliases: ['크몽', 'kmong'],
    hasStarRating: true,
    guide: [
      '크몽: 구매자가 서비스에 남긴 리뷰. 별점은 항목별(결과물 만족도/친절한 상담/신속한 대응)로 나뉘거나 종합 5점으로 표시된다.',
      '- 항목별 별점이면 종합/평균을 rating으로. 종합 별점이 따로 있으면 그것을 사용.',
      '- 작성자 닉네임이 일부 마스킹(예: "ho****")될 수 있다. 보이는 그대로 author로.',
      '- 구매 옵션/가격 라인, 판매자 답글은 건너뛸 것.',
      '- reviewType: "구매후기".',
    ].join('\n'),
  },
  {
    id: '인스타그램',
    aliases: ['인스타', '인스타그램', 'instagram', 'dm', '디엠', '카카오톡', 'kakaotalk', '카톡', '문자', 'sms'],
    hasStarRating: false,
    guide: [
      '인스타 DM / 카카오톡 / 문자 캡처: 대화 말풍선 형태. 상대방(고객)이 보낸 말풍선이 후기다.',
      '- 별점은 보통 없다 → rating=null.',
      '- 내가(사업자 본인) 보낸 말풍선은 건너뛸 것. 상대가 보낸 후기성 메시지만 추출.',
      '- author: 대화 상대 이름이 보이면 사용, 없으면 "".',
      '- 읽음 표시·타임스탬프만 있는 줄은 무시.',
      '- reviewType: "직접후기".',
    ].join('\n'),
  },
]

const GENERAL_PROFILE = '기타 플랫폼: 별점이 보이면 1~5로, 없으면 null. 작성자 닉네임과 본문을 중심으로 추출하고 UI/광고/답글은 제외한다.'

// Longest-alias-first so "카카오톡"(DM) doesn't get swallowed by "카카오"(맵).
const ALIAS_INDEX: Array<{ alias: string; id: PlatformId }> = PROFILES.flatMap((p) =>
  p.aliases.map((a) => ({ alias: a.toLowerCase(), id: p.id }))
).sort((a, b) => b.alias.length - a.alias.length)

export function normalizePlatform(raw: string | null | undefined): PlatformId {
  const s = (raw || '').trim().toLowerCase()
  if (!s) return '기타'
  const hit = ALIAS_INDEX.find(({ alias }) => s.includes(alias))
  return hit ? hit.id : '기타'
}

// Assembled anatomy guide injected into the extraction system prompt.
export function buildPlatformGuide(): string {
  const blocks = PROFILES.map((p) => `[${p.id}]\n${p.guide}`)
  blocks.push(`[기타]\n${GENERAL_PROFILE}`)
  return blocks.join('\n\n')
}
