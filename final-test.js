const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('🔍 Re:cord 최종 테스트 시작...\n');
  let passed = 0;
  let failed = 0;
  const timestamp = Date.now();

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function waitForServer() {
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const health = await fetch(`${BASE_URL}/api/health`);
        if (health.ok) {
          return true;
        }
      } catch (error) {
        // ignore and retry
      }
      await wait(2000);
    }
    return false;
  }

  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('❌ 서버가 준비되지 않았습니다. /api/health 확인 필요');
    return;
  }

  // 1. 홈페이지 접속
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      console.log('✅ 홈페이지 접속 성공');
      passed++;
    } else {
      console.log('❌ 홈페이지 접속 실패');
      failed++;
    }
  } catch (e) {
    console.log('❌ 홈페이지 접속 실패:', e.message);
    failed++;
  }

  // 2. 회원가입 API
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'test' + timestamp + '@test.com',
        username: 'test' + timestamp,
        password: 'Test1234!',
        name: 'Test User'
      })
    });
    const text = await res.text();
    const data = res.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : null;
    if (data.success) {
      console.log('✅ 회원가입 API 작동');
      passed++;
    } else {
      console.log('❌ 회원가입 실패:', data?.error || text);
      failed++;
    }
  } catch (e) {
    console.log('❌ 회원가입 API 오류:', e.message);
    failed++;
  }

  // 3. 로그인 페이지
  try {
    const res = await fetch(`${BASE_URL}/login`);
    if (res.ok) {
      console.log('✅ 로그인 페이지 접속 성공');
      passed++;
    } else {
      console.log('❌ 로그인 페이지 접속 실패');
      failed++;
    }
  } catch (e) {
    console.log('❌ 로그인 페이지 오류:', e.message);
    failed++;
  }

  // 4. 대시보드 (인증 필요)
  try {
    const res = await fetch(`${BASE_URL}/dashboard`);
    // 리다이렉트되면 정상 (로그인 필요)
    if (!res.ok || res.redirected) {
      console.log('✅ 대시보드 보호 작동 (로그인 필요)');
      passed++;
    } else {
      console.log('⚠️ 대시보드가 보호되지 않음');
      failed++;
    }
  } catch (e) {
    console.log('❌ 대시보드 접근 오류:', e.message);
    failed++;
  }

  // 5. 결제 API 확인
  try {
    const res = await fetch(`${BASE_URL}/api/payments/subscribe`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({})
    });
    // 401이면 정상 (인증 필요)
    if (res.status === 401) {
      console.log('✅ 결제 API 보호 작동');
      passed++;
    } else {
      console.log('⚠️ 결제 API 응답:', res.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ 결제 API 오류:', e.message);
    failed++;
  }

  // 6. 공개 프로필
  try {
    const res = await fetch(`${BASE_URL}/testuser`);
    if (res.ok || res.status === 404) {
      console.log('✅ 공개 프로필 라우트 작동');
      passed++;
    } else {
      console.log('❌ 공개 프로필 오류');
      failed++;
    }
  } catch (e) {
    console.log('❌ 공개 프로필 오류:', e.message);
    failed++;
  }

  console.log('\n=============================');
  console.log('📊 테스트 결과');
  console.log('✅ 성공: ' + passed + '개');
  console.log('❌ 실패: ' + failed + '개');
  console.log('=============================');
  
  if (failed === 0) {
    console.log('\n🎉 모든 테스트 통과! 런칭 준비 완료!');
  } else {
    console.log('\n⚠️ 일부 테스트 실패. 확인 필요.');
  }
}

runTests();
