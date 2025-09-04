#!/usr/bin/env node

/**
 * Google Vision API 설정 스크립트
 * 
 * 사용법: node scripts/setup-google-vision.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('');
  console.log('🔍 Google Vision API 설정 도우미');
  console.log('='.repeat(50));
  console.log('');
  
  console.log('📋 준비 사항:');
  console.log('1. Google Cloud Console 계정');
  console.log('2. 결제 수단 등록 (무료 크레딧 $300 제공)');
  console.log('');
  
  const hasAccount = await question('Google Cloud 계정이 있으신가요? (y/n): ');
  
  if (hasAccount.toLowerCase() !== 'y') {
    console.log('');
    console.log('📌 Google Cloud 계정 생성하기:');
    console.log('1. https://console.cloud.google.com 접속');
    console.log('2. Google 계정으로 로그인');
    console.log('3. 결제 정보 입력 (무료 크레딧 사용 가능)');
    console.log('');
    console.log('계정을 생성한 후 다시 이 스크립트를 실행해주세요.');
    rl.close();
    return;
  }
  
  console.log('');
  console.log('🚀 Google Vision API 설정 단계:');
  console.log('');
  
  console.log('Step 1: 프로젝트 생성');
  console.log('---------------------------------------');
  console.log('1. https://console.cloud.google.com 접속');
  console.log('2. 상단 프로젝트 선택 드롭다운 클릭');
  console.log('3. "새 프로젝트" 클릭');
  console.log('4. 프로젝트 이름: "record-ocr" 입력');
  console.log('5. "만들기" 클릭');
  console.log('');
  
  await question('프로젝트를 생성하셨나요? (Enter를 누르면 계속) ');
  
  console.log('');
  console.log('Step 2: Vision API 활성화');
  console.log('---------------------------------------');
  console.log('1. 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 클릭');
  console.log('2. 검색창에 "Cloud Vision API" 입력');
  console.log('3. Cloud Vision API 선택');
  console.log('4. "사용" 버튼 클릭');
  console.log('');
  
  await question('Vision API를 활성화하셨나요? (Enter를 누르면 계속) ');
  
  console.log('');
  console.log('Step 3: 서비스 계정 키 생성');
  console.log('---------------------------------------');
  console.log('1. "API 및 서비스" > "사용자 인증 정보" 클릭');
  console.log('2. "사용자 인증 정보 만들기" > "서비스 계정" 클릭');
  console.log('3. 서비스 계정 이름: "record-ocr-service" 입력');
  console.log('4. "만들기" 클릭');
  console.log('5. 역할: "기본" > "소유자" 선택 후 "계속"');
  console.log('6. "완료" 클릭');
  console.log('');
  
  await question('서비스 계정을 생성하셨나요? (Enter를 누르면 계속) ');
  
  console.log('');
  console.log('Step 4: JSON 키 다운로드');
  console.log('---------------------------------------');
  console.log('1. 생성된 서비스 계정 클릭');
  console.log('2. "키" 탭 클릭');
  console.log('3. "키 추가" > "새 키 만들기" 클릭');
  console.log('4. "JSON" 선택 후 "만들기"');
  console.log('5. JSON 파일이 다운로드됩니다');
  console.log('');
  
  const hasKey = await question('JSON 키 파일을 다운로드하셨나요? (y/n): ');
  
  if (hasKey.toLowerCase() !== 'y') {
    console.log('JSON 키 파일을 다운로드한 후 다시 시도해주세요.');
    rl.close();
    return;
  }
  
  console.log('');
  console.log('Step 5: 환경 변수 설정');
  console.log('---------------------------------------');
  
  const keyPath = await question('다운로드한 JSON 파일의 경로를 입력하세요: ');
  
  if (!fs.existsSync(keyPath)) {
    console.log('❌ 파일을 찾을 수 없습니다:', keyPath);
    rl.close();
    return;
  }
  
  try {
    // JSON 파일 읽기
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const keyData = JSON.parse(keyContent);
    
    // Base64 인코딩
    const base64Key = Buffer.from(keyContent).toString('base64');
    
    // .env 파일 경로
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    // .env 파일이 없으면 .env.example 복사
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env 파일을 생성했습니다.');
    }
    
    // .env 파일 읽기
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    // GOOGLE_VISION_API_KEY 업데이트
    if (envContent.includes('GOOGLE_VISION_API_KEY=')) {
      envContent = envContent.replace(
        /GOOGLE_VISION_API_KEY=.*/,
        `GOOGLE_VISION_API_KEY="${base64Key}"`
      );
    } else {
      envContent += `\n# Google Vision API (자동 설정됨)\nGOOGLE_VISION_API_KEY="${base64Key}"\n`;
    }
    
    // 프로젝트 ID 업데이트
    if (envContent.includes('GOOGLE_CLOUD_PROJECT_ID=')) {
      envContent = envContent.replace(
        /GOOGLE_CLOUD_PROJECT_ID=.*/,
        `GOOGLE_CLOUD_PROJECT_ID="${keyData.project_id}"`
      );
    } else {
      envContent += `GOOGLE_CLOUD_PROJECT_ID="${keyData.project_id}"\n`;
    }
    
    // .env 파일 저장
    fs.writeFileSync(envPath, envContent);
    
    // 원본 JSON 파일을 안전한 위치로 이동 (선택사항)
    const safeKeyPath = path.join(process.cwd(), 'google-vision-key.json');
    fs.copyFileSync(keyPath, safeKeyPath);
    
    // .gitignore 확인
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('google-vision-key.json')) {
        gitignoreContent += '\n# Google Vision API Key\ngoogle-vision-key.json\n';
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('✅ .gitignore에 키 파일을 추가했습니다.');
      }
    }
    
    console.log('');
    console.log('✅ Google Vision API 설정 완료!');
    console.log('');
    console.log('📋 설정 정보:');
    console.log('- 프로젝트 ID:', keyData.project_id);
    console.log('- 서비스 계정:', keyData.client_email);
    console.log('- 환경 변수: .env 파일에 저장됨');
    console.log('');
    console.log('🎉 이제 OCR 기능을 사용할 수 있습니다!');
    console.log('');
    
    // Vercel 설정 안내
    console.log('📌 Vercel 배포 시:');
    console.log('1. Vercel 대시보드 > Settings > Environment Variables');
    console.log('2. GOOGLE_VISION_API_KEY 추가 (Base64 값)');
    console.log('3. GOOGLE_CLOUD_PROJECT_ID 추가');
    console.log('');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
  
  rl.close();
}

main().catch(console.error);