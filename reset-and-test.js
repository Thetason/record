const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAndTest() {
  console.log('🔄 데이터베이스 리셋 및 테스트 시작...\n');
  
  // 기존 syb2020 삭제
  try {
    await prisma.user.delete({
      where: { username: 'syb2020' }
    });
    console.log('기존 syb2020 삭제됨');
  } catch (e) {
    console.log('기존 syb2020 없음');
  }
  
  // 새로 생성
  const password = 'Syb20201234!';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('\n새 사용자 생성 중...');
  console.log('비밀번호:', password);
  console.log('해시:', hashedPassword);
  
  const user = await prisma.user.create({
    data: {
      email: 'syb2020@test.com',
      username: 'syb2020',
      password: hashedPassword,
      name: 'SYB',
      role: 'admin',
      plan: 'pro',
      reviewLimit: 100,
      avatar: 'S'
    }
  });
  
  console.log('\n✅ 사용자 생성 완료');
  console.log('ID:', user.id);
  console.log('Username:', user.username);
  console.log('Email:', user.email);
  
  // 검증
  console.log('\n=== 검증 테스트 ===');
  const verifyUser = await prisma.user.findUnique({
    where: { username: 'syb2020' }
  });
  
  if (verifyUser && verifyUser.password) {
    const isValid = await bcrypt.compare(password, verifyUser.password);
    console.log('DB 조회: ✅');
    console.log('비밀번호 검증:', isValid ? '✅ 성공' : '❌ 실패');
    
    // API 테스트
    console.log('\n=== API 로그인 테스트 ===');
    try {
      const response = await fetch('http://localhost:3001/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'syb2020',
          password: 'Syb20201234!',
          csrfToken: ''
        }),
        redirect: 'manual'
      });
      
      console.log('API 응답 상태:', response.status);
      console.log('로그인 성공:', response.status === 302 ? '✅' : '❌');
      
      if (response.status !== 302) {
        const text = await response.text();
        console.log('응답 내용:', text.substring(0, 200));
      }
    } catch (error) {
      console.error('API 테스트 실패:', error.message);
    }
  }
  
  console.log('\n=============================');
  console.log('📌 로그인 정보');
  console.log('=============================');
  console.log('아이디: syb2020');
  console.log('비밀번호: Syb20201234!');
  console.log('=============================');
  
  await prisma.$disconnect();
}

resetAndTest().catch(console.error);