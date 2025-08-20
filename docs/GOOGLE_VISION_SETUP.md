# Google Vision API 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 ID 메모

### 1.2 Vision API 활성화
1. API 및 서비스 > 라이브러리
2. "Cloud Vision API" 검색
3. "사용 설정" 클릭

### 1.3 서비스 계정 생성
1. IAM 및 관리자 > 서비스 계정
2. "서비스 계정 만들기" 클릭
3. 다음 정보 입력:
   - 서비스 계정 이름: `record-ocr-service`
   - 서비스 계정 ID: 자동 생성됨
   - 설명: "Re:cord OCR 서비스용"

### 1.4 키 생성 및 다운로드
1. 생성된 서비스 계정 클릭
2. "키" 탭 선택
3. "키 추가" > "새 키 만들기"
4. JSON 형식 선택
5. 키 파일 다운로드 (안전한 곳에 보관)

## 2. 환경 변수 설정

### 2.1 로컬 개발 환경
`.env.local` 파일에 추가:
```env
# Google Vision API
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### 2.2 키 파일 배치
1. 프로젝트 루트에 `credentials` 폴더 생성
2. 다운로드한 JSON 키 파일을 `credentials/google-vision-key.json`으로 저장
3. `.gitignore`에 `credentials/` 추가 (중요!)

### 2.3 Vercel 배포 환경
1. Vercel 대시보드 > Settings > Environment Variables
2. 다음 변수 추가:
   - `GOOGLE_VISION_API_KEY`: JSON 키 파일의 내용을 Base64로 인코딩
   - `GOOGLE_CLOUD_PROJECT_ID`: 프로젝트 ID

Base64 인코딩 방법:
```bash
# Mac/Linux
base64 -i google-vision-key.json | pbcopy

# 또는 온라인 Base64 인코더 사용
```

## 3. 코드 수정 (프로덕션용)

`app/api/ocr/route.ts` 수정:
```typescript
// 프로덕션 환경에서는 환경 변수에서 키 읽기
const client = process.env.NODE_ENV === 'production' 
  ? new vision.ImageAnnotatorClient({
      credentials: JSON.parse(
        Buffer.from(process.env.GOOGLE_VISION_API_KEY!, 'base64').toString()
      ),
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })
  : new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    })
```

## 4. 요금 정보

### 무료 할당량
- 매월 첫 1,000건 무료
- TEXT_DETECTION: 1,000건/월

### 유료 요금
- 1,001 ~ 5,000,000건: $1.50 / 1,000건
- 5,000,001건 이상: $0.60 / 1,000건

### 예상 비용
- 사용자 100명, 각 10개 리뷰 업로드 = 1,000건/월 = **무료**
- 사용자 1,000명, 각 10개 리뷰 업로드 = 10,000건/월 = **약 $13.50**

## 5. 보안 주의사항

⚠️ **절대 하지 말아야 할 것:**
- JSON 키 파일을 Git에 커밋
- 클라이언트 사이드에서 API 키 노출
- 공개 저장소에 키 정보 포함

✅ **반드시 해야 할 것:**
- `.gitignore`에 키 파일 경로 추가
- 환경 변수로 관리
- 서버 사이드에서만 API 호출
- 정기적으로 키 로테이션

## 6. 테스트

```bash
# 로컬 테스트
npm run dev

# /dashboard/add-review 페이지에서 이미지 업로드 테스트
```

## 7. 트러블슈팅

### "API not enabled" 오류
→ Cloud Vision API 활성화 확인

### "Invalid credentials" 오류
→ 키 파일 경로 및 권한 확인

### "Quota exceeded" 오류
→ 무료 할당량 초과, 결제 설정 필요

### "Permission denied" 오류
→ 서비스 계정에 Vision API 권한 부여 필요