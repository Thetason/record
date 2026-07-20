import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import ProfileClient from "./ProfileClient"
import { fetchPublicProfile, type FetchPublicProfileResult } from "@/lib/profile"
import { fetchLivePublicProfile, shouldUseLivePublicProfile } from "@/lib/live-public-profile"

interface Props {
  params: Promise<{ username: string }>
}

// SEO를 위한 서버사이드 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const result = await getProfileResult(username, false)

  if (!result.ok) {
    if (result.status >= 500) {
      return {
        title: "프로필을 잠시 불러올 수 없습니다 - Re:cord",
        description:
          "현재 신뢰 페이지 데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      }
    }

    return {
      title: "프로필을 찾을 수 없습니다 - Re:cord",
    }
  }

  const profile = result.profile

  return {
    title: `${profile.name} - ${profile.profession} | Re:cord`,
    description: `${profile.name}님의 신뢰 포트폴리오 - ${profile.totalReviews}개의 리뷰와 작업 증거를 한 링크에서 확인하세요.`,
    openGraph: {
      title: `${profile.name} - ${profile.profession}`,
      description: `${profile.totalReviews}개의 리뷰와 작업 증거를 한 링크에서 확인하세요.`,
      images: [
        {
          url: `/api/og?username=${username}`,
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
      description: `${profile.totalReviews}개의 리뷰와 작업 증거를 한 링크에서 확인하세요.`,
      images: [`/api/og?username=${username}`],
    },
  }
}

const getProfileResult = cache(async (username: string, incrementView: boolean): Promise<FetchPublicProfileResult> => {
  const result = await fetchPublicProfile(username, {
    incrementView,
    includeDemoFallback: false
  })

  if (!result.ok && result.status === 404 && shouldUseLivePublicProfile(username)) {
    const liveProfile = await fetchLivePublicProfile(username)

    if (liveProfile) {
      return {
        ok: true,
        profile: liveProfile,
        normalizedUsername: liveProfile.username,
        truncated: false
      }
    }
  }

  return result
})

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const result = await getProfileResult(username, true)

  if (!result.ok) {
    if (result.status === 404) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-[#f7f6f3] text-[#161616]">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 rounded-full bg-[#ffe7dd] px-4 py-2 text-sm font-semibold text-[#ff6b35]">
            TEMPORARY ISSUE
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            신뢰 페이지를 잠시 불러올 수 없습니다
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#5c5c5c] sm:text-lg">
            프로필 데이터 또는 데이터베이스 연결 상태를 확인하는 중입니다. 잠시 후 다시 시도해주세요.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#161616] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
          >
            홈으로 돌아가기
          </Link>
        </section>
      </main>
    )
  }

  const profile = result.profile

  if (!profile) {
    notFound()
  }

  return <ProfileClient profile={profile} />
}
