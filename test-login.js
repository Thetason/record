// 로그인 테스트 스크립트

async function testLogin(username, password) {
  console.log(`\n🔍 테스팅: ${username} / ${password}`);
  
  try {
    // 1. 직접 API로 테스트
    const response = await fetch('http://localhost:3001/api/auth/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    console.log('📊 테스트 결과:', data);
    
    // 2. NextAuth signIn 테스트
    const signInResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        csrfToken: null // NextAuth에서는 필수지만 테스트에서는 스킵
      })
    });
    
    console.log('🔐 NextAuth 응답 상태:', signInResponse.status);
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  }
}

// 여러 계정 테스트
async function runTests() {
  console.log('🚀 로그인 테스트 시작...\n');
  
  // 테스트할 계정들
  const testAccounts = [
    { username: 'testuser', password: 'Test1234!' },
    { username: 'admin', password: 'Admin123!' },
    { username: 'demo', password: 'Demo1234!' }
  ];
  
  for (const account of testAccounts) {
    await testLogin(account.username, account.password);
  }
}

runTests();