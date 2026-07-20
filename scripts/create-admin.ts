import { PrismaClient } from './prisma-client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // 관리자 계정 정보
    const adminData = {
      email: 'admin@record.com',
      username: 'admin',
      password: 'Record2024Admin!', // 실제 운영 시 변경 필요
      name: 'Record Admin',
      role: 'super_admin'
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // 기존 관리자 계정 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (existingAdmin) {
      // 기존 계정을 관리자로 업데이트
      const updatedAdmin = await prisma.user.update({
        where: { email: adminData.email },
        data: { role: 'super_admin' }
      })
      console.log('✅ 기존 계정을 관리자로 업데이트했습니다:', updatedAdmin.email)
    } else {
      // 새 관리자 계정 생성
      const newAdmin = await prisma.user.create({
        data: {
          email: adminData.email,
          username: adminData.username,
          password: hashedPassword,
          name: adminData.name,
          role: adminData.role,
          bio: 'Re:cord 서비스 관리자',
          isPublic: false
        }
      })
      console.log('✅ 관리자 계정이 생성되었습니다:')
      console.log('   아이디:', newAdmin.username)
      console.log('   이메일:', newAdmin.email)
      console.log('   비밀번호:', adminData.password)
      console.log('   권한:', newAdmin.role)
    }

    // 추가 관리자 계정 생성 (선택사항)
    const subAdminData = {
      email: 'support@record.com',
      username: 'support',
      password: 'Record2024Support!',
      name: 'Record Support',
      role: 'admin'
    }

    const hashedSupportPassword = await bcrypt.hash(subAdminData.password, 10)
    const existingSupport = await prisma.user.findUnique({
      where: { email: subAdminData.email }
    })

    if (!existingSupport) {
      const supportAdmin = await prisma.user.create({
        data: {
          email: subAdminData.email,
          username: subAdminData.username,
          password: hashedSupportPassword,
          name: subAdminData.name,
          role: subAdminData.role,
          bio: 'Re:cord 고객 지원팀',
          isPublic: false
        }
      })
      console.log('\n✅ 지원팀 계정이 생성되었습니다:')
      console.log('   아이디:', supportAdmin.username)
      console.log('   이메일:', supportAdmin.email)
      console.log('   비밀번호:', subAdminData.password)
      console.log('   권한:', supportAdmin.role)
    }

    console.log('\n📌 관리자 페이지 접속: /admin')
    console.log('⚠️  보안을 위해 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!')
    
  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
createAdmin()
