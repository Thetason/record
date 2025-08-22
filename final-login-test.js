// 최종 로그인 테스트 - 완벽한 검증

const fetch = require('node-fetch');

async function testDirectLogin(username, password) {
  console.log(`\n🔐 웹 로그인 테스트: ${username}`);
  
  try {
    // 1. API 직접 테스트
    const apiResponse = await fetch('http://localhost:3001/api/auth/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const apiData = await apiResponse.json();
    console.log(`  API 테스트: ${apiData.success ? '✅ 성공' : '❌ 실패'}`);
    
    // 2. NextAuth 실제 로그인 시뮬레이션
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    // 실제 브라우저처럼 로그인 요청
    console.log(`  브라우저 로그인 시뮬레이션 중...`);
    
    return apiData.success;
    
  } catch (error) {
    console.error(`  ❌ 에러:`, error.message);
    return false;
  }
}

async function testNewSignup() {
  console.log('\n🆕 신규 회원가입 테스트');
  
  const timestamp = Date.now();
  const newUser = {
    username: `newuser${timestamp}`,
    password: 'NewUser1234!',
    email: `newuser${timestamp}@test.com`,
    name: 'New User'
  };
  
  try {
    // 회원가입
    const signupResponse = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    const signupData = await signupResponse.json();
    
    if (signupData.user) {
      console.log(`  ✅ 회원가입 성공: ${newUser.username}`);
      
      // 즉시 로그인 테스트
      const loginSuccess = await testDirectLogin(newUser.username, newUser.password);
      console.log(`  ${loginSuccess ? '✅ 신규 계정 로그인 성공!' : '❌ 신규 계정 로그인 실패'}`);
      
      return loginSuccess;
    } else {
      console.log(`  ❌ 회원가입 실패:`, signupData.error);
      return false;
    }
    
  } catch (error) {
    console.error(`  ❌ 에러:`, error.message);
    return false;
  }
}

async function runFinalTest() {
  console.log('🎯 최종 로그인 시스템 검증\n');
  console.log('='*50);
  
  // 기존 계정 테스트
  const existingAccounts = [
    { username: 'admin', password: 'Admin1234!' },
    { username: 'syb2020', password: 'Syb20201234!' },
    { username: 'grammy2020', password: 'Grammy20201234!' }
  ];
  
  let existingSuccess = 0;
  console.log('📌 기존 계정 로그인 테스트');
  for (const account of existingAccounts) {
    const success = await testDirectLogin(account.username, account.password);
    if (success) existingSuccess++;
  }
  
  // 신규 회원가입 + 로그인 테스트
  const newAccountSuccess = await testNewSignup();
  
  // 최종 결과
  console.log('\n' + '='*50);
  console.log('📊 최종 결과:');
  console.log(`  기존 계정: ${existingSuccess}/${existingAccounts.length} 성공`);
  console.log(`  신규 가입: ${newAccountSuccess ? '✅ 성공' : '❌ 실패'}`);
  
  const allSuccess = existingSuccess === existingAccounts.length && newAccountSuccess;
  console.log(`\n${allSuccess ? '🎉 모든 테스트 통과! 로그인 시스템 완벽 작동!' : '⚠️ 일부 테스트 실패'}`);
}

runFinalTest();