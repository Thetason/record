# 코드 스타일 및 컨벤션

## TypeScript 설정
- 엄격한 타입 검사 활성화
- ESLint와 Next.js 권장 설정 사용
- React 19와 Next.js 15.4 최신 기능 활용

## 컴포넌트 스타일
- **"use client"** 지시문을 클라이언트 컴포넌트에 명시
- 함수형 컴포넌트와 React Hooks 사용
- default export 사용

## 디자인 시스템
- **Tailwind CSS** 유틸리티 클래스 사용
- **Radix UI** 접근성 고려한 기본 컴포넌트
- **Framer Motion** 애니메이션
- 브랜드 컬러: `#FF6B35` (주황색)

## 파일 명명 규칙
- 컴포넌트: PascalCase (예: `BulkUploadPage.tsx`)
- API 라우트: `route.ts`
- 페이지: `page.tsx`
- 유틸리티: camelCase

## 폴더 구조
- `/app` - App Router 기반 라우팅
- `/components/ui` - 재사용 가능한 UI 컴포넌트
- `/lib` - 유틸리티 함수, 설정
- `/types` - TypeScript 타입 정의

## 상태 관리
- React useState, useEffect 등 기본 훅 사용
- 서버 상태: Next.js API Routes
- 클라이언트 상태: React 상태

## 에러 처리
- try-catch 블록으로 에러 포착
- 사용자 친화적 에러 메시지
- 콘솔 로깅으로 디버깅 정보 제공

## 접근성
- semantic HTML 사용
- ARIA 속성 적절히 활용
- Radix UI의 접근성 기능 활용