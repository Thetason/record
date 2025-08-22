const fetch = require('node-fetch');

async function measurePerformance() {
  console.log('🚀 성능 테스트 시작\n');
  
  const baseUrl = 'http://localhost:3001';
  const pages = [
    { name: '홈페이지', url: '/' },
    { name: '로그인 페이지', url: '/login' },
    { name: '회원가입 페이지', url: '/signup' },
    { name: '가격 페이지', url: '/pricing' },
    { name: '대시보드', url: '/dashboard' },
  ];
  
  const results = [];
  
  for (const page of pages) {
    console.log(`📊 ${page.name} 테스트 중...`);
    
    const measurements = [];
    
    // 5번 측정하여 평균 계산
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(baseUrl + page.url);
        const html = await response.text();
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        measurements.push(loadTime);
        
        // HTML 크기 측정
        const sizeInKB = Buffer.byteLength(html, 'utf8') / 1024;
        
        if (i === 0) {
          console.log(`  📦 HTML 크기: ${sizeInKB.toFixed(2)} KB`);
        }
      } catch (error) {
        console.error(`  ❌ 에러: ${error.message}`);
      }
    }
    
    // 평균 계산
    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const minTime = Math.min(...measurements);
    const maxTime = Math.max(...measurements);
    
    console.log(`  ⏱️  평균: ${avgTime.toFixed(0)}ms`);
    console.log(`  ⚡ 최소: ${minTime}ms / 최대: ${maxTime}ms`);
    
    // 성능 평가
    let rating = '🟢 우수';
    if (avgTime > 3000) rating = '🔴 개선 필요';
    else if (avgTime > 1500) rating = '🟡 보통';
    
    console.log(`  📈 평가: ${rating}`);
    console.log();
    
    results.push({
      page: page.name,
      url: page.url,
      avgTime,
      minTime,
      maxTime,
      rating
    });
  }
  
  // 전체 결과 요약
  console.log('📊 전체 성능 테스트 결과');
  console.log('='.repeat(50));
  
  results.sort((a, b) => a.avgTime - b.avgTime);
  
  console.log('\n🏆 페이지별 로딩 속도 순위:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.page}: ${result.avgTime.toFixed(0)}ms ${result.rating}`);
  });
  
  const totalAvg = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
  console.log(`\n📊 전체 평균 로딩 시간: ${totalAvg.toFixed(0)}ms`);
  
  // 최적화 제안
  console.log('\n💡 최적화 제안:');
  const slowPages = results.filter(r => r.avgTime > 1500);
  if (slowPages.length > 0) {
    console.log('다음 페이지들의 성능 개선이 필요합니다:');
    slowPages.forEach(page => {
      console.log(`  - ${page.page}: ${page.avgTime.toFixed(0)}ms`);
    });
  } else {
    console.log('✅ 모든 페이지가 우수한 성능을 보이고 있습니다!');
  }
}

measurePerformance().catch(console.error);