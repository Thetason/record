'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { PublicProfile } from '@/lib/profile'
import type { LaunchOfferSnapshot } from '@/lib/launch-offer-config'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustPillars } from '@/components/landing/TrustPillars'
import { AiScanSection } from '@/components/landing/AiScanSection'
import { LiveDemoSection } from '@/components/landing/LiveDemoSection'
import { CareerSection } from '@/components/landing/CareerSection'
import { ShareSection } from '@/components/landing/ShareSection'
import { SetupSection } from '@/components/landing/SetupSection'
import type { ShowcaseAudienceKey } from '@/components/landing/content'

interface HomePageClientProps {
  showcaseProfiles: Record<ShowcaseAudienceKey, PublicProfile>
  launchOffer: LaunchOfferSnapshot
}

export default function HomePageClient({ showcaseProfiles, launchOffer }: HomePageClientProps) {
  const { data: session, status } = useSession()
  const [activeAudience, setActiveAudience] = useState<ShowcaseAudienceKey>('vocal')
  const [expandedPreviewImage, setExpandedPreviewImage] = useState<string | null>(null)

  // Hydration heartbeat: while this attribute is absent, a CSS safety net in
  // globals.css force-reveals framer's opacity:0 enter states (JS-dead pages
  // must never be blank). Once set, framer owns all reveal animations.
  useEffect(() => {
    document.documentElement.setAttribute('data-ld-js', '1')
    return () => document.documentElement.removeAttribute('data-ld-js')
  }, [])

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const pickAudience = (key: ShowcaseAudienceKey) => {
    setActiveAudience(key)
    jumpTo('live-demo')
  }

  return (
    <main className="min-h-screen bg-white">
      <LandingNav session={session} status={status} onJumpTo={jumpTo} />

      <HeroSection
        profile={showcaseProfiles.vocal}
        launchOffer={launchOffer}
        isLoggedIn={Boolean(session)}
        onJumpTo={jumpTo}
        onPickAudience={pickAudience}
      />

      <TrustPillars />

      <AiScanSection ocrImportLimit={launchOffer.ocrImportLimit} />

      <LiveDemoSection
        profiles={showcaseProfiles}
        activeAudience={activeAudience}
        onAudienceChange={setActiveAudience}
        onExpandImage={setExpandedPreviewImage}
      />

      <CareerSection profile={showcaseProfiles[activeAudience]} activeAudience={activeAudience} />

      <ShareSection profile={showcaseProfiles.vocal} />

      <SetupSection launchOffer={launchOffer} isLoggedIn={Boolean(session)} />

      <Dialog open={Boolean(expandedPreviewImage)} onOpenChange={(open) => !open && setExpandedPreviewImage(null)}>
        <DialogContent className="max-w-3xl border-gray-100 bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#191f28]">이미지 확대 보기</DialogTitle>
          </DialogHeader>
          {expandedPreviewImage && (
            <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-[#f8f9fa] p-4">
              <div className="relative h-[26rem] w-full">
                <Image
                  src={expandedPreviewImage}
                  alt="확대 이미지"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 48rem"
                  unoptimized
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
