# Record Comprehensive Development Plan (2026-03-07)

## Requirements Summary
- Keep existing working functionality intact while repositioning Record from review manager to portable trust page.
- Turn current OCR + profile + share + request-review pieces into one coherent product flow.
- Deliver a 1-week shippable sprint that visibly changes user perception.
- Define a realistic 12-month roadmap without assuming network/discovery effects exist yet.

## Product Definition
- Current category: review management / OCR-assisted review portfolio.
- Target category: portable trust page for independent professionals.
- Long-term category: trust graph / discovery layer for professionals.

## Core Principles
1. Do not break working ingestion, dashboard, share, and public profile flows.
2. Tighten the wedge before broadening the market.
3. OCR is plumbing, not the company.
4. Native proof matters more than imported proof over time.
5. Public profile must become a conversion surface, not only a gallery.

## Decision Drivers
1. Clearer product positioning
2. Stronger trust semantics
3. Faster time-to-value for users in “move / independence / reboot” moments

## Viable Options
- Option A: Continue broad freelancer review SaaS positioning
  - Pros: keep current copy and audience breadth
  - Cons: weak wedge, weak memorability, competes in crowded category
- Option B: Reposition around hair stylists first, then PT
  - Pros: strongest wedge, founder insight, highest “reputation reset” pain
  - Cons: narrows headline audience in the short term

## Decision
- Choose Option B.

## Acceptance Criteria
- Landing page clearly communicates one wedge segment and one core promise.
- Public profile supports real trust + action flow (at least inquiry and booking/contact CTA).
- Imported reviews and Record-native reviews are visually and semantically distinct.
- OCR pipeline has platform-priority improvement plan with measurable accuracy tracking.
- Pricing/limits/verification semantics are internally consistent.
- Security/privacy issues that can damage trust are addressed before growth work.

## Current Codebase Assets To Preserve
- OCR ingestion pipeline: `app/api/ocr/route.ts`
- Bulk review upload UI: `app/dashboard/bulk-upload/page.tsx`
- Review management UI: `app/dashboard/reviews/page.tsx`
- Public profile renderer: `app/[username]/ProfileClient.tsx`
- Share/embed tools: `app/dashboard/share/page.tsx`
- Native review request flow: `app/[username]/review-request/ReviewRequestForm.tsx`, `app/api/public/reviews/[username]/route.ts`
- Pricing/billing skeleton: `app/pricing/page.tsx`, `lib/plan-limits.ts`

## Preserve / Modify / Add / Remove

### Preserve
- OCR import as the “legacy proof import” engine
- Review dashboard as the operating console
- Share/embed page as a distribution tool
- Review-request flow as future-owned proof collection
- Public profile route shape and public username URL

### Modify
- Landing positioning and demo profile story
- Public profile information architecture
- Verification semantics and badges
- Pricing consistency and limit enforcement
- Guide copy to match reality

### Add
- Reboot Pack onboarding
- Public profile CTAs (booking, inquiry, review request)
- Proof source labels and confidence states
- OCR confidence + duplicate handling
- Better analytics around share -> visit -> inquiry

### Remove / De-emphasize
- Broad multi-segment headline targeting
- Vague “team / advanced conversion” claims before product reality exists
- Decorative verification signals that are not defensible

## Phase 0: Stabilization (P0)

### Goals
- Remove trust-breaking inconsistencies before strategic redesign.

### Tasks
1. Unify free plan review limits and plan enforcement
   - Files:
     - `lib/plan-limits.ts`
     - `app/api/auth/signup/route.ts`
     - `prisma/schema.prisma`
     - `app/pricing/page.tsx`
2. Fix schema/API drift in report flows
   - Files:
     - `app/api/reviews/[id]/report/route.ts`
     - `prisma/schema.prisma`
3. Restrict sensitive review detail access
   - Files:
     - `app/api/reviews/[id]/route.ts`
4. Remove or redesign misleading verification presentation
   - Files:
     - `app/[username]/ProfileClient.tsx`
5. Make guide / marketing copy match implemented capabilities
   - Files:
     - `app/guide/page.tsx`
     - `app/pricing/page.tsx`
     - `app/HomePageClient.tsx`

