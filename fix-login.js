const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixLogin() {
  console.log('🔧 로그인 문제 해결 시작...\n');
  
  // syb2020 계정 확인
  const user = await prisma.user.findUnique({
    where: { username: 'syb2020' }
  });
  
  if (!user) {
    console.log('❌ syb2020 사용자가 없습니다. 생성 중...');
    
    const hashedPassword = await bcrypt.hash('Syb20201234!', 10);
    const newUser = await prisma.user.create({
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
    
    console.log('✅ syb2020 사용자 생성 완료');
  } else {
    console.log('✅ syb2020 사용자 존재');
    
    // 비밀번호 확인
    if (user.password) {
      const isValid = await bcrypt.compare('Syb20201234!', user.password);
      console.log('현재 비밀번호 검증:', isValid ? '✅ 일치' : '❌ 불일치');
      
      if (!isValid) {
        console.log('비밀번호 재설정 중...');
        const newHash = await bcrypt.hash('Syb20201234!', 10);
        await prisma.user.update({
          where: { username: 'syb2020' },
          data: { password: newHash }
        });
        console.log('✅ 비밀번호 재설정 완료');
      }
    } else {
      console.log('비밀번호 설정 중...');
      const newHash = await bcrypt.hash('Syb20201234!', 10);
      await prisma.user.update({
        where: { username: 'syb2020' },
        data: { password: newHash }
      });
      console.log('✅ 비밀번호 설정 완료');
    }
  }
  
  // 최종 검증
  console.log('\n=== 최종 검증 ===');
  const finalUser = await prisma.user.findUnique({
    where: { username: 'syb2020' }
  });
  
  if (finalUser && finalUser.password) {
    const finalCheck = await bcrypt.compare('Syb20201234!', finalUser.password);
    console.log('로그인 가능:', finalCheck ? '✅ YES' : '❌ NO');
    console.log('\n로그인 정보:');
    console.log('아이디: syb2020');
    console.log('비밀번호: Syb20201234!');
  }
  
  await prisma.$disconnect();
}

fixLogin().catch(console.error);