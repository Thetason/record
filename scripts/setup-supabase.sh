#!/bin/bash

# Supabase 설정 자동화 스크립트
# 사용법: ./scripts/setup-supabase.sh <DATABASE_URL>

set -e

DATABASE_URL=$1

if [ -z "$DATABASE_URL" ]; then
  echo "❌ 사용법: ./scripts/setup-supabase.sh <DATABASE_URL>"
  echo "예: ./scripts/setup-supabase.sh 'postgresql://postgres:password@db.xxx.supabase.co:5432/postgres'"
  exit 1
fi

echo "🚀 Supabase 마이그레이션 시작..."
echo ""

# 1. .env.local 백업
if [ -f .env.local ]; then
  cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
  echo "✅ 기존 .env.local 백업 완료"
fi

# 2. .env.local 업데이트
echo "DATABASE_URL=\"${DATABASE_URL}\"" > .env.local.new
grep -v "^DATABASE_URL=" .env.local >> .env.local.new 2>/dev/null || true
mv .env.local.new .env.local
echo "✅ .env.local 업데이트 완료"

# 3. Prisma 클라이언트 재생성
echo ""
echo "📦 Prisma 클라이언트 재생성 중..."
npx prisma generate
echo "✅ Prisma 클라이언트 생성 완료"

# 4. 데이터베이스 스키마 푸시
echo ""
echo "🗄️ 데이터베이스 스키마 마이그레이션 중..."
DATABASE_URL="${DATABASE_URL}" npx prisma db push --accept-data-loss
echo "✅ 스키마 마이그레이션 완료"

# 5. syb2020 계정 및 데모 데이터 생성
echo ""
echo "👤 syb2020 계정 및 데모 데이터 생성 중..."
DATABASE_URL="${DATABASE_URL}" npx tsx scripts/setup-demo-data.ts
echo "✅ 데모 데이터 생성 완료"

echo ""
echo "🎉 Supabase 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. 로컬 개발 서버 실행:"
echo "   npm run dev"
echo ""
echo "2. 로그인 테스트:"
echo "   아이디: syb2020"
echo "   비밀번호: Syb2020!"
echo ""
echo "3. Vercel 환경 변수 업데이트:"
echo "   - Vercel 대시보드 접속"
echo "   - Settings → Environment Variables"
echo "   - DATABASE_URL 업데이트"
echo ""
echo "4. Vercel 재배포:"
echo "   - git push 또는 수동 재배포"
echo ""
