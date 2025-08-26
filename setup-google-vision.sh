#!/bin/bash

echo "🔧 Google Vision API 설정 스크립트"
echo "=================================="

# 1. 테스트용 API 키 생성 (데모용)
cat > google-vision-key.json << 'EOF'
{
  "type": "service_account",
  "project_id": "record-demo-2025",
  "private_key_id": "demo-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF\n-----END PRIVATE KEY-----",
  "client_email": "record-ocr@record-demo-2025.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
EOF

# 2. Base64 인코딩
GOOGLE_VISION_KEY=$(base64 -i google-vision-key.json)

# 3. .env.local에 추가
echo "" >> .env.local
echo "# Google Vision API (자동 생성됨)" >> .env.local
echo "GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json" >> .env.local
echo "GOOGLE_CLOUD_PROJECT_ID=record-demo-2025" >> .env.local

echo "✅ Google Vision 설정 완료 (Mock 모드)"
echo ""
echo "실제 사용을 위해서는:"
echo "1. https://console.cloud.google.com 에서 프로젝트 생성"
echo "2. Vision API 활성화"
echo "3. 서비스 계정 키 생성"
echo "4. 위 파일을 실제 키로 교체"

rm google-vision-key.json