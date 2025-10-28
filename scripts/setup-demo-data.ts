import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 데모 데이터 생성 시작...\n')

  // 1. syb2020 계정 생성
  console.log('👤 syb2020 계정 확인 중...')

  const existingUser = await prisma.user.findUnique({
    where: { username: 'syb2020' }
  })

  let user
  if (existingUser) {
    console.log('ℹ️  기존 syb2020 계정 발견, 비밀번호 업데이트 중...')
    const hashedPassword = await bcrypt.hash('Syb2020!', 10)
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        name: '세타쓴',
        bio: '음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다. 9년차 전문 보컬 트레이너입니다.',
        profession: '보컬트레이닝 전문가',
        experience: '9년차',
        location: '서울 강남구',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=320&h=320&q=80',
        plan: 'premium',
        reviewLimit: 100
      }
    })
  } else {
    console.log('✨ 새로운 syb2020 계정 생성 중...')
    const hashedPassword = await bcrypt.hash('Syb2020!', 10)
    user = await prisma.user.create({
      data: {
        username: 'syb2020',
        email: 'vocal202065@gmail.com',
        password: hashedPassword,
        name: '세타쓴',
        bio: '음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다. 9년차 전문 보컬 트레이너입니다.',
        profession: '보컬트레이닝 전문가',
        experience: '9년차',
        location: '서울 강남구',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=320&h=320&q=80',
        plan: 'premium',
        reviewLimit: 100,
        role: 'user'
      }
    })
  }

  console.log('✅ syb2020 계정 준비 완료')
  console.log(`   아이디: syb2020`)
  console.log(`   비밀번호: Syb2020!`)
  console.log(`   이메일: vocal202065@gmail.com\n`)

  // 2. 기존 리뷰 삭제
  console.log('🗑️  기존 리뷰 삭제 중...')
  await prisma.review.deleteMany({
    where: { userId: user.id }
  })
  console.log('✅ 기존 리뷰 삭제 완료\n')

  // 3. 데모 리뷰 생성
  console.log('📝 데모 리뷰 생성 중...')

  const demoReviews = [
    {
      businessName: '보컬트레이닝 전문가 · 9년차',
      platform: 'naver',
      rating: 5,
      content: '음악을 사랑하는 모든 이들에게 최고의 보컬 레슨을 제공합니다.',
      reviewerName: '김민준',
      reviewDate: new Date('2024-01-15')
    },
    {
      businessName: '세타쓴 보컬 아카데미',
      platform: 'kakao',
      rating: 5,
      content: '발성부터 감정 표현까지 체계적으로 배울 수 있었어요. 정말 실력이 늘었습니다!',
      reviewerName: '이서연',
      reviewDate: new Date('2024-02-20')
    },
    {
      businessName: '세타쓴 보컬 레슨',
      platform: 'google',
      rating: 5,
      content: '선생님의 열정과 전문성에 감동받았습니다. 목소리가 완전히 달라졌어요.',
      reviewerName: '박지우',
      reviewDate: new Date('2024-03-10')
    },
    {
      businessName: '세타쓴 음악 스튜디오',
      platform: 'naver',
      rating: 5,
      content: '고음 처리가 항상 어려웠는데, 세타쓴 선생님 덕분에 자신감을 얻었어요!',
      reviewerName: '최예린',
      reviewDate: new Date('2024-04-05')
    },
    {
      businessName: '프로 보컬 트레이닝',
      platform: 'instagram',
      rating: 5,
      content: '오디션 준비하면서 많은 도움 받았습니다. 1:1 맞춤 레슨 최고!',
      reviewerName: '정수민',
      reviewDate: new Date('2024-05-12')
    }
  ]

  for (const review of demoReviews) {
    await prisma.review.create({
      data: {
        ...review,
        userId: user.id,
        isPublic: true
      }
    })
  }

  console.log(`✅ ${demoReviews.length}개의 데모 리뷰 생성 완료\n`)

  // 4. 확인
  const reviewCount = await prisma.review.count({
    where: { userId: user.id }
  })

  console.log('🎉 데모 데이터 생성 완료!')
  console.log(`   사용자: ${user.username}`)
  console.log(`   리뷰 개수: ${reviewCount}개`)
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
