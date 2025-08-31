const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 사용자 초기화 시작...');

  // 테스트 사용자 생성
  const users = [
    {
      email: 'syb2020@test.com',
      username: 'syb2020',
      password: 'Test1234!',
      name: 'SYB',
      role: 'admin',
      plan: 'pro',
      reviewLimit: 100
    },
    {
      email: 'admin@test.com',
      username: 'admin',
      password: 'Admin1234!',
      name: 'Admin',
      role: 'admin',
      plan: 'pro',
      reviewLimit: 100
    },
    {
      email: 'test@test.com',
      username: 'testuser',
      password: 'Test1234!',
      name: 'Test User',
      role: 'user',
      plan: 'free',
      reviewLimit: 50
    }
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          plan: userData.plan,
          reviewLimit: userData.reviewLimit,
          avatar: userData.name.charAt(0).toUpperCase()
        }
      });
      
      console.log(`✅ 사용자 생성: ${user.username} (비밀번호: ${userData.password})`);
      console.log(`   해시: ${hashedPassword}`);
      
      // 비밀번호 검증 테스트
      const isValid = await bcrypt.compare(userData.password, hashedPassword);
      console.log(`   검증 테스트: ${isValid ? '✅ 성공' : '❌ 실패'}`);
    } catch (error) {
      console.error(`❌ ${userData.username} 생성 실패:`, error.message);
    }
  }

  // 생성된 사용자 확인
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      plan: true,
      password: true
    }
  });

  console.log('\n📋 전체 사용자 목록:');
  for (const user of allUsers) {
    console.log(`- ${user.username}: ${user.email} (${user.role}/${user.plan})`);
    console.log(`  해시: ${user.password?.substring(0, 20)}...`);
  }

  // 로그인 테스트
  console.log('\n🔐 로그인 테스트:');
  const testUser = await prisma.user.findUnique({
    where: { username: 'syb2020' }
  });
  
  if (testUser && testUser.password) {
    const testPassword = 'Test1234!';
    const isValid = await bcrypt.compare(testPassword, testUser.password);
    console.log(`syb2020 로그인 테스트: ${isValid ? '✅ 성공' : '❌ 실패'}`);
    
    if (!isValid) {
      console.log('디버그 정보:');
      console.log('- 입력 비밀번호:', testPassword);
      console.log('- DB 해시:', testUser.password);
      console.log('- 해시 형식:', testUser.password.substring(0, 7));
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });