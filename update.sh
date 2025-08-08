#!/bin/bash

# 리코드 업데이트 스크립트
# 사용법: ./update.sh "커밋 메시지"

echo "🚀 리코드 업데이트 시작..."

# Git 추가
git add .

# 커밋 메시지 설정
if [ -z "$1" ]; then
    COMMIT_MSG="업데이트: $(date '+%Y-%m-%d %H:%M')"
else
    COMMIT_MSG="$1"
fi

# 커밋
git commit -m "$COMMIT_MSG"

# 푸시
git push

echo "✅ GitHub 업로드 완료!"
echo "⏳ Vercel 자동 배포 중... (2-3분 소요)"
echo "🔗 확인: https://record.vercel.app"
echo ""
echo "📊 배포 상태 보기:"
echo "   https://vercel.com/dashboard"