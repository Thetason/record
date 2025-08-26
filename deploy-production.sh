#!/bin/bash

# Re:cord 프로덕션 배포 스크립트
# 2025-08-26 보안 강화 버전

set -e

echo "🚀 Re:cord 프로덕션 배포 시작..."

# 1. 환경 검증
echo "📋 환경 검증 중..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 환경변수가 설정되지 않았습니다"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET 환경변수가 설정되지 않았습니다"
    exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
    echo "❌ NEXTAUTH_URL 환경변수가 설정되지 않았습니다"
    exit 1
fi

# 2. 보안 체크
echo "🔒 보안 설정 검증 중..."

# 환경변수 길이 검증
if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
    echo "❌ NEXTAUTH_SECRET은 최소 32자 이상이어야 합니다"
    exit 1
fi

# HTTPS URL 검증
if [[ "$NEXTAUTH_URL" != https://* ]]; then
    echo "❌ NEXTAUTH_URL은 HTTPS를 사용해야 합니다"
    exit 1
fi

# 3. 의존성 설치 및 빌드
echo "📦 의존성 설치 중..."
npm ci --production

echo "🔨 프로덕션 빌드 중..."
npm run build

# 4. 데이터베이스 마이그레이션
echo "🗄️  데이터베이스 마이그레이션 실행 중..."
npx prisma generate
npx prisma db push

# 5. 빌드 결과 검증
if [ ! -d ".next" ]; then
    echo "❌ 빌드 실패: .next 디렉토리가 생성되지 않았습니다"
    exit 1
fi

echo "✅ 빌드 성공"

# 6. 보안 헤더 검증 (프로덕션에서)
if [ "$NODE_ENV" = "production" ]; then
    echo "🛡️  보안 설정 최종 검증..."
    
    # CSP 헤더 확인
    if ! grep -q "Content-Security-Policy" lib/security.ts; then
        echo "⚠️  CSP 헤더가 설정되지 않았습니다"
    fi
    
    # CORS 설정 확인
    if ! grep -q "Access-Control-Allow-Origin" lib/security.ts; then
        echo "⚠️  CORS 설정이 누락될 수 있습니다"
    fi
fi

# 7. 최종 체크리스트
echo "📋 최종 배포 체크리스트:"
echo "✅ 환경변수 설정 완료"
echo "✅ 보안 설정 검증 완료" 
echo "✅ 빌드 성공"
echo "✅ 데이터베이스 마이그레이션 완료"

echo ""
echo "🎉 배포 준비 완료!"
echo "📍 배포 URL: $NEXTAUTH_URL"
echo ""
echo "⚠️  배포 후 필수 확인사항:"
echo "1. 로그인/회원가입 기능 테스트"
echo "2. 관리자 패널 접근 확인"
echo "3. 결제 시스템 테스트"
echo "4. SSL 인증서 확인"
echo "5. 성능 모니터링 확인"

echo ""
echo "🚨 보안 알림:"
echo "- 모든 환경변수가 Vercel 대시보드에 안전하게 설정되어 있는지 확인하세요"
echo "- 정기적으로 보안 업데이트를 적용하세요"
echo "- 로그 모니터링을 활성화하세요"