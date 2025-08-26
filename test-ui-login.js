// UI 로그인 테스트 스크립트
const puppeteer = require('puppeteer');

async function testUILogin() {
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log('🚀 UI 로그인 테스트 시작...\n');
    
    try {
        // 로그인 페이지로 이동
        await page.goto('http://localhost:3001/login');
        await page.waitForSelector('input[name="email"]', { timeout: 5000 });
        
        // 테스트 계정 목록
        const testAccounts = [
            { email: 'admin@record.com', password: 'Admin1234!' },
            { email: 'test@record.com', password: 'Testuser1234!' },
            { email: 'vocal202065@gmail.com', password: 'Syb20201234!' }
        ];
        
        for (const account of testAccounts) {
            console.log(`\n🔍 테스팅: ${account.email}`);
            
            // 로그인 페이지로 이동
            await page.goto('http://localhost:3001/login');
            await page.waitForSelector('input[name="email"]');
            
            // 폼 입력
            await page.type('input[name="email"]', account.email);
            await page.type('input[name="password"]', account.password);
            
            // 로그인 버튼 클릭
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.click('button[type="submit"]')
            ]);
            
            // 로그인 성공 확인
            const currentUrl = page.url();
            if (currentUrl.includes('/dashboard')) {
                console.log('✅ 로그인 성공! 대시보드로 이동함');
                
                // 사용자 정보 확인
                const userInfo = await page.evaluate(() => {
                    const userElement = document.querySelector('[data-testid="user-info"]');
                    return userElement ? userElement.textContent : '사용자 정보를 찾을 수 없음';
                });
                console.log(`  사용자 정보: ${userInfo}`);
                
                // 로그아웃
                await page.goto('http://localhost:3001/api/auth/signout');
                await page.waitForSelector('button');
                await page.click('button');
            } else if (currentUrl.includes('/login')) {
                console.log('❌ 로그인 실패! 여전히 로그인 페이지에 있음');
                
                // 에러 메시지 확인
                const errorMessage = await page.evaluate(() => {
                    const errorElement = document.querySelector('.text-red-500, .text-destructive, [role="alert"]');
                    return errorElement ? errorElement.textContent : '에러 메시지 없음';
                });
                console.log(`  에러 메시지: ${errorMessage}`);
            } else {
                console.log(`❓ 예상치 못한 페이지로 이동: ${currentUrl}`);
            }
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
    } finally {
        await browser.close();
        console.log('\n✨ UI 테스트 완료');
    }
}

// 서버가 준비될 때까지 대기
setTimeout(() => {
    testUILogin();
}, 2000);