require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 사용자 권한 수정 시작...\n');

  // syb2020과 grammy2020을 일반 유저로 변경
  const users = [
    { username: 'syb2020', role: 'user' },
    { username: 'grammy2020', role: 'user' }
  ];

  for (const userData of users) {
    try {
      const user = await prisma.user.update({
        where: { username: userData.username },
        data: { role: userData.role }
      });

      console.log(`✅ ${user.username} 권한 변경 완료`);
      console.log(`   📧 이메일: ${user.email}`);
      console.log(`   🎖️  역할: ${user.role} (관리자 센터 접근 불가)`);
      console.log(`   💎 플랜: ${user.plan}\n`);
    } catch (error) {
      console.error(`❌ ${userData.username} 수정 실패:`, error.message);
    }
  }

  // 실제 관리자 계정만 확인
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['admin', 'super_admin'] }
    },
    select: {
      username: true,
      email: true,
      role: true
    }
  });

  console.log('\n👨‍💼 관리자 계정 목록:');
  admins.forEach(admin => {
    console.log(`- ${admin.username} (${admin.role}): ${admin.email}`);
  });

  console.log('\n🎉 권한 수정 완료!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
