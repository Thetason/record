#!/bin/bash

# AWS RDS 설정 자동화 스크립트
# 사용법: ./scripts/setup-aws-rds.sh <ENDPOINT> <PASSWORD>

set -e

ENDPOINT=$1
PASSWORD=$2

if [ -z "$ENDPOINT" ] || [ -z "$PASSWORD" ]; then
  echo "❌ 사용법: ./scripts/setup-aws-rds.sh <ENDPOINT> <PASSWORD>"
  echo "예: ./scripts/setup-aws-rds.sh record-db.xxx.rds.amazonaws.com MyPassword123!"
  exit 1
fi

echo "🚀 AWS RDS 마이그레이션 시작..."
echo ""

# 1. DATABASE_URL 생성
DATABASE_URL="postgresql://postgres:${PASSWORD}@${ENDPOINT}:5432/record?schema=public"
echo "✅ DATABASE_URL 생성 완료"

# 2. .env.local 백업
if [ -f .env.local ]; then
  cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
  echo "✅ 기존 .env.local 백업 완료"
fi

# 3. .env.local 업데이트
echo "DATABASE_URL=\"${DATABASE_URL}\"" > .env.local.new
grep -v "^DATABASE_URL=" .env.local >> .env.local.new 2>/dev/null || true
mv .env.local.new .env.local
echo "✅ .env.local 업데이트 완료"

# 4. Prisma 클라이언트 재생성
echo ""
echo "📦 Prisma 클라이언트 재생성 중..."
npx prisma generate
echo "✅ Prisma 클라이언트 생성 완료"

# 5. 데이터베이스 스키마 푸시
echo ""
echo "🗄️ 데이터베이스 스키마 마이그레이션 중..."
DATABASE_URL="${DATABASE_URL}" npx prisma db push --accept-data-loss
echo "✅ 스키마 마이그레이션 완료"

# 6. syb2020 계정 생성
echo ""
echo "👤 syb2020 계정 생성 중..."
DATABASE_URL="${DATABASE_URL}" npx tsx scripts/setup-demo-data.ts
echo "✅ 데모 데이터 생성 완료"

echo ""
echo "🎉 AWS RDS 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. Vercel 대시보드에서 환경 변수 업데이트"
echo "2. DATABASE_URL을 다음으로 설정:"
echo "   ${DATABASE_URL}"
echo ""
echo "3. Vercel 재배포 트리거"
echo ""