### Verification
- Signup -> dashboard -> add review -> publish -> public profile -> share must still work.
- Free/premium/pro behavior must match plan definitions everywhere.

## Phase 1: Category Repositioning (Week 1 Core)

### Goal
- Make Record look and feel like “your reputation moves with you.”

### Tasks
1. Narrow landing to `hair stylist` wedge
   - Replace rotating wide audience language with hair-first message
   - Update live demo profile story to match wedge
   - Files:
     - `app/HomePageClient.tsx`
     - `app/page.tsx`
2. Rewrite value prop around reboot moment
   - “move shops”, “go independent”, “start over without losing trust”
   - Files:
     - `app/HomePageClient.tsx`
     - `app/guide/page.tsx`
     - `app/pricing/page.tsx`
3. Add wedge-specific proof examples
   - Before/after state, move announcement, trust page examples
   - Files:
     - `app/HomePageClient.tsx`

### Acceptance Criteria
- A hair stylist landing on `/` understands the product in under 5 seconds.
- Landing headline and CTA align with public profile and dashboard experience.

## Phase 2: Trust Page Upgrade

### Goal
- Turn `/{username}` from review wall into trust page.

### Tasks
1. Add primary CTAs above the fold
   - Booking / inquiry / Instagram / leave a review
   - Files:
     - `app/[username]/ProfileClient.tsx`
2. Add trust summary block
   - “why customers choose this professional”
   - sourced from specialties + review themes + proof labels
   - Files:
     - `app/[username]/ProfileClient.tsx`
     - `lib/profile.ts`
3. Separate imported proof vs Record-native proof
   - Imported = archived proof
   - Record = directly collected proof
   - Files:
     - `lib/profile.ts`
     - `app/[username]/ProfileClient.tsx`
4. Add featured reviews / pinned trust proof
   - Either with manual pinned IDs or first simple featured toggle
   - Files:
     - `prisma/schema.prisma`
     - `app/dashboard/reviews/page.tsx`
     - `app/api/reviews/[id]/route.ts`
     - `app/[username]/ProfileClient.tsx`

### Acceptance Criteria
- Public profile includes at least two action CTAs.
- Visitor can distinguish “archived external proof” from “directly collected proof.”
- Owner can feature top reviews.

## Phase 3: Reboot Pack

### Goal
- Create a signature flow for move / independence moments.

### Tasks
1. New onboarding entrypoint
   - “샵을 옮겼나요?” / “독립을 시작했나요?”
   - Files:
     - `app/dashboard/page.tsx`
     - new route: `app/dashboard/reboot/page.tsx`
2. Guided import flow
   - upload screenshots -> OCR -> review -> publish trust page
   - reuse bulk upload pipeline instead of rebuilding
   - Files:
     - `app/dashboard/bulk-upload/page.tsx`
     - `app/dashboard/reboot/page.tsx`
3. Generate distribution assets
   - move announcement card
   - profile link card
   - review request link
   - Files:
     - `app/dashboard/share/page.tsx`
     - potential helper in `lib/`

### Acceptance Criteria
- User can complete the reboot flow in less than 10 minutes.
- Flow ends with: public page, share assets, review request link.

## Phase 4: OCR Precision Upgrade

### Goal
- Improve OCR where it matters most for launch credibility.

### Strategy
- Do not replace engine first.
- Improve pipeline in this order:
  1. platform detection
  2. review-card boundary detection
  3. platform-specific parsing
  4. field-level confidence
  5. duplicate detection
  6. better correction UX

### Tasks
1. Build evaluation dataset for top platforms
   - Naver first
   - Kakao second
   - Danggeun third
   - Store fixtures under a controlled local test corpus
2. Add platform-priority parser modules
   - Files:
     - `app/api/ocr/route.ts`
     - new parser helpers in `lib/ocr/`
3. Add field confidence to OCR response
   - platform, author, date, content, business
4. Add duplicate candidate detection in bulk upload
   - Files:
     - `app/dashboard/bulk-upload/page.tsx`
     - `app/api/reviews/bulk/route.ts`
5. Add OCR quality telemetry
   - mismatch, retry, manual edit counts

