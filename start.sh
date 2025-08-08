#!/bin/bash

# 리코드 프로젝트 자동 시작 스크립트

echo "🚀 리코드 프로젝트 시작중..."

# 기존 서버 종료
pkill -f "next dev" 2>/dev/null

# 포트 찾기 (3000부터 시작)
PORT=3000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    echo "포트 $PORT 사용중, 다른 포트 시도..."
    PORT=$((PORT + 1))
done

echo "✅ 사용 가능한 포트: $PORT"

# .env.local 업데이트
sed -i '' "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:$PORT|" .env.local 2>/dev/null

# 서버 시작
echo "📦 서버 시작중..."
npm run dev -- --port $PORT &

# 5초 대기
sleep 5

# 브라우저 열기
echo "🌐 브라우저 열기: http://localhost:$PORT"
open "http://localhost:$PORT"

echo "
========================================
✨ 리코드 프로젝트가 실행중입니다!

주소: http://localhost:$PORT
대시보드: http://localhost:$PORT/dashboard
대량 업로드: http://localhost:$PORT/dashboard/bulk-upload

종료하려면 Ctrl+C를 누르세요.
========================================
"

# 서버 프로세스 대기
wait