#!/bin/bash

echo "========================================="
echo "Google Vision API 설정 가이드"
echo "========================================="
echo ""
echo "1. Google Cloud Console 접속"
echo "   https://console.cloud.google.com"
echo ""
echo "2. 프로젝트 생성 또는 선택"
echo ""
echo "3. Vision API 활성화"
echo "   - APIs & Services > Library 메뉴"
echo "   - 'Cloud Vision API' 검색"
echo "   - Enable 클릭"
echo ""
echo "4. 서비스 계정 키 생성"
echo "   - APIs & Services > Credentials"
echo "   - Create Credentials > Service Account"
echo "   - 서비스 계정 생성 후 Keys 탭에서 JSON 키 다운로드"
echo ""
echo "5. 환경 변수 설정"
echo "   - 다운로드한 JSON 파일을 프로젝트 루트에 'google-vision-key.json'으로 저장"
echo "   - .env 파일에 추가:"
echo ""
echo "# Google Vision API"
echo "GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json"
echo "GOOGLE_CLOUD_PROJECT_ID=your-project-id"
echo ""
echo "또는 Vercel 환경변수에 Base64로 인코딩하여 저장:"
echo ""
echo "# JSON 파일을 Base64로 인코딩"
echo "base64 -i google-vision-key.json -o encoded-key.txt"
echo ""
echo "# Vercel 환경변수에 설정"
echo "GOOGLE_VISION_API_KEY=(encoded-key.txt 내용)"
echo ""
echo "========================================="
echo ""

# .env.example 파일에 추가
cat >> .env.example << 'EOF'

# Google Vision API (OCR 기능)
GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
# 또는 Base64 인코딩된 서비스 계정 키 (프로덕션용)
# GOOGLE_VISION_API_KEY=base64_encoded_service_account_key
EOF

echo "✅ .env.example 파일이 업데이트되었습니다."
echo ""
echo "⚠️  주의사항:"
echo "- google-vision-key.json 파일은 절대 Git에 커밋하지 마세요"
echo "- .gitignore에 추가되어 있는지 확인하세요"
echo ""