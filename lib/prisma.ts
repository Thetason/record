import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // 연결 풀 최적화 설정
  transactionOptions: {
    maxWait: 5000, // 5초 대기
    timeout: 10000, // 10초 타임아웃
  },
  errorFormat: 'pretty',
})

// 글로벌 인스턴스로 연결 풀 재사용 (중요!)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown 처리
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})