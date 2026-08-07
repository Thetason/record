# Re:cord (recordyours.com)

리뷰를 한 링크로 모아 상담 전에 보내는 신뢰 포트폴리오 SaaS.

**이 프로젝트는 obiwan/vocal_trainer와 완전히 별개다.** record 작업은 반드시 이 디렉토리에서 세션을 연다. 다른 프로젝트의 코드·메모리·설정과 섞지 않는다.

## 먼저 읽기

- `START_HERE.md` — 문서 지도와 최신 상태 (여기부터)
- `AUTO_IMPORT_STRATEGY_2026-07-03.md` — 리뷰 가져오기의 법률·기술 확정 (서버 크롤링 금지 판례 포함)
- `VIABILITY_VERDICT_2026-07-03.md` — 사업 판정과 30일 플랜

## 핵심 명령

```bash
npm run dev          # 개발 서버 (dev SQLite)
npm run verify       # lint + build + typecheck + OCR 픽스처
npx vercel --prod --yes   # 프로덕션 배포 (GitHub 연동 아님 — 로컬에서 직접)
sh scripts/prod-run.sh [--confirm] <script.ts>   # 프로덕션 DB 유지보수
```

## 불변 규칙

- 서버가 네이버 등 플랫폼에 접근하는 크롤링/자동수집 금지 (수량 무관 — AUTO_IMPORT_STRATEGY 판례 근거). 리뷰 취득 주체는 항상 로그인한 유저 본인.
- `.env*`, 프로덕션 덤프(`tmp-*.json`), 쿠키 파일 커밋 금지.
- ANTHROPIC_API_KEY는 Vercel Production에 Sensitive로만 존재 (로컬 pull 불가) — AI 기능 검증은 라이브 E2E로.
- 배포와 커밋은 별개다: 배포 후 반드시 커밋·푸시로 동기화.
