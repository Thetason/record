// Headless 테스트 스크립트
const fetch = require('node-fetch');

async function testLogin() {
  console.log('\n🧪 자동 로그인 테스트 시작...\n');
  
  try {
    // 1. CSRF 토큰 가져오기
    console.log('1️⃣ CSRF 토큰 요청...');
    const csrfRes = await fetch('http://localhost:3001/api/auth/csrf');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.get('set-cookie');
    console.log('✅ CSRF 토큰 획득:', csrfToken.substring(0, 20) + '...');
    
    // 2. 로그인 시도
    console.log('\n2️⃣ 로그인 시도 (syb2020)...');
    const loginRes = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: new URLSearchParams({
        username: 'syb2020',
        password: 'Syb20201234!',
        csrfToken: csrfToken
      })
    });
    
    console.log('응답 상태:', loginRes.status);
    console.log('응답 헤더:', Object.fromEntries(loginRes.headers.entries()));
    
    // 3. 세션 확인
    console.log('\n3️⃣ 세션 확인...');
    const sessionCookies = loginRes.headers.get('set-cookie');
    const sessionRes = await fetch('http://localhost:3001/api/auth/session', {
      headers: {
        'Cookie': sessionCookies || cookies
      }
    });
    const session = await sessionRes.json();
    
    console.log('\n📊 최종 결과:');
    console.log('-------------------');
    if (session && session.user) {
      console.log('✅ 로그인 성공!');
      console.log('사용자:', session.user);
    } else {
      console.log('❌ 로그인 실패 - 세션이 생성되지 않음');
      console.log('세션 데이터:', session);
    }
    
    // 4. /login 페이지에서 실제 테스트
    console.log('\n4️⃣ 실제 로그인 페이지 테스트...');
    const pageRes = await fetch('http://localhost:3001/login');
    console.log('로그인 페이지 상태:', pageRes.status);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testLogin();