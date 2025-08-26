#!/bin/bash

echo "📧 이메일 설정 가이드"
echo "===================="
echo ""
echo "Gmail 앱 비밀번호 설정 방법:"
echo ""
echo "1. Google 계정 설정으로 이동:"
echo "   https://myaccount.google.com/security"
echo ""
echo "2. 2단계 인증 활성화 (필수)"
echo ""
echo "3. 앱 비밀번호 생성:"
echo "   - '2단계 인증' 섹션에서 '앱 비밀번호' 클릭"
echo "   - 앱 선택: '메일'"
echo "   - 기기 선택: '기타(맞춤 이름)' → 'Re:cord'"
echo "   - 생성된 16자리 비밀번호 복사"
echo ""
echo "4. .env.local 파일 수정:"
echo "   SMTP_USER=your-email@gmail.com"
echo "   SMTP_PASS=생성된16자리비밀번호(공백없이)"
echo ""
echo "예시:"
echo "   SMTP_USER=record.service@gmail.com"
echo "   SMTP_PASS=abcd efgh ijkl mnop (공백 제거)"
echo ""
echo "테스트용 Ethereal Email 설정 (임시):"

# Ethereal 테스트 계정 생성
node -e "
const nodemailer = require('nodemailer');
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('❌ 테스트 계정 생성 실패:', err.message);
  } else {
    console.log('');
    console.log('✅ 테스트 이메일 계정 생성됨:');
    console.log('SMTP_HOST=' + account.smtp.host);
    console.log('SMTP_PORT=' + account.smtp.port);
    console.log('SMTP_USER=' + account.user);
    console.log('SMTP_PASS=' + account.pass);
    console.log('');
    console.log('웹메일 확인: https://ethereal.email');
    console.log('계정:', account.user);
    console.log('비밀번호:', account.pass);
  }
});
"