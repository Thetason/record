import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        password: true
      }
    })

    console.log('현재 등록된 사용자:')
    users.forEach(user => {
      console.log('---')
      console.log('ID:', user.id)
      console.log('Username:', user.username)
      console.log('Email:', user.email)
      console.log('Name:', user.name)
      console.log('Role:', user.role)
      console.log('Password exists:', !!user.password)
    })

    console.log('\n총 사용자 수:', users.length)
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()