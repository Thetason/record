import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        reviews: {
          orderBy: { reviewDate: 'desc' },
          take: 50
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 프로필 조회수 증가 (자기 자신 조회 제외)
    // TODO: IP 기반 중복 체크 추가 필요
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileViews: {
          increment: 1
        }
      }
    })

    // 통계 계산
    const totalReviews = user.reviews.length
    const averageRating = totalReviews > 0
      ? Number((user.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0

    const platforms = [...new Set(user.reviews.map(r => r.platform))]

    // Mock 데이터 (실제로는 DB에서 가져와야 함)
    const mockProfile = {
      id: user.id,
      username: user.username,
      name: user.name || "김서연",
      profession: "필라테스 강사",
      bio: "10년 경력의 필라테스 전문가입니다. 재활과 체형교정을 전문으로 하며, 개인의 신체 특성에 맞춘 맞춤형 운동을 제공합니다.",
      avatar: "",
      coverImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop",
      totalReviews,
      averageRating,
      platforms,
      experience: "10년차",
      location: "서울 강남구",
      specialties: [
        "재활 필라테스",
        "체형 교정",
        "산전/산후 관리",
        "다이어트",
        "근력 강화"
      ],
      certifications: [
        "KPEE 필라테스 지도자",
        "재활 트레이닝 전문가",
        "스포츠 마사지 1급"
      ],
      socialLinks: {
        instagram: "https://instagram.com/pilates_kim",
        website: "https://pilates-kim.com"
      },
      // 커스터마이징 설정 추가
      theme: user.theme || 'default',
      layout: user.layout || 'grid',
      bgImage: user.bgImage || null,
      bgColor: user.bgColor || '#ffffff',
      accentColor: user.accentColor || '#FF6B35',
      introVideo: user.introVideo || null,
      customCss: user.customCss || null,
      reviews: user.reviews.map(review => ({
        id: review.id,
        platform: review.platform,
        business: review.business || "비너스필라테스",
        rating: review.rating,
        content: review.content,
        author: review.author,
        reviewDate: review.reviewDate.toISOString(),
        verified: review.verifiedAt ? true : false,
        verifiedAt: review.verifiedAt,
        verifiedBy: review.verifiedBy,
        originalUrl: review.originalUrl
      }))
    }

    // 데모 리뷰 추가 (실제 리뷰가 없을 경우)
    if (mockProfile.reviews.length === 0) {
      mockProfile.reviews = [
        {
          id: "1",
          platform: "네이버",
          business: "비너스필라테스",
          rating: 5,
          content: "김서연 강사님 정말 최고예요! 자세 하나하나 꼼꼼하게 봐주시고, 제 몸 상태에 맞춰서 운동 강도도 조절해주셔서 너무 좋았어요. 허리 통증이 있었는데 3개월만에 완전히 좋아졌습니다.",
          author: "정**",
          reviewDate: "2024-08-07",
          verified: true
        },
        {
          id: "2",
          platform: "카카오",
          business: "밸런스드필라테스",
          rating: 5,
          content: "서연쌤 수업은 진짜 강추! 기구 필라테스 처음인데도 무리 없이 따라갈 수 있게 지도해주셔서 감사해요. 체형 교정 효과도 확실히 보고 있습니다.",
          author: "이**",
          reviewDate: "2024-08-06",
          verified: true
        },
        {
          id: "3",
          platform: "네이버",
          business: "필라오라인",
          rating: 5,
          content: "6개월째 김서연 강사님께 PT받고 있는데 체형이 정말 많이 개선됐어요. 전문적이면서도 친절하신 최고의 강사님! 운동 처방도 너무 정확해서 만족도 200%입니다.",
          author: "박**",
          reviewDate: "2024-08-05",
          verified: true
        },
        {
          id: "4",
          platform: "구글",
          business: "비너스필라테스",
          rating: 5,
          content: "Professional and caring instructor. Kim Seoyeon really knows her stuff. My posture has improved significantly after just 2 months of training.",
          author: "Sarah K.",
          reviewDate: "2024-08-04",
          verified: true
        },
        {
          id: "5",
          platform: "인스타",
          business: "필라오라인",
          rating: 5,
          content: "산후 회복 프로그램으로 김서연 선생님 수업 들었는데 정말 만족스러웠어요! 몸도 마음도 건강해지는 느낌. 강추합니다!",
          author: "최**",
          reviewDate: "2024-08-03",
          verified: true
        },
        {
          id: "6",
          platform: "네이버",
          business: "비너스필라테스",
          rating: 5,
          content: "회원님 한 분 한 분 신경써주시는게 느껴져요. 운동 효과도 좋고 무엇보다 재밌게 운동할 수 있어서 좋습니다!",
          author: "강**",
          reviewDate: "2024-08-02",
          verified: true
        }
      ]
      mockProfile.totalReviews = mockProfile.reviews.length
      mockProfile.averageRating = 5.0
      mockProfile.platforms = ["네이버", "카카오", "구글", "인스타"]
    }

    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: '프로필을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}