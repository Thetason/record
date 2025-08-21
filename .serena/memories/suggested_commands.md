# 개발용 추천 명령어

## 기본 개발 명령어
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 개발 서버 + 브라우저 자동 오픈
npm run preview

# 모든 주요 페이지 자동 오픈
npm run preview-all

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린팅
npm run lint
```

## 데이터베이스 관련
```bash
# Prisma 스키마 생성/업데이트
npx prisma db push

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 시드
npx prisma db seed

# Prisma Studio 실행 (DB GUI)
npx prisma studio
```

## 관리자 계정 생성
```bash
# 관리자 계정 생성 스크립트
npm run create-admin
```

## 기타 유용한 명령어
```bash
# 의존성 사후 설치 (자동으로 prisma generate 실행)
npm run postinstall

# 테스트 사용자 생성
node create-test-user.js

# OCR 테스트
node test-ocr.js

# API 테스트
node test-api.js
```

## macOS/Darwin 특정 명령어
```bash
# 파일 찾기
find . -name "*.tsx" -type f

# 폴더 크기 확인
du -sh *

# 프로세스 확인
ps aux | grep node

# 포트 사용 확인
lsof -i :3000
```