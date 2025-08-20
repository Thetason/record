import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('=== 로그인 테스트 시작 ===\n')
    
    // 1. admin 계정 확인
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    console.log('1. Admin 계정 조회:')
    console.log('   - Username:', admin?.username)
    console.log('   - Email:', admin?.email)
    console.log('   - Password exists:', !!admin?.password)
    console.log('   - Role:', admin?.role)
    
    if (admin?.password) {
      // 2. 비밀번호 검증 테스트
      const testPasswords = [
        'Record2024Admin!',
        'admin',
        'password'
      ]
      
      console.log('\n2. 비밀번호 검증 테스트:')
      for (const pwd of testPasswords) {
        const isValid = await bcrypt.compare(pwd, admin.password)
        console.log(`   - "${pwd}": ${isValid ? '✅ 일치' : '❌ 불일치'}`)
      }
      
      // 3. 새 비밀번호로 업데이트
      console.log('\n3. 비밀번호 재설정:')
      const newPassword = 'Record2024Admin!'
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      })
      
      console.log('   ✅ 비밀번호가 재설정되었습니다.')
      console.log('   새 비밀번호:', newPassword)
      
      // 4. 재검증
      const updatedAdmin = await prisma.user.findUnique({
        where: { username: 'admin' }
      })
      
      if (updatedAdmin?.password) {
        const isNewValid = await bcrypt.compare(newPassword, updatedAdmin.password)
        console.log(`   검증 결과: ${isNewValid ? '✅ 성공' : '❌ 실패'}`)
      }
    }
    
    // 5. support 계정도 확인
    console.log('\n4. Support 계정 재설정:')
    const support = await prisma.user.findUnique({
      where: { username: 'support' }
    })
    
    if (support) {
      const supportPassword = 'Record2024Support!'
      const hashedSupportPassword = await bcrypt.hash(supportPassword, 10)
      
      await prisma.user.update({
        where: { id: support.id },
        data: { password: hashedSupportPassword }
      })
      
      console.log('   ✅ Support 계정 비밀번호 재설정 완료')
      console.log('   Username:', support.username)
      console.log('   Password:', supportPassword)
    }
    
    console.log('\n=== 로그인 정보 ===')
    console.log('관리자:')
    console.log('  아이디: admin')
    console.log('  비밀번호: Record2024Admin!')
    console.log('\n지원팀:')
    console.log('  아이디: support')
    console.log('  비밀번호: Record2024Support!')
    
  } catch (error) {
    console.error('테스트 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()