### Acceptance Criteria
- Naver screenshots show visibly better extraction than current baseline.
- Low-confidence fields are surfaced to user for correction.
- Duplicate reviews are flagged before save.

## Phase 5: Native Proof Flywheel

### Goal
- Shift future value from imported screenshots to owned proof.

### Tasks
1. Elevate review-request flow in dashboard and share page
2. Add service-specific prompts for hair/PT
3. Add moderation queue clarity
4. Add “approved direct review” labels on public profile

### Files
- `app/[username]/review-request/ReviewRequestForm.tsx`
- `app/api/public/reviews/[username]/route.ts`
- `app/dashboard/reviews/page.tsx`
- `app/dashboard/share/page.tsx`
- `app/[username]/ProfileClient.tsx`

## 1-Week Sprint Plan

### Day 1
- P0 trust fixes
- plan limit consistency
- report route/schema mismatch
- review detail access control

### Day 2
- Hair-first landing rewrite
- demo profile rewrite
- guide copy cleanup

### Day 3
- Public profile CTA layer
- trust summary block
- remove misleading verified hero signal

### Day 4
- Imported proof vs Record-native proof separation
- featured review support

### Day 5
- Reboot Pack MVP
- dashboard entrypoint + guided share/review-request finish

### Day 6
- OCR priority improvements: platform detection + duplicate warning + confidence surfacing

### Day 7
- QA + deployment + pilot data setup

## 30 / 60 / 90 Day Plan

### 30 Days
- Finish week-1 sprint
- onboard 5-10 hair stylists manually
- refine copy from real usage
- improve Naver OCR accuracy

### 60 Days
- PT segment support
- booking/contact analytics
- mobile upload improvements
- better proof moderation

### 90 Days
- career timeline model
- proof snapshot/history model
- service-specific profile layouts
- first “find a pro” internal beta experiments

## 12-Month Roadmap

### Months 1-3
- Hair wedge
- Trust page v1
- Reboot Pack
- Native proof collection
- OCR precision for top 2 platforms
- analytics for page visit -> inquiry

### Months 4-6
- PT expansion
- timeline / movement history
- proof source taxonomy
- better embed widgets
- team-lite for academies/studios

### Months 7-9
- discovery beta
- AI trust summaries
- service/category search pages
- lead routing experiments

### Months 10-12
- recommendation system
- verified reputation graph primitives
- partner / studio / academy workflows
- transaction / lead monetization experiments

## Metrics
- Activation: signup -> first public trust page within 7 days
- Time to value: minutes from signup to shareable page
- Proof growth: native direct reviews per active user per month
- Conversion: public profile visit -> inquiry / booking click
- Retention: percent of users adding new proof in 30 days
- Migration success: users who complete reboot flow and publish

## Risks and Mitigations
- Risk: break stable core flows
  - Mitigation: no destructive rewrites; reuse existing routes and UI surfaces
- Risk: promise exceeds product reality
  - Mitigation: update copy first; add only defensible trust signals
- Risk: OCR work consumes the whole sprint
  - Mitigation: platform-priority scope, not generic perfection
- Risk: wedge feels too narrow
  - Mitigation: narrow messaging, not architecture; keep generic backend where possible

## ADR
- Decision: Reposition Record around portable trust for hair-first professionals while preserving current architecture.
- Drivers: stronger wedge, faster comprehension, higher conversion potential.
- Alternatives considered:
  - stay broad freelancer review manager
  - jump early into marketplace/discovery
- Why chosen:
  - broad positioning is weak
  - marketplace is premature without trusted supply and proof semantics
- Consequences:
  - clearer message
  - some current copy/design must be revised
  - week-1 work focuses on strategy fit, not feature sprawl
- Follow-ups:
  - implement timeline/history schema
  - build OCR benchmark set
  - introduce trust-safe analytics and proof semantics

## Verification Steps
1. Manual smoke test:
   - signup
   - profile setup
   - OCR upload
   - review publish
   - review request submit
   - public page share
2. Check public page messaging with 3 target users
3. Measure time-to-public-page for a new account
4. Compare OCR extraction on a labeled Naver batch before/after
