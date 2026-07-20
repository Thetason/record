import type { Metadata } from "next"

import { TargetAudienceLanding } from "@/components/landing/TargetAudienceLanding"

export const metadata: Metadata = {
  title: "Re:cord for Platform Freelancers",
  description: "플랫폼에 묶인 크몽 리뷰를 내 이름의 소개 페이지와 포트폴리오 자산으로 바꾸는 방법.",
}

export default function KmongLandingPage() {
  return (
    <TargetAudienceLanding
      eyebrow="FOR PLATFORM FREELANCERS"
      headline="플랫폼에 묶인 크몽 리뷰, 이제 내 이름으로 보관하세요"
      problem="플랫폼 노출이 줄어도, 내가 쌓은 평판까지 잃을 필요는 없습니다."
      summary="디자이너, 마케터, 개발자처럼 플랫폼 안에서 리뷰를 쌓아온 프리랜서는 노출 구조가 바뀌면 기회까지 함께 줄어들기 쉽습니다. Re:cord는 그 리뷰를 포트폴리오형 소개 페이지로 정리해, 플랫폼 밖에서도 소개와 상담을 이어가게 만듭니다."
      bullets={[
        "플랫폼 리뷰 스크린샷 백업",
        "내 이름의 소개 페이지와 링크 운영",
        "앞으로는 직접 후기까지 내 자산화",
      ]}
      evidenceLabel="왜 지금 크몽 프리랜서에게 맞나"
      evidenceText="플랫폼 내부 노출은 언제든 바뀔 수 있지만, 이미 쌓인 신뢰는 개인 자산으로 남아야 합니다. Re:cord는 플랫폼 밖에서도 바로 공유할 수 있는 소개 페이지를 만들어줍니다."
      audienceExamples={[
        "크몽 리뷰가 많은 디자이너",
        "플랫폼 종속도가 높은 마케터",
        "노션·링크트리·인스타로 포트폴리오를 돌리던 프리랜서",
      ]}
      requestAudience="크몽 프리랜서"
      requestPlatform="크몽"
      requestSource="kmong-landing"
    />
  )
}
