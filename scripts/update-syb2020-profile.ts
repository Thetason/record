import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // syb2020 사용자의 bio를 업데이트
  const user = await prisma.user.update({
    where: {
      username: 'syb2020'
    },
    data: {
      bio: '보컬트레이닝 전문가 · 9년차\n음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다.'
    }
  })

  console.log('✅ 프로필 업데이트 완료:', user)
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
