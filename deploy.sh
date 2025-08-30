#!/bin/bash

# Re:cord 자동 배포 스크립트
# 한 번에 모든 배포 작업 실행

echo "🚀 Re:cord 자동 배포 시작"
echo "======================="
echo ""

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Git 상태 확인
echo -e "${YELLOW}1. Git 상태 확인${NC}"
git status --short

# 2. 빌드 테스트
echo ""
echo -e "${YELLOW}2. 로컬 빌드 테스트${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패! 오류를 수정하고 다시 시도하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 빌드 성공${NC}"

# 3. Git 커밋 & 푸시
echo ""
echo -e "${YELLOW}3. GitHub 푸시${NC}"
git add -A
git commit -m "Production deployment - $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo -e "${GREEN}✅ GitHub 푸시 완료${NC}"

# 4. Vercel 배포
echo ""
echo -e "${YELLOW}4. Vercel 프로덕션 배포${NC}"
vercel --prod --yes
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Vercel 배포 실패!${NC}"
    exit 1
fi

# 5. 배포 확인
echo ""
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo -e "${BLUE}확인할 사항:${NC}"
echo "1. 프로덕션 사이트: https://record-rho.vercel.app"
echo "2. Vercel 대시보드: https://vercel.com/thetasons-projects/record"
echo "3. 실시간 로그: vercel logs --follow"
echo ""
echo -e "${GREEN}✨ 모든 배포 과정이 완료되었습니다!${NC}"