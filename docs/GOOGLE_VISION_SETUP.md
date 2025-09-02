# Google Vision API 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 1.2 Vision API 활성화
1. 좌측 메뉴 → "API 및 서비스" → "라이브러리"
2. "Cloud Vision API" 검색
3. "사용 설정" 클릭

### 1.3 서비스 계정 생성
1. 좌측 메뉴 → "IAM 및 관리자" → "서비스 계정"
2. "서비스 계정 만들기" 클릭
3. 서비스 계정 이름 입력 (예: "record-ocr")
4. "만들기 및 계속" 클릭
5. 역할 선택: "Cloud Vision API 사용자" 또는 "편집자"
6. "완료" 클릭

### 1.4 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. "키" 탭 → "키 추가" → "새 키 만들기"
3. JSON 형식 선택
4. 다운로드된 JSON 파일 저장

## 2. 프로젝트 환경변수 설정

### 옵션 1: JSON 파일 사용 (로컬 개발)
```bash
# .env 파일에 추가
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

### 옵션 2: Base64 인코딩 (Vercel 배포)
```bash
# JSON 파일을 Base64로 인코딩
base64 -i service-account-key.json -o encoded-key.txt

# .env 파일에 추가
GOOGLE_VISION_API_KEY=<encoded-key.txt의 내용>
```

## 3. 비용 정보

### 무료 사용량 (매월)
- 첫 1,000개 요청: 무료
- TEXT_DETECTION 기능 포함

### 유료 가격
- 1,001 ~ 5,000,000개: 요청당 $1.50 / 1,000개
- 한국 원화: 약 2원/요청

### 월간 예상 비용
- 100명 사용자, 각 30개 리뷰: 3,000개 요청
- 첫 1,000개 무료
- 추가 2,000개: $3 (약 4,000원)

## 4. 설정 확인

```bash
# 개발 서버 재시작
npm run dev

# 테스트 페이지 접속
http://localhost:3004/test-ocr
```

## 5. Vercel 배포 설정

1. Vercel 대시보드 → Settings → Environment Variables
2. 다음 변수 추가:
   - `GOOGLE_VISION_API_KEY`: Base64 인코딩된 서비스 계정 키
   - 또는 각각의 키를 개별 환경변수로 설정

## 6. 보안 주의사항

⚠️ **중요**: 
- 서비스 계정 키 JSON 파일을 절대 Git에 커밋하지 마세요
- `.gitignore`에 포함되어 있는지 확인
- 프로덕션에서는 항상 환경변수 사용

## 7. 할당량 관리

Google Cloud Console에서 할당량 모니터링:
1. "API 및 서비스" → "할당량"
2. Cloud Vision API 선택
3. 사용량 및 한도 확인

일일 한도 설정 가능 (비용 관리용)