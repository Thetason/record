export const SHOWCASE_AUDIENCES = [
  {
    key: 'vocal',
    label: '실용음악강사',
    eyebrow: '실제 사용자',
    description: '세타쓴님의 실제 공개 프로필입니다. 데모가 아니라, 지금 운영 중인 링크가 이렇게 일합니다.',
  },
  {
    key: 'hair',
    label: '헤어디자이너',
    eyebrow: '데모 예시',
    description: '샵을 옮기거나 1인샵을 준비하는 디자이너가 상담 전에 보내는 링크 예시입니다.',
  },
  {
    key: 'pilates',
    label: '필라테스 강사',
    eyebrow: '데모 예시',
    description: '프라이빗 레슨과 체형 교정 중심의 강사가 쓸 수 있는 구조를 같은 레이아웃으로 보여줍니다.',
  },
] as const

export type ShowcaseAudienceKey = (typeof SHOWCASE_AUDIENCES)[number]['key']

export const SHOWCASE_CAREER_CONTENT: Record<
  ShowcaseAudienceKey,
  {
    headline: string
    intro: string
    entries: Array<{ year: string; title: string; detail: string }>
  }
> = {
  vocal: {
    headline: '2016년부터 이어온 보컬 커리어',
    intro: '후기만으로 다 담기지 않는 활동 이력과 레슨 업력을 한눈에 보여주는 섹션입니다.',
    entries: [
      { year: '2016', title: '서울에서 보컬 트레이닝 활동 시작', detail: '취미 보컬과 기초 발성 중심으로 레슨을 시작했습니다.' },
      { year: '2019', title: '1:1 맞춤 보컬 코칭 확장', detail: '개인별 발성 교정과 오디션·입시 상담 비중을 높였습니다.' },
      { year: '2022', title: '후기 기반 소개와 재문의 루프 정착', detail: '직접 받은 후기와 플랫폼 리뷰가 꾸준히 쌓이기 시작했습니다.' },
      { year: '2026', title: 'Re:cord 공개 프로필 운영', detail: '리뷰, 포트폴리오, 문의 링크를 한 화면으로 연결합니다.' },
    ],
  },
  hair: {
    headline: '샵 이동 후에도 이어지는 헤어 커리어',
    intro: '이직과 독립 이후에도 고객이 바로 이해할 수 있게, 활동 흐름과 결과물을 함께 보여줍니다.',
    entries: [
      { year: '2017', title: '살롱 커리어 시작', detail: '커트와 기본 컬러 시술 중심으로 현장 경험을 쌓았습니다.' },
      { year: '2020', title: '레이어드컷·톤다운 컬러 집중', detail: '재방문 고객이 늘며 전문 스타일이 분명해졌습니다.' },
      { year: '2023', title: '상담형 디자이너로 자리잡음', detail: '얼굴형·손질 방식까지 함께 안내하는 흐름이 강점이 됐습니다.' },
      { year: '2026', title: 'Re:cord 공개 프로필 운영', detail: '샵을 옮겨도 리뷰와 포트폴리오를 한 링크로 전달합니다.' },
    ],
  },
  pilates: {
    headline: '체형 교정 경험이 쌓인 필라테스 커리어',
    intro: '수업 전문성과 레슨 분위기를 함께 보여줘, 첫 상담 전에 신뢰가 생기게 합니다.',
    entries: [
      { year: '2018', title: '필라테스 지도 시작', detail: '기초 체형 교정과 프라이빗 수업 중심으로 활동을 시작했습니다.' },
      { year: '2021', title: '호흡 코칭과 자세 교정 집중', detail: '수업 만족도가 높아지며 소개 문의가 늘어났습니다.' },
      { year: '2024', title: '프라이빗 레슨 운영 안정화', detail: '직접 받은 후기와 전후 수업 흐름이 강한 소개 포인트가 됐습니다.' },
      { year: '2026', title: 'Re:cord 공개 프로필 운영', detail: '리뷰, 포트폴리오, 문의 링크를 한 번에 전달합니다.' },
    ],
  },
}

export const HERO_PLATFORMS = ['네이버', '카카오', '당근', '숨고', '크몽'] as const

export const LIVE_VOCAL_PROFILE_URL = 'https://www.recordyours.com/syb2020'

// The three reviews the AI-scan cinema cycles through. Fictional but shaped
// exactly like the real extraction output (author/rating/date/content).
export const SCAN_DEMO_REVIEWS = [
  {
    platform: '네이버',
    author: '민지언니',
    rating: 5,
    date: '2026. 5. 2.',
    content: '축가 준비로 8주 다녔어요. 호흡부터 고음까지 단계별로 잡아주셔서 결혼식에서 무사히 잘 불렀습니다.',
  },
  {
    platform: '당근',
    author: '상도동주민',
    rating: null,
    date: '2025. 12. 3.',
    content: '약속 시간 정확하게 지켜주시고 거래도 깔끔했습니다. 다음에 또 거래하고 싶어요.',
  },
  {
    platform: '크몽',
    author: 'ho****',
    rating: 5,
    date: '2026. 2. 11.',
    content: '오디션 곡 봐주셨는데 딕션이랑 브레스 포인트 정리해주신 게 진짜 도움됐어요.',
  },
] as const
