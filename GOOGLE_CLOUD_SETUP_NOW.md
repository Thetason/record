# 🔥 Google Cloud Vision API 즉시 설정하기

이미 Google Cloud 계정을 만드셨으니 바로 진행합니다!

## Step 1: Google Cloud Console 접속
👉 https://console.cloud.google.com

## Step 2: 프로젝트 생성 (또는 기존 프로젝트 사용)

1. 상단 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭 (이미 있다면 선택)
3. 프로젝트 이름: `record-ocr` (아무거나 가능)
4. "만들기" 클릭

## Step 3: Vision API 활성화 ⭐️

1. 왼쪽 메뉴에서 **"API 및 서비스"** → **"라이브러리"** 클릭
2. 검색창에 **"Cloud Vision API"** 입력
3. **Cloud Vision API** 클릭
4. **"사용"** 버튼 클릭 (파란색 버튼)
5. 활성화 완료 메시지 확인

## Step 4: 서비스 계정 키 생성 🔑

1. **"API 및 서비스"** → **"사용자 인증 정보"** 클릭
2. **"+ 사용자 인증 정보 만들기"** → **"서비스 계정"** 클릭
3. 입력 사항:
   - 서비스 계정 이름: `record-ocr-service`
   - 서비스 계정 ID: (자동 생성됨)
   - 설명: `Re:cord OCR 서비스`
4. **"만들고 계속"** 클릭
5. 역할 선택:
   - **"기본"** → **"소유자"** 선택
   - 또는 **"Cloud Vision"** → **"Cloud Vision API 사용자"** 선택
6. **"계속"** → **"완료"** 클릭

## Step 5: JSON 키 다운로드 📥

1. 생성된 서비스 계정 이름 클릭
2. 상단 탭에서 **"키"** 클릭
3. **"키 추가"** → **"새 키 만들기"** 클릭
4. **"JSON"** 선택 (기본값)
5. **"만들기"** 클릭
6. **JSON 파일이 자동 다운로드됩니다!** (Downloads 폴더 확인)

## Step 6: 환경 변수 설정 🔧

### 방법 1: 자동 설정 (추천)

다운로드한 JSON 파일 경로를 확인하고:

```bash
cd /Users/seoyeongbin/record
node scripts/setup-google-vision.js
```

파일 경로 입력 예시: `/Users/seoyeongbin/Downloads/record-ocr-xxxxx.json`

### 방법 2: 수동 설정

1. JSON 파일을 프로젝트 폴더로 복사:
```bash
cp ~/Downloads/record-ocr-*.json /Users/seoyeongbin/record/google-vision-key.json
```

2. `.env` 파일에 추가:
```bash
echo 'GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json' >> /Users/seoyeongbin/record/.env
```

## Step 7: 테스트 🧪

```bash
cd /Users/seoyeongbin/record
npm run dev
```

브라우저에서 접속:
http://localhost:3001/dashboard/ocr-test

## ✅ 체크리스트

- [ ] Google Cloud Console 로그인
- [ ] 프로젝트 생성/선택
- [ ] Vision API 활성화
- [ ] 서비스 계정 생성
- [ ] JSON 키 다운로드
- [ ] 환경 변수 설정
- [ ] 테스트 성공

## 🚨 자주 발생하는 문제

### "API가 활성화되지 않음" 오류
→ Step 3에서 Vision API "사용" 버튼을 클릭했는지 확인

### "권한 부족" 오류
→ 서비스 계정 역할이 "소유자" 또는 "Cloud Vision API 사용자"인지 확인

### "파일을 찾을 수 없음" 오류
→ JSON 파일 경로가 정확한지 확인

## 💡 팁

- 무료 크레딧 $300로 약 20만 건 OCR 가능
- 월 1,000건까지 무료
- 프로젝트 ID는 자동 생성됨 (변경 가능)

---

**도움이 필요하시면 언제든 물어보세요!**