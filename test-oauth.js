// OAuth 기능 테스트 스크립트

const fetch = require('node-fetch');

async function testOAuthEndpoints() {
  console.log('🔍 OAuth 엔드포인트 테스트 시작\n');
  
  const baseUrl = 'http://localhost:3001';
  const tests = [
    {
      name: 'NextAuth 세션 체크',
      url: `${baseUrl}/api/auth/session`,
      method: 'GET'
    },
    {
      name: 'NextAuth 프로바이더 확인',
      url: `${baseUrl}/api/auth/providers`,
      method: 'GET'
    },
    {
      name: 'CSRF 토큰 확인',
      url: `${baseUrl}/api/auth/csrf`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📌 ${test.name}`);
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`  상태: ${response.status}`);
      console.log(`  응답:`, JSON.stringify(data, null, 2));
      console.log();
      
    } catch (error) {
      console.error(`  ❌ 에러: ${error.message}\n`);
    }
  }
  
  // 환경 변수 체크
  console.log('🔐 환경 변수 체크:');
  const envVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'KAKAO_CLIENT_ID',
    'KAKAO_CLIENT_SECRET'
  ];
  
  for (const envVar of envVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✅ ${envVar}: 설정됨 (${value.substring(0, 10)}...)`);
    } else {
      console.log(`  ❌ ${envVar}: 설정 안 됨`);
    }
  }
}

testOAuthEndpoints();