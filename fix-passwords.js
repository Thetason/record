// 비밀번호 해시 문제 해결 스크립트
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPasswords() {
  console.log('🔧 비밀번호 해시 수정 시작...\n');
  
  try {
    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        createdAt: true
      }
    });
    
    console.log(`📊 총 ${users.length}명의 사용자 발견\n`);
    
    for (const user of users) {
      console.log(`\n👤 사용자: ${user.username}`);
      console.log(`  이메일: ${user.email}`);
      console.log(`  생성일: ${user.createdAt}`);
      
      // 기본 비밀번호로 재설정 (username + 1234!)
      const newPassword = user.username.charAt(0).toUpperCase() + user.username.slice(1) + '1234!';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 비밀번호 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log(`  ✅ 비밀번호 재설정 완료: ${newPassword}`);
      
      // 검증 테스트
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log(`  🔐 검증 테스트: ${isValid ? '성공' : '실패'}`);
    }
    
    console.log('\n\n✨ 모든 비밀번호 수정 완료!');
    console.log('다음 계정으로 로그인 가능:');
    console.log('----------------------------------------');
    for (const user of users) {
      const password = user.username.charAt(0).toUpperCase() + user.username.slice(1) + '1234!';
      console.log(`아이디: ${user.username} / 비밀번호: ${password}`);
    }
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();