# 🍋 레몬스퀴즈 연동 가이드

## 1. 레몬스퀴즈 계정 설정

### 1-1. API 키 발급
1. https://app.lemonsqueezy.com/settings/api 접속
2. **Create API Key** 클릭
3. 키 이름: `Record Production API`
4. 생성된 API 키 복사 → `.env.local`의 `LEMONSQUEEZY_API_KEY`에 저장

### 1-2. Store ID 확인
1. https://app.lemonsqueezy.com/settings/stores 접속
2. Store ID 복사 → `.env.local`의 `LEMONSQUEEZY_STORE_ID`에 저장

### 1-3. 제품 생성
1. https://app.lemonsqueezy.com/products 접속
2. **New Product** 클릭

#### Premium 플랜
- **이름**: Re:cord Premium
- **설명**: 프리랜서를 위한 리뷰 관리 플랜
- **가격**: 월 ₩9,900 / 연 ₩99,000
- **기능**:
  - 무제한 리뷰 업로드
  - 고급 통계 대시보드
  - 프로필 커스터마이징
  - 우선 고객 지원

#### Pro 플랜
- **이름**: Re:cord Pro
- **설명**: 비즈니스를 위한 프리미엄 플랜
- **가격**: 월 ₩19,900 / 연 ₩199,000
- **기능**:
  - Premium 모든 기능
  - 커스텀 도메인
  - 고급 OCR (Google Vision)
  - 화이트라벨 (준비중)
  - 전담 지원

### 1-4. Variant ID 확인
1. 생성한 제품 클릭
2. **Variants** 탭에서 각 Variant ID 복사
3. `.env.local`에 저장:
   - `LEMONSQUEEZY_PREMIUM_VARIANT_ID`
   - `LEMONSQUEEZY_PRO_VARIANT_ID`

### 1-5. 웹훅 설정
1. https://app.lemonsqueezy.com/settings/webhooks 접속
2. **Add Endpoint** 클릭
3. **Webhook URL**: `https://your-domain.com/api/webhooks/lemonsqueezy`
4. **Signing Secret** 생성 및 복사 → `.env.local`의 `LEMONSQUEEZY_SIGNING_SECRET`에 저장
5. **Events** 선택:
   - ✅ `order_created` - 주문 생성
   - ✅ `subscription_created` - 구독 시작
   - ✅ `subscription_updated` - 구독 변경
   - ✅ `subscription_cancelled` - 구독 취소
   - ✅ `subscription_resumed` - 구독 재개
   - ✅ `subscription_expired` - 구독 만료
   - ✅ `subscription_paused` - 구독 일시정지
   - ✅ `subscription_unpaused` - 구독 재개
6. **Create Webhook** 클릭

---

## 2. 환경변수 설정

`.env.local` 파일에 다음 변수 추가:

```bash
# 레몬스퀴즈 API
LEMONSQUEEZY_API_KEY="your_api_key_here"
LEMONSQUEEZY_STORE_ID="your_store_id"
LEMONSQUEEZY_SIGNING_SECRET="your_signing_secret"

# 제품 Variant ID
LEMONSQUEEZY_PREMIUM_VARIANT_ID="123456"
LEMONSQUEEZY_PRO_VARIANT_ID="789012"

# 웹훅 URL
LEMONSQUEEZY_WEBHOOK_URL="https://your-domain.com/api/webhooks/lemonsqueezy"
```

---

## 3. 코드 구현 확인

### 3-1. API 라우트
- `/app/api/lemonsqueezy/checkout/route.ts` - 결제 체크아웃
- `/app/api/lemonsqueezy/subscription/route.ts` - 구독 조회
- `/app/api/webhooks/lemonsqueezy/route.ts` - 웹훅 수신

### 3-2. 프론트엔드 페이지
- `/app/pricing/page.tsx` - 가격 정책 페이지
- `/app/dashboard/subscription/page.tsx` - 구독 관리

---

## 4. 테스트

### 4-1. 로컬 테스트
```bash
# 개발 서버 실행
npm run dev

# 웹훅 테스트 (ngrok 필요)
ngrok http 3001
# ngrok URL을 레몬스퀴즈 웹훅 URL에 등록
```

### 4-2. 결제 테스트
1. http://localhost:3001/pricing 접속
2. Premium 또는 Pro 플랜 선택
3. **레몬스퀴즈 테스트 모드** 사용:
   - 테스트 카드: `4242 4242 4242 4242`
   - 만료일: 미래 날짜 아무거나
   - CVC: 아무 3자리

### 4-3. 웹훅 테스트
1. 레몬스퀴즈 대시보드 → Webhooks
2. 생성한 웹훅 클릭
3. **Send test event** 클릭
4. `subscription_created` 이벤트 전송
5. 서버 로그 확인

---

## 5. 프로덕션 배포

### 5-1. Vercel 환경변수 설정
```bash
vercel env add LEMONSQUEEZY_API_KEY
vercel env add LEMONSQUEEZY_STORE_ID
vercel env add LEMONSQUEEZY_SIGNING_SECRET
vercel env add LEMONSQUEEZY_PREMIUM_VARIANT_ID
vercel env add LEMONSQUEEZY_PRO_VARIANT_ID
```

### 5-2. 웹훅 URL 업데이트
- 레몬스퀴즈 대시보드에서 웹훅 URL을 프로덕션 도메인으로 변경
- 예: `https://record.vercel.app/api/webhooks/lemonsqueezy`

---

## 6. 문제 해결

### Q1. 웹훅이 작동하지 않아요
- 레몬스퀴즈 대시보드에서 웹훅 로그 확인
- 서버 로그에서 에러 메시지 확인
- Signing Secret이 올바른지 확인

### Q2. 결제 후 플랜이 업그레이드되지 않아요
- 웹훅이 정상 수신되었는지 확인
- 데이터베이스에 구독 정보가 저장되었는지 확인
- `/app/api/webhooks/lemonsqueezy/route.ts` 로그 확인

### Q3. 테스트 결제가 실제 결제로 처리돼요
- 레몬스퀴즈 대시보드에서 **Test Mode** 활성화 확인
- 프로덕션 배포 전 반드시 테스트 모드로 확인

---

## 7. 참고 자료

- [레몬스퀴즈 공식 문서](https://docs.lemonsqueezy.com)
- [레몬스퀴즈 API 레퍼런스](https://docs.lemonsqueezy.com/api)
- [레몬스퀴즈 웹훅 가이드](https://docs.lemonsqueezy.com/guides/developer/webhooks)
- [레몬스퀴즈 SDK (비공식)](https://github.com/lmsqueezy/lemonsqueezy.js)
