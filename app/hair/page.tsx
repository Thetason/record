import type { Metadata } from "next"

import { TargetAudienceLanding } from "@/components/landing/TargetAudienceLanding"

export const metadata: Metadata = {
  title: "Re:cord for Hair Stylists",
  description: "샵을 옮겨도 새 고객이 먼저 믿는 헤어디자이너 소개 페이지를 만드는 방법.",
}

export default function HairLandingPage() {
  return (
    <TargetAudienceLanding
      eyebrow="FOR HAIR STYLISTS"
      headline="샵을 옮겨도 새 고객이 먼저 믿는 헤어디자이너 소개 페이지"
      problem="전 샵 네이버 후기를 남겨둔 채 다시 0부터 설명하지 마세요."
      summary="헤어디자이너는 샵보다 사람을 따라 움직이는 고객이 많습니다. Re:cord는 이전 샵에 남겨진 후기와 대표 작업을 정리해, 처음 보는 고객도 강점과 작업을 빠르게 이해할 수 있는 소개 페이지를 만듭니다."
      bullets={[
        "대표 후기와 작업을 먼저 정리",
        "내 이름으로 소개 페이지 발행",
        "샵 이동 공지 전에 바로 공유",
      ]}
      evidenceLabel="왜 헤어디자이너에게 특히 잘 맞나"
      evidenceText="샵 이동, 1인샵 오픈, 원장 전환처럼 평판이 가장 쉽게 초기화되고, 고객이 샵보다 사람을 따라 움직이는 직군이기 때문입니다."
      audienceExamples={[
        "지점 이동 직전 디자이너",
        "1인샵 준비 디자이너",
        "인스타 하이라이트로만 후기 보여주던 디자이너",
      ]}
      requestAudience="헤어디자이너"
      requestPlatform="네이버"
      requestSource="hair-landing"
    />
  )
}
