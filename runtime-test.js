// 런타임 페이지 테스트

const fetch = require('node-fetch');

async function testPages() {
  console.log('🧪 런타임 페이지 테스트\n');
  
  const baseUrl = 'http://localhost:3001';
  const pages = [
    { name: '홈페이지', url: '/' },
    { name: '로그인 페이지', url: '/login' },
    { name: '회원가입 페이지', url: '/signup' },
    { name: '가격 페이지', url: '/pricing' },
    { name: '업그레이드 페이지', url: '/pricing/upgrade' },
  ];
  
  let successCount = 0;
  let errors = [];
  
  for (const page of pages) {
    try {
      console.log(`📄 ${page.name} (${page.url})`);
      const response = await fetch(baseUrl + page.url);
      
      if (response.ok) {
        console.log(`  ✅ 상태: ${response.status} - 정상`);
        successCount++;
        
        // HTML 내용 확인 (소셜 로그인 버튼 존재 여부)
        const html = await response.text();
        if (page.url === '/login' || page.url === '/signup') {
          const hasGoogle = html.includes('구글') || html.includes('Google');
          const hasKakao = html.includes('카카오') || html.includes('Kakao');
          console.log(`  📱 소셜 로그인: Google(${hasGoogle ? '✅' : '❌'}) Kakao(${hasKakao ? '✅' : '❌'})`);
        }
      } else {
        console.log(`  ❌ 상태: ${response.status} - 오류`);
        errors.push(`${page.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ 에러: ${error.message}`);
      errors.push(`${page.name}: ${error.message}`);
    }
    console.log();
  }
  
  // 결과 요약
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(40));
  console.log(`총 페이지: ${pages.length}개`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${errors.length}개`);
  
  if (errors.length > 0) {
    console.log('\n❌ 오류 목록:');
    errors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('\n🎉 모든 페이지가 정상 작동합니다!');
  }
}

testPages();