# 🔍 Re:cord OCR 구현 가이드

## 📋 현재 상태

OCR 기능이 완전히 구현되어 있으며, Google Vision API 키만 설정하면 즉시 작동합니다.

### ✅ 구현 완료된 기능

1. **OCR API 엔드포인트** (`/api/ocr/route.ts`)
   - Google Vision API 클라이언트 통합
   - 이미지 텍스트 추출
   - 리뷰 데이터 자동 분석
   - Mock 데이터 폴백 (API 키 없을 때)

2. **OCR 테스트 페이지** (`/dashboard/ocr-test`)
   - 드래그 앤 드롭 업로드
   - 이미지 미리보기
   - 실시간 OCR 결과 표시
   - 플랫폼/평점/날짜 자동 추출

3. **지원 기능**
   - 네이버, 카카오, 인스타그램, 구글 리뷰 자동 감지
   - 별점 및 숫자 평점 추출
   - 날짜 자동 파싱
   - 작성자명 추출

## 🚀 Google Vision API 설정 방법

### 방법 1: 자동 설정 스크립트 사용 (추천)

```bash
# 설정 스크립트 실행
node scripts/setup-google-vision.js
```

스크립트가 단계별로 안내합니다.

### 방법 2: 수동 설정

#### Step 1: Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 (프로젝트 이름: `record-ocr`)

#### Step 2: Vision API 활성화

1. 왼쪽 메뉴 → "API 및 서비스" → "라이브러리"
2. "Cloud Vision API" 검색
3. "사용" 버튼 클릭

#### Step 3: 서비스 계정 생성

1. "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "서비스 계정"
3. 서비스 계정 이름: `record-ocr-service`
4. 역할: "기본" → "소유자" 선택

#### Step 4: JSON 키 다운로드

1. 생성된 서비스 계정 클릭
2. "키" 탭 → "키 추가" → "새 키 만들기"
3. "JSON" 선택 후 "만들기"

#### Step 5: 환경 변수 설정

##### 로컬 개발 환경

```bash
# .env 파일
GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json
```

JSON 파일을 프로젝트 루트에 `google-vision-key.json`으로 저장

##### Vercel 프로덕션 환경

1. JSON 파일을 Base64로 인코딩:
```bash
base64 -i google-vision-key.json -o encoded-key.txt
```

2. Vercel 대시보드 → Settings → Environment Variables:
```
GOOGLE_VISION_API_KEY = [encoded-key.txt 내용]
```

## 🧪 테스트 방법

1. 개발 서버 실행:
```bash
npm run dev
```

2. 브라우저에서 접속:
```
http://localhost:3001/dashboard/ocr-test
```

3. 리뷰 스크린샷 업로드

4. 결과 확인:
   - **API 키 설정됨**: 실제 OCR 결과
   - **API 키 없음**: Mock 데이터 (개발용)

## 📝 API 사용 예제

### 요청

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/ocr', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### 응답

```json
{
  "success": true,
  "data": {
    "text": "전체 추출된 텍스트",
    "platform": "naver",
    "rating": 5,
    "date": "2024-12-15",
    "author": "김고객",
    "confidence": 0.95
  }
}
```

## 💰 비용 정보

### Google Vision API 가격

- **무료 할당량**: 월 1,000건
- **추가 요청**: 1,000건당 $1.50
- **월 예상 비용** (1,000명 사용자 기준):
  - 평균 5장/사용자 = 5,000건
  - 비용: (5,000 - 1,000) × $1.50 / 1,000 = $6

### 비용 절감 팁

1. 이미지 크기 최적화 (업로드 전 리사이징)
2. 클라이언트 측 이미지 압축
3. 중복 이미지 체크
4. 캐싱 활용

## 🔒 보안 고려사항

1. **API 키 보호**
   - 절대 GitHub에 커밋하지 않기
   - `.gitignore`에 키 파일 추가
   - 환경 변수로만 관리

2. **Rate Limiting**
   - 사용자당 일일 한도 설정
   - IP 기반 제한

3. **이미지 검증**
   - 파일 타입 체크
   - 파일 크기 제한 (10MB)
   - 악성 코드 스캔

## 🐛 문제 해결

### "API 키가 설정되지 않음" 오류

1. `.env` 파일 확인
2. 환경 변수명 확인
3. JSON 파일 경로 확인

### "권한 부족" 오류

1. 서비스 계정 역할 확인 (Owner 권한 필요)
2. Vision API 활성화 확인
3. 결제 계정 등록 확인

### "할당량 초과" 오류

1. Google Cloud Console에서 할당량 확인
2. 결제 설정 확인
3. 할당량 증가 요청

## 📊 성능 최적화

1. **이미지 전처리**
   - 클라이언트에서 리사이징
   - WebP 포맷 변환
   - 압축 적용

2. **배치 처리**
   - 여러 이미지 동시 업로드
   - 비동기 처리

3. **캐싱**
   - 동일 이미지 재처리 방지
   - 결과 캐싱

## 🎯 다음 단계

1. **고급 기능 추가**
   - [ ] 손글씨 인식
   - [ ] 다국어 지원
   - [ ] 테이블/레이아웃 분석

2. **사용자 경험 개선**
   - [ ] 실시간 진행 표시
   - [ ] 배치 업로드 UI
   - [ ] OCR 결과 수정 기능

3. **통합 기능**
   - [ ] 자동 리뷰 등록
   - [ ] 플랫폼별 템플릿
   - [ ] AI 기반 감정 분석

## 📞 지원

문제가 있으신가요?

1. [GitHub Issues](https://github.com/yourusername/record)에 문의
2. 이메일: support@record.com
3. 디스코드: [Re:cord 커뮤니티](https://discord.gg/record)

---

*최종 업데이트: 2025년 1월 9일*
*작성자: Re:cord 개발팀*