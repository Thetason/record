#!/bin/bash

# 리코드 프로젝트 실행 스크립트

echo "🚀 리코드 프로젝트 시작..."

# 서버 시작 (백그라운드)
npm run dev &

# 서버가 준비될 때까지 대기
echo "⏳ 서버 준비 중..."
sleep 8

# 브라우저 열기
echo "🌐 브라우저 열기..."
open http://localhost:3000

echo "
========================================
✨ 리코드가 실행 중입니다!

메인: http://localhost:3000
대시보드: http://localhost:3000/dashboard
대량 업로드: http://localhost:3000/dashboard/bulk-upload

종료: Ctrl+C
========================================
"

# 프로세스 유지
tail -f /dev/null