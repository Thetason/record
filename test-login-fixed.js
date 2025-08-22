// 수정된 비밀번호로 로그인 테스트

async function testLogin(username, password) {
  console.log(`\n🔍 테스팅: ${username} / ${password}`);
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 로그인 성공!');
      console.log('  사용자:', data.user);
    } else {
      console.log('❌ 로그인 실패');
      console.log('  디버그:', data.debug);
    }
    
    return data.success;
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 수정된 비밀번호로 로그인 테스트...\n');
  
  const testAccounts = [
    { username: 'admin', password: 'Admin1234!' },
    { username: 'testuser', password: 'Testuser1234!' },
    { username: 'syb2020', password: 'Syb20201234!' },
    { username: 'grammy2020', password: 'Grammy20201234!' },
  ];
  
  let successCount = 0;
  for (const account of testAccounts) {
    const success = await testLogin(account.username, account.password);
    if (success) successCount++;
  }
  
  console.log(`\n📊 결과: ${successCount}/${testAccounts.length} 성공`);
}

runTests();