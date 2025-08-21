# 작업 완료 시 체크리스트

## 코드 품질 확인
1. **TypeScript 컴파일 확인**
   ```bash
   npx tsc --noEmit
   ```

2. **ESLint 검사**
   ```bash
   npm run lint
   ```

3. **빌드 테스트**
   ```bash
   npm run build
   ```

## 기능 테스트
1. **개발 서버 실행 및 기능 확인**
   ```bash
   npm run dev
   ```

2. **주요 페이지 접근 테스트**
   - 로그인/회원가입
   - 대시보드
   - 리뷰 업로드
   - 공개 프로필

3. **API 엔드포인트 테스트**
   ```bash
   node test-api.js
   ```

## 데이터베이스 확인
1. **Prisma 스키마 동기화**
   ```bash
   npx prisma db push
   ```

2. **데이터베이스 연결 확인**
   ```bash
   npx prisma studio
   ```

## 보안 검사
1. **환경 변수 확인**
   - `.env` 파일 민감 정보 누락 확인
   - API 키 및 시크릿 보안

2. **인증 및 권한 확인**
   - 로그인 필요 페이지 보호
   - API 엔드포인트 권한 검증

## 성능 확인
1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - Sharp 이미지 처리 확인

2. **번들 크기 확인**
   ```bash
   npm run build
   ```

## 배포 준비
1. **환경 변수 설정**
   - Vercel 환경 변수 확인
   - 프로덕션 데이터베이스 연결

2. **빌드 및 배포 테스트**
   - Vercel 자동 배포 확인
   - 프로덕션 환경 동작 검증