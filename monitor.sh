#!/bin/bash

# Re:cord 실시간 모니터링 스크립트

echo "📊 Re:cord 실시간 모니터링"
echo "========================="
echo ""

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 모니터링 옵션 선택
echo -e "${YELLOW}모니터링 옵션을 선택하세요:${NC}"
echo "1) Vercel 실시간 로그"
echo "2) Vercel 함수 로그"
echo "3) 빌드 로그"
echo "4) 배포 상태 확인"
echo "5) 사이트 헬스 체크 (5초마다)"
echo "6) 종합 대시보드"
echo ""
read -p "선택 (1-6): " choice

case $choice in
    1)
        echo -e "${BLUE}Vercel 실시간 로그 시작...${NC}"
        vercel logs --follow
        ;;
    2)
        echo -e "${BLUE}Vercel 함수 로그 시작...${NC}"
        vercel logs --type=functions --follow
        ;;
    3)
        echo -e "${BLUE}빌드 로그 확인...${NC}"
        vercel logs --type=build
        ;;
    4)
        echo -e "${BLUE}배포 상태 확인...${NC}"
        vercel list
        ;;
    5)
        echo -e "${BLUE}사이트 헬스 체크 시작 (Ctrl+C로 중지)${NC}"
        while true; do
            clear
            echo "📊 Re:cord 헬스 체크 - $(date '+%Y-%m-%d %H:%M:%S')"
            echo "=================================="
            
            # 프로덕션 사이트 체크
            prod_status=$(curl -s -o /dev/null -w "%{http_code}" "https://record-rho.vercel.app")
            if [ "$prod_status" == "200" ]; then
                echo -e "${GREEN}✅ 프로덕션 사이트: 정상 ($prod_status)${NC}"
            else
                echo -e "${RED}❌ 프로덕션 사이트: 오류 ($prod_status)${NC}"
            fi
            
            # API 헬스 체크
            api_status=$(curl -s -o /dev/null -w "%{http_code}" "https://record-rho.vercel.app/api/health")
            if [ "$api_status" == "200" ]; then
                echo -e "${GREEN}✅ API 서버: 정상 ($api_status)${NC}"
            else
                echo -e "${RED}❌ API 서버: 오류 ($api_status)${NC}"
            fi
            
            # 응답 시간 측정
            response_time=$(curl -s -o /dev/null -w "%{time_total}" "https://record-rho.vercel.app")
            echo -e "${BLUE}⏱️  응답 시간: ${response_time}초${NC}"
            
            echo ""
            echo "5초 후 재확인... (Ctrl+C로 중지)"
            sleep 5
        done
        ;;
    6)
        echo -e "${BLUE}종합 대시보드 시작...${NC}"
        echo ""
        
        # 터미널 분할 (tmux 사용)
        if command -v tmux &> /dev/null; then
            tmux new-session -d -s record-monitor
            tmux split-window -h
            tmux split-window -v
            tmux select-pane -t 0
            tmux split-window -v
            
            tmux send-keys -t 0 "vercel logs --follow" C-m
            tmux send-keys -t 1 "vercel logs --type=functions --follow" C-m
            tmux send-keys -t 2 "watch -n 5 'curl -s -o /dev/null -w \"Status: %{http_code} | Time: %{time_total}s\" https://record-rho.vercel.app'" C-m
            tmux send-keys -t 3 "htop" C-m
            
            tmux attach-session -t record-monitor
        else
            echo -e "${YELLOW}tmux가 설치되지 않았습니다. 설치 후 다시 시도하세요.${NC}"
            echo "설치: brew install tmux"
        fi
        ;;
    *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac