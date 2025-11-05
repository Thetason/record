require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Re:cord 계정 목록\n');
  
  const users = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      createdAt: true,
      password: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (users.length === 0) {
    console.log('❌ 등록된 계정이 없습니다.');
    return;
  }

  console.log(`총 ${users.length}개 계정 발견:\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}`);
    console.log(`   📧 이메일: ${user.email}`);
    console.log(`   👤 이름: ${user.name}`);
    console.log(`   🔑 역할: ${user.role}`);
    console.log(`   💎 플랜: ${user.plan}`);
    console.log(`   🔐 비밀번호 해시: ${user.password ? user.password.substring(0, 29) + '...' : '없음 (OAuth 계정)'}`);
    console.log(`   📅 가입일: ${user.createdAt.toLocaleDateString('ko-KR')}`);
    console.log('');
  });

  console.log('\n⚠️  주의: 실제 비밀번호는 위 스크립트나 문서를 참고하세요.');
  console.log('초기화 스크립트에서 설정한 비밀번호:');
  console.log('- syb2020: Test1234!');
  console.log('- admin: Admin1234!');
  console.log('- testuser: Test1234!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
