import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { username: 'syb2020' },
    select: {
      username: true,
      email: true,
      password: true,
      name: true
    }
  })

  console.log('User info:')
  console.log('Username:', user?.username)
  console.log('Email:', user?.email)
  console.log('Name:', user?.name)
  console.log('Has password:', user?.password ? 'YES' : 'NO')
  console.log('Password length:', user?.password?.length || 0)

  await prisma.$disconnect()
}

checkUser()
