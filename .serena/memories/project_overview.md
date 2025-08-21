# Re:cord - 리뷰 포트폴리오 플랫폼 프로젝트 개요

## 프로젝트 목적
- 여러 플랫폼에 흩어진 리뷰를 한 곳에 모아 관리하는 통합 플랫폼
- 리뷰 포트폴리오를 통한 비즈니스 성장 지원
- OCR을 활용한 리뷰 스크린샷 자동 텍스트 추출

## 기술 스택
- **Frontend**: Next.js 15.4, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (개발), PostgreSQL/Supabase (프로덕션)
- **Authentication**: NextAuth.js
- **OCR**: Google Cloud Vision API, Tesseract.js
- **File Processing**: xlsx (Excel), csv-parse (CSV)
- **Deployment**: Vercel

## 프로젝트 구조
```
/app - Next.js App Router 기반 페이지
/components - 재사용 가능한 UI 컴포넌트
/lib - 유틸리티 함수 및 설정
/prisma - 데이터베이스 스키마 및 마이그레이션
/public - 정적 자산
/scripts - 도구 스크립트
/types - TypeScript 타입 정의
```

## 주요 기능
1. **멀티 플랫폼 리뷰 통합** (네이버, 카카오, 인스타그램 등)
2. **OCR 자동 인식** (Google Vision API)
3. **CSV/Excel 대량 업로드**
4. **통계 대시보드**
5. **공개 프로필 페이지**
6. **사용자 인증 시스템**