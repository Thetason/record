import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debugLogin() {
  const user = await prisma.user.findUnique({
    where: { username: 'syb2020' }
  })
  
  if (!user) {
    console.log('❌ syb2020 계정이 존재하지 않습니다')
    
    // 계정 생성
    const hashedPassword = await bcrypt.hash('Syb2020!', 10)
    const newUser = await prisma.user.create({
      data: {
        username: 'syb2020',
        email: 'vocal202065@gmail.com',
        password: hashedPassword,
        name: 'Seoyeongbin',
        role: 'USER'
      }
    })
    console.log('✅ syb2020 계정 생성 완료')
    console.log('아이디: syb2020')
    console.log('비밀번호: Syb2020!')
    return
  }
  
  console.log('✅ 계정 찾음:', {
    id: user.id,
    username: user.username,
    email: user.email,
    hasPassword: !!user.password,
    role: user.role
  })
  
  if (user.password) {
    const isValid = await bcrypt.compare('Syb2020!', user.password)
    console.log('비밀번호 검증:', isValid ? '✅ 성공' : '❌ 실패')
    
    if (!isValid) {
      // 비밀번호 재설정
      const newHash = await bcrypt.hash('Syb2020!', 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      })
      console.log('비밀번호 재설정 완료')
      
      // 재검증
      const updatedUser = await prisma.user.findUnique({
        where: { username: 'syb2020' }
      })
      if (updatedUser?.password) {
        const isNowValid = await bcrypt.compare('Syb2020!', updatedUser.password)
        console.log('재검증:', isNowValid ? '✅ 성공' : '❌ 실패')
      }
    }
  } else {
    // 비밀번호가 없으면 설정
    const newHash = await bcrypt.hash('Syb2020!', 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    })
    console.log('✅ 비밀번호 설정 완료')
  }
  
  console.log('\n=== 로그인 정보 ===')
  console.log('아이디: syb2020')
  console.log('비밀번호: Syb2020!')
  
  await prisma.$disconnect()
}

debugLogin()