import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import ProfileClient from "./ProfileClient"
import { fetchPublicProfile } from "@/lib/profile"

interface Props {
  params: { username: string }
}

// SEO를 위한 서버사이드 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(params.username, false)
  
  if (!profile) {
    return {
      title: "프로필을 찾을 수 없습니다 - Re:cord",
    }
  }

  return {
    title: `${profile.name} - ${profile.profession} | Re:cord`,
    description: `${profile.name}님의 리뷰 포트폴리오 - ${profile.totalReviews}개의 리뷰, 평균 ${profile.averageRating}점`,
    openGraph: {
      title: `${profile.name} - ${profile.profession}`,
      description: `${profile.totalReviews}개의 진짜 리뷰로 증명하는 실력`,
      images: [
        {
          url: `/api/og?username=${params.username}`,
          width: 1200,
          height: 630,
        }
      ],
      type: "profile",
      siteName: "Re:cord",
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} - ${profile.profession}`,
      description: `${profile.totalReviews}개의 진짜 리뷰로 증명하는 실력`,
      images: [`/api/og?username=${params.username}`],
    },
  }
}

const getProfile = cache(async (username: string, incrementView: boolean) => {
  const result = await fetchPublicProfile(username, {
    incrementView,
    includeDemoFallback: true
  })

  if (!result.ok) {
    return null
  }

  return result.profile
})

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfile(params.username, true)
  
  if (!profile) {
    notFound()
  }

  return <ProfileClient profile={profile} />
}
