# 로그인 문제 해결 기록

## 문제 원인
1. NEXTAUTH_URL이 잘못된 포트(3002)로 설정되어 있었음
2. 실제 개발 서버는 3001에서 실행 중

## 해결 방법
1. `.env.local`의 NEXTAUTH_URL을 http://localhost:3001로 수정
2. 기존 사용자들의 비밀번호 재설정 (fix-passwords.js 스크립트 사용)

## 테스트 완료된 계정
- admin / Admin1234!
- syb2020 / Syb20201234!
- grammy2020 / Grammy20201234!
- testuser / Testuser1234!

## 주의사항
- 개발 환경: localhost:3001
- 프로덕션: Vercel URL 사용
- .env.local은 git에 커밋하지 않음 (보안)