#!/bin/bash

# Re:cord 전체 기능 테스트 스크립트

echo "🧪 Re:cord 전체 기능 테스트"
echo "=========================="
echo ""

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 테스트 URL 설정
if [ "$1" == "prod" ]; then
    BASE_URL="https://record-rho.vercel.app"
    echo -e "${YELLOW}프로덕션 환경 테스트${NC}"
else
    BASE_URL="http://localhost:3000"
    echo -e "${YELLOW}로컬 환경 테스트${NC}"
fi

echo "테스트 URL: $BASE_URL"
echo ""

# 테스트 결과 저장
PASSED=0
FAILED=0

# 테스트 함수
test_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $description (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $description (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

# 1. 페이지 접근 테스트
echo -e "${BLUE}[페이지 접근 테스트]${NC}"
test_endpoint "/" "200" "홈페이지"
test_endpoint "/login" "200" "로그인 페이지"
test_endpoint "/signup" "200" "회원가입 페이지"
test_endpoint "/pricing" "200" "가격 페이지"
test_endpoint "/about" "200" "소개 페이지"
echo ""

# 2. API 엔드포인트 테스트
echo -e "${BLUE}[API 엔드포인트 테스트]${NC}"
test_endpoint "/api/auth/providers" "200" "Auth Providers"
test_endpoint "/api/health" "200" "Health Check"
echo ""

# 3. 정적 자원 테스트
echo -e "${BLUE}[정적 자원 테스트]${NC}"
test_endpoint "/favicon.ico" "200" "Favicon"
test_endpoint "/robots.txt" "200" "Robots.txt"
echo ""

# 4. 보안 헤더 테스트
echo -e "${BLUE}[보안 헤더 테스트]${NC}"
headers=$(curl -s -I "$BASE_URL")
if echo "$headers" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ PASS${NC} - X-Frame-Options 헤더"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - X-Frame-Options 헤더 없음"
    ((FAILED++))
fi

if echo "$headers" | grep -q "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ PASS${NC} - X-Content-Type-Options 헤더"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - X-Content-Type-Options 헤더 없음"
    ((FAILED++))
fi
echo ""

# 5. 성능 테스트
echo -e "${BLUE}[성능 테스트]${NC}"
start_time=$(date +%s%N)
curl -s -o /dev/null "$BASE_URL"
end_time=$(date +%s%N)
elapsed_time=$(( ($end_time - $start_time) / 1000000 ))

if [ $elapsed_time -lt 3000 ]; then
    echo -e "${GREEN}✅ PASS${NC} - 홈페이지 로딩 시간 (${elapsed_time}ms)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - 홈페이지 로딩 시간 초과 (${elapsed_time}ms > 3000ms)"
    ((FAILED++))
fi
echo ""

# 6. 모바일 반응형 테스트
echo -e "${BLUE}[모바일 반응형 테스트]${NC}"
mobile_response=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" "$BASE_URL")
if echo "$mobile_response" | grep -q "viewport"; then
    echo -e "${GREEN}✅ PASS${NC} - Viewport 메타 태그 존재"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Viewport 메타 태그 없음"
    ((FAILED++))
fi
echo ""

# 테스트 결과 요약
echo "=============================="
echo -e "${YELLOW}테스트 결과 요약${NC}"
echo "=============================="
echo -e "${GREEN}통과: $PASSED${NC}"
echo -e "${RED}실패: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo -e "성공률: ${SUCCESS_RATE}%"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트 통과! 배포 준비 완료${NC}"
    exit 0
else
    echo -e "${RED}⚠️  일부 테스트 실패. 확인이 필요합니다.${NC}"
    exit 1
fi