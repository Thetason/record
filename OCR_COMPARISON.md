# 📊 OCR 기술 비교 분석 - Re:cord

## 1. 주요 OCR 서비스 비교

### Google Vision API
- **정확도**: ⭐⭐⭐⭐⭐ (95%+) - 한글 인식 최고 수준
- **가격**: $1.5 / 1000건 (첫 1000건 무료/월)
- **장점**: 
  - 뛰어난 한글 인식률
  - 손글씨, 흐릿한 이미지도 잘 처리
  - 다양한 이미지 포맷 지원
- **단점**: 
  - 상대적으로 높은 비용
  - API 호출 제한
  - 인터넷 연결 필수

### AWS Textract
- **정확도**: ⭐⭐⭐⭐ (90%+)
- **가격**: $1.5 / 1000페이지 (표 추출 시 $15/1000페이지)
- **장점**:
  - 표/양식 구조 인식 우수
  - AWS 생태계와 통합 용이
- **단점**:
  - 한글 인식률이 Google보다 낮음
  - 복잡한 레이아웃에 약함

### Azure Computer Vision
- **정확도**: ⭐⭐⭐⭐ (88%+)
- **가격**: $1 / 1000건 (첫 5000건 무료/월)
- **장점**:
  - 가격 대비 성능 우수
  - 무료 티어가 넉넉함
- **단점**:
  - 한글 손글씨 인식 약함
  - 지역 제한 있음

### Naver Clova OCR
- **정확도**: ⭐⭐⭐⭐⭐ (95%+) - 한글 특화
- **가격**: ₩2.5 / 건 (첫 300건 무료/일)
- **장점**:
  - 한글 최적화 (네이버 리뷰에 최적)
  - 국내 서비스로 빠른 응답
  - 신분증, 명함 등 특화 템플릿
- **단점**:
  - 해외 플랫폼 텍스트는 약함
  - API 문서가 영어 지원 부족

### Tesseract.js (오픈소스)
- **정확도**: ⭐⭐⭐ (70-80%)
- **가격**: 무료
- **장점**:
  - 완전 무료
  - 클라이언트 사이드 실행 가능
  - 오프라인 작동
- **단점**:
  - 한글 인식률 낮음
  - 전처리 필수
  - 느린 처리 속도

## 2. Re:cord에 최적화된 하이브리드 전략

### 🎯 추천 아키텍처: 3단계 OCR 시스템

```
1차: 클라이언트 사이드 (Tesseract.js)
   ↓ (실패 또는 낮은 신뢰도)
2차: Naver Clova OCR (네이버/카카오 리뷰)
   ↓ (실패 또는 구글/인스타 리뷰)
3차: Google Vision API (최종 폴백)
```

### 구현 방식

#### Phase 1: 기본 OCR (무료)
```javascript
// 1. Tesseract.js로 1차 시도
const result = await Tesseract.recognize(image, 'kor');
if (result.confidence > 85) {
  return result.text;
}

// 2. 이미지 전처리 후 재시도
const processed = await preprocessImage(image);
const retry = await Tesseract.recognize(processed, 'kor');
if (retry.confidence > 80) {
  return retry.text;
}
```

#### Phase 2: 플랫폼별 최적화
```javascript
// 네이버/카카오 리뷰 → Naver Clova
if (platform === 'naver' || platform === 'kakao') {
  return await clovaOCR(image);
}

// 구글/인스타 → Google Vision
if (platform === 'google' || platform === 'instagram') {
  return await googleVision(image);
}
```

#### Phase 3: 스마트 캐싱
```javascript
// 동일 이미지 해시 체크
const imageHash = await hashImage(image);
const cached = await getCachedOCR(imageHash);
if (cached) return cached;

// OCR 수행 후 캐싱
const text = await performOCR(image);
await cacheOCR(imageHash, text);
```

## 3. 비용 절감 전략

### A. 이미지 전처리 최적화
```javascript
// Sharp.js로 이미지 최적화
const optimized = await sharp(image)
  .resize(1200, null, { withoutEnlargement: true })
  .grayscale()
  .normalize()
  .sharpen()
  .toBuffer();
```

### B. 텍스트 영역 자동 감지
```javascript
// 리뷰 텍스트 영역만 크롭
const textRegion = await detectTextRegion(image);
const cropped = await cropImage(image, textRegion);
```

### C. 벌크 처리 할인
- Google Vision: 월 10만건 이상 시 할인
- Naver Clova: 대량 계약 시 협상 가능

## 4. 예상 비용 시뮬레이션

### 월 10,000건 처리 기준

| 방식 | 월 비용 | 정확도 |
|------|---------|--------|
| 100% Google Vision | $15 | 95% |
| 100% Tesseract.js | $0 | 75% |
| **하이브리드 (추천)** | **$3-5** | **90%** |

### 하이브리드 상세 분석
- 60% Tesseract.js 성공 (무료)
- 25% Naver Clova (₩6,250 ≈ $5)
- 15% Google Vision ($2.25)
- **총 비용: 약 $7.25 → 캐싱으로 $3-5로 절감**

## 5. 구현 우선순위

### Phase 1 (1주차) ✅
1. Tesseract.js 통합
2. 이미지 전처리 파이프라인
3. 기본 OCR UI

### Phase 2 (2주차)
1. Naver Clova OCR 연동
2. 플랫폼별 라우팅 로직
3. 신뢰도 기반 폴백

### Phase 3 (3주차)
1. 캐싱 시스템
2. 벌크 업로드 최적화
3. 수동 보정 UI

## 6. 기술적 고려사항

### 보안
- 이미지는 처리 후 즉시 삭제
- OCR 결과만 암호화 저장
- 개인정보 자동 마스킹

### 성능
- 웹 워커로 Tesseract.js 실행
- 이미지 리사이징으로 처리 속도 향상
- 프로그레시브 업로드

### UX
- 실시간 OCR 진행률 표시
- 텍스트 수정 가능한 에디터
- 드래그 앤 드롭 지원

## 7. 결론

### 💎 최종 추천
**하이브리드 3단계 시스템**이 Re:cord에 최적입니다.

**이유:**
1. 초기 비용 부담 최소화 (무료 시작 가능)
2. 점진적 품질 향상 가능
3. 사용량 증가에 따른 유연한 대응
4. 한글 리뷰 특성에 최적화

**예상 효과:**
- OCR 비용 80% 절감
- 정확도 90% 유지
- 사용자 만족도 향상 (빠른 응답)

---

*최종 업데이트: 2025.08.09*
*작성: Re:cord 개발팀*