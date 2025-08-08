# OCR 기능 설정 가이드

## Google Vision API 설정

### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Vision API 활성화:
   - API 및 서비스 > 라이브러리
   - "Cloud Vision API" 검색
   - "사용 설정" 클릭

### 2. API 키 생성
1. API 및 서비스 > 사용자 인증 정보
2. "+ 사용자 인증 정보 만들기" > "API 키"
3. 생성된 API 키 복사

### 3. 환경변수 설정
`.env.local` 파일에 API 키 추가:
```
GOOGLE_VISION_API_KEY=여기에_생성한_API_키_입력
```

### 4. API 키 보안 설정 (권장)
1. API 키 수정 클릭
2. "애플리케이션 제한사항" > "HTTP 리퍼러"
3. 허용된 리퍼러 추가:
   - `http://localhost:3000/*` (개발용)
   - `https://your-domain.com/*` (프로덕션용)
4. "API 제한사항" > "키 제한"
5. "Cloud Vision API" 선택

## 현재 구현된 기능

### OCR API (`/api/ocr`)
- 이미지에서 텍스트 추출
- 리뷰 관련 정보 자동 파싱:
  - 제품명/서비스명
  - 평점
  - 리뷰 날짜
  - 카테고리 자동 분류

### 리뷰 추가 페이지 통합
- 이미지 업로드 후 "텍스트 추출" 버튼 클릭
- 추출된 정보가 자동으로 폼에 입력됨
- 필요시 수정 후 저장 가능

## 데모 모드
Google Vision API 키가 설정되지 않은 경우:
- 데모 텍스트가 자동으로 입력됨
- 실제 OCR 기능 테스트를 위해서는 API 키 설정 필요

## 요금 정보
- Google Vision API: 월 1,000건 무료
- 이후 1,000건당 $1.50
- 자세한 요금: https://cloud.google.com/vision/pricing

## 문제 해결

### API 키가 작동하지 않는 경우
1. Vision API가 활성화되어 있는지 확인
2. 결제 계정이 연결되어 있는지 확인
3. API 키에 올바른 권한이 있는지 확인

### 텍스트 추출이 정확하지 않은 경우
1. 이미지 품질 확인 (선명한 이미지 사용)
2. 텍스트가 수평으로 정렬되어 있는지 확인
3. 이미지 크기가 너무 크거나 작지 않은지 확인