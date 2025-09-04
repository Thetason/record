# 🚀 OCR 빠른 설정 가이드 (5분 완료)

## 즉시 설정하기

### 1️⃣ Google Cloud 계정 준비 (1분)
- https://console.cloud.google.com 접속
- Google 계정으로 로그인
- 무료 크레딧 $300 자동 제공!

### 2️⃣ 자동 설정 스크립트 실행 (3분)
```bash
node scripts/setup-google-vision.js
```
스크립트가 모든 과정을 안내합니다!

### 3️⃣ 테스트 (1분)
```bash
npm run dev
```
브라우저에서 http://localhost:3001/dashboard/ocr-test 접속

## ✅ 완료!

이제 리뷰 스크린샷을 업로드하면 자동으로 텍스트가 추출됩니다.

### 🎯 추출 가능한 정보
- 리뷰 텍스트
- 플랫폼 (네이버/카카오/구글/인스타)
- 평점 (⭐ 별점)
- 작성 날짜
- 작성자명

### 💰 비용
- **무료**: 월 1,000건
- **추가**: 1,000건당 $1.50 (약 2,000원)
- 일반 사용자는 무료 할당량으로 충분!

### ⚠️ 문제 발생 시
1. `.env` 파일 확인
2. Google Cloud Console에서 Vision API 활성화 확인
3. 서비스 계정 권한 확인 (Owner 권한 필요)

---
문의: support@record.com