#!/bin/bash

echo "📧 Gmail SMTP 설정 가이드"
echo "========================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Gmail 앱 비밀번호 생성 방법:${NC}"
echo "-----------------------------"
echo ""
echo "1. Google 계정 보안 설정 접속:"
echo -e "${BLUE}   https://myaccount.google.com/security${NC}"
echo ""
echo "2. 2단계 인증 활성화 (필수)"
echo ""
echo "3. 앱 비밀번호 생성:"
echo -e "${BLUE}   https://myaccount.google.com/apppasswords${NC}"
echo ""
echo "4. 앱 선택: 메일"
echo "5. 기기 선택: 기타 (Re:cord)"
echo "6. 생성된 16자리 비밀번호 복사"
echo ""
echo "-----------------------------"
echo ""

echo -e "${YELLOW}Vercel 환경변수 설정:${NC}"
echo "--------------------"
echo ""
echo -e "${GREEN}# 이메일 설정 (Gmail)${NC}"
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_PORT=587"
echo "SMTP_SECURE=false"
echo "SMTP_USER=your-email@gmail.com"
echo "SMTP_PASS=생성한_16자리_앱비밀번호"
echo "SMTP_FROM=Re:cord <noreply@re-cord.kr>"
echo ""

echo -e "${YELLOW}또는 네이버 메일 사용:${NC}"
echo "--------------------"
echo ""
echo -e "${GREEN}# 이메일 설정 (Naver)${NC}"
echo "SMTP_HOST=smtp.naver.com"
echo "SMTP_PORT=587"
echo "SMTP_SECURE=false"
echo "SMTP_USER=your-id@naver.com"
echo "SMTP_PASS=네이버_비밀번호"
echo "SMTP_FROM=Re:cord <your-id@naver.com>"
echo ""

echo -e "${YELLOW}테스트 이메일 발송:${NC}"
echo "-------------------"

# 테스트 이메일 스크립트 생성
cat << 'EOF' > test-email.js
// test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ 이메일 서버 연결 성공!');
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Re:cord <noreply@re-cord.kr>',
      to: process.env.SMTP_USER, // 자기 자신에게 테스트
      subject: 'Re:cord 이메일 테스트',
      text: '이메일 설정이 정상적으로 완료되었습니다!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Re:cord</h1>
          <p>이메일 설정이 정상적으로 완료되었습니다!</p>
          <p style="color: #6B7280;">이 메시지를 받으셨다면 이메일 설정이 올바르게 구성된 것입니다.</p>
        </div>
      `,
    });
    
    console.log('✅ 테스트 이메일 발송 완료!');
    console.log('   Message ID:', info.messageId);
    console.log('   받는 사람:', process.env.SMTP_USER);
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error.message);
    console.log('');
    console.log('확인사항:');
    console.log('1. 2단계 인증이 활성화되어 있나요?');
    console.log('2. 앱 비밀번호를 정확히 입력했나요? (공백 제거)');
    console.log('3. .env.local 파일에 설정이 저장되어 있나요?');
  }
}

testEmail();
EOF

echo -e "${GREEN}✓ test-email.js 파일이 생성되었습니다.${NC}"
echo ""
echo "테스트 방법:"
echo "1. .env.local 파일에 이메일 설정 추가"
echo "2. node test-email.js 실행"
echo ""
echo -e "${GREEN}✨ 이메일 설정 가이드 완료!${NC}"