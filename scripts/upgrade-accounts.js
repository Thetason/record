require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('⬆️  Pro 플랜 업그레이드 시작...\n');

  const usernames = ['syb2020', 'grammy2020'];

  for (const username of usernames) {
    try {
      const user = await prisma.user.update({
        where: { username },
        data: {
          plan: 'pro',
          reviewLimit: -1, // 무제한
          role: 'admin' // 관리자 권한도 부여
        }
      });

      console.log(`✅ ${username} 업그레이드 완료`);
      console.log(`   📧 이메일: ${user.email}`);
      console.log(`   💎 플랜: ${user.plan}`);
      console.log(`   📊 리뷰 한도: 무제한`);
      console.log(`   🎖️  역할: ${user.role}\n`);
    } catch (error) {
      console.error(`❌ ${username} 업그레이드 실패:`, error.message);
    }
  }

  console.log('🎉 업그레이드 완료!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
