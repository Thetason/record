// 판매 중인 유료 상품은 이것 하나다 (VIABILITY_VERDICT_2026-07-03, 2026-10-12 작전서).
// 가격을 바꿀 때는 여기만 고친다 — pricing·결제 안내 페이지가 모두 이 값을 읽는다.

export const SETUP_PACKAGE = {
  name: '세팅 패키지',
  price: 150000,
  includedProMonths: 3,
  summary: '흩어진 후기를 옮기고, 상담에 바로 보낼 링크를 대신 완성해드립니다.',
  bullets: [
    '네이버·카카오·당근·숨고·크몽 등 기존 후기 이관',
    '상담에서 먼저 보여줄 대표 후기 3개 선별',
    '프로필·작업 사진·상담 버튼까지 완성',
    '프로 3개월 포함 (Re:cord 브랜딩 제거, 프로필 테마)',
  ],
} as const

export function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

// 원화 결제 수단. 값이 없으면 해당 안내를 숨기고 신청서로 연결한다.
// NEXT_PUBLIC_* 는 빌드 시점에 박히므로, 값을 바꾸면 재배포해야 반영된다.
export function getPaymentChannels() {
  const bankName = process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME?.trim() || ''
  const bankAccount = process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT?.trim() || ''
  const bankHolder = process.env.NEXT_PUBLIC_PAYMENT_BANK_HOLDER?.trim() || ''
  const kakaoUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL?.trim() || ''

  return {
    bank: bankName && bankAccount ? { bankName, bankAccount, bankHolder } : null,
    kakaoUrl: /^https:\/\//.test(kakaoUrl) ? kakaoUrl : null,
  }
}
