import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // 테스트 사용자 정보
    const testUserData = {
      email: 'test@record.com',
      username: 'testuser',
      password: 'test123', 
      name: '테스트 사용자',
      role: 'user'
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(testUserData.password, 10)

    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: testUserData.email }
    })

    if (existingUser) {
      console.log('✅ 테스트 사용자가 이미 존재합니다:', existingUser.email)
      return existingUser
    }

    // 새 테스트 사용자 생성
    const testUser = await prisma.user.create({
      data: {
        email: testUserData.email,
        username: testUserData.username,
        password: hashedPassword,
        name: testUserData.name,
        role: testUserData.role,
        bio: '대시보드 테스트용 사용자',
        isPublic: true,
        plan: 'free',
        reviewLimit: 50
      }
    })

    console.log('✅ 테스트 사용자가 생성되었습니다:')
    console.log('   아이디:', testUser.username)
    console.log('   이메일:', testUser.email)
    console.log('   비밀번호:', testUserData.password)

    // 샘플 리뷰 데이터 생성
    const sampleReviews = [
      {
        platform: '네이버',
        business: '맛있는 카페',
        rating: 5,
        content: '정말 맛있고 분위기도 좋아요. 직원분들도 친절하시고 커피 맛도 훌륭합니다. 다시 방문하고 싶은 곳이에요!',
        author: '김고객',
        reviewDate: new Date('2024-08-15')
      },
      {
        platform: '카카오맵',
        business: '행복한 식당',
        rating: 4,
        content: '음식이 깔끔하고 맛있어요. 가격도 합리적이고 직원분들이 친절해서 좋았습니다.',
        author: '이리뷰',
        reviewDate: new Date('2024-08-10')
      },
      {
        platform: '구글',
        business: '편안한 숙소',
        rating: 5,
        content: 'Very comfortable stay! Clean rooms and excellent service. Highly recommended!',
        author: 'John Smith',
        reviewDate: new Date('2024-08-05')
      },
      {
        platform: '크몽',
        business: '전문 서비스',
        rating: 5,
        content: '전문적이고 빠른 서비스였습니다. 요청사항을 정확히 이해하시고 완벽하게 작업해주셨어요.',
        author: '박만족',
        reviewDate: new Date('2024-07-30')
      },
      {
        platform: '인스타그램',
        business: '예쁜 카페',
        rating: 4,
        content: '인스타 감성이 물씬~ 사진 찍기 좋고 디저트도 맛있어요 💕 #카페추천 #데이트코스',
        author: 'coffeelover_',
        reviewDate: new Date('2024-07-25')
      }
    ]

    // 샘플 리뷰들 생성
    for (const review of sampleReviews) {
      await prisma.review.create({
        data: {
          ...review,
          userId: testUser.id
        }
      })
    }

    console.log(`✅ ${sampleReviews.length}개의 샘플 리뷰가 생성되었습니다.`)
    
    return testUser
  } catch (error) {
    console.error('❌ 테스트 사용자 생성 실패:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
createTestUser()