import type { Metadata } from "next"

import { TargetAudienceLanding } from "@/components/landing/TargetAudienceLanding"

export const metadata: Metadata = {
  title: "Re:cord for PT Trainers",
  description: "센터를 옮겨도 내 회원의 신뢰를 이어가는 트레이너 소개 페이지.",
}

export default function PtLandingPage() {
  return (
    <TargetAudienceLanding
      eyebrow="FOR PT TRAINERS"
      headline="센터를 옮겨도 내 회원의 신뢰를 이어가는 트레이너 소개 페이지"
      problem="회원 후기를 다시 0부터 쌓을 필요가 없습니다."
      summary="센터 변경, 출장 PT, 개인 PT 전환처럼 일하는 곳이 달라져도 고객의 신뢰는 이어져야 합니다. Re:cord는 회원 후기와 직접 받은 후기를 정리해 트레이너 이름으로 남는 소개 페이지를 만듭니다."
      bullets={[
        "센터 이동 전 후기 아카이브",
        "회원 상담 전에 보여줄 한 페이지",
        "직접 후기 요청으로 미래 자산 축적",
      ]}
      evidenceLabel="왜 PT에도 바로 맞나"
      evidenceText="PT는 고객이 사람을 따라 움직이고, 후기와 전환율의 상관관계가 큽니다. 센터 브랜드보다 트레이너 개인 신뢰가 중요한 구조라 Re:cord와 결이 맞습니다."
      audienceExamples={[
        "센터를 옮기는 트레이너",
        "개인 PT 시작 전 고객 신뢰를 모아둘 사람",
        "카톡·인스타로 상담을 받는 트레이너",
      ]}
      requestAudience="PT 트레이너"
      requestPlatform="네이버"
      requestSource="pt-landing"
    />
  )
}
