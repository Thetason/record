# Re:cord DESIGN.md

Re:cord is a mobile-first trust portfolio for freelancers.

This file exists so product screens do not drift between "marketing mockup" and "actual product UI".
Home hero, live demo, public profile, dashboard preview, and share flow must feel like the same product.

## Product Definition

- Re:cord is not a review archive.
- Re:cord is not a generic link hub.
- Re:cord is a trust portfolio that gets sent before a consultation.
- A visitor should understand `who this person is`, `why they are trustworthy`, and `how to contact them` within a few seconds.

## Core UX Promise

- Home hero = compressed trust card
- Live demo = expanded review view
- Career tree = expanded credibility view
- Public profile = real product version of both

If the home promises a mobile profile, the actual public profile must match that promise closely.

## Design Principles

1. Mobile first
- Design the mobile experience first, then scale up to desktop.
- Mobile is the default product surface for the sender and the receiver.

2. Trust before detail
- Show identity, proof, and action before long explanations.
- The user should not need to scroll far to feel confidence.

3. One visual language
- Rounded cards, soft shadows, restrained borders, and a consistent chip/button system.
- Avoid mixing "mockup aesthetic" and "full webpage aesthetic" in a way that looks like two different products.

4. Compression matters
- Mobile screens should feel dense but breathable.
- Avoid giant empty boxes, oversized cards, and unnecessary vertical padding.

5. Proof is visible
- Review source, captured proof, total review count, and portfolio evidence should feel real.
- Never make the product look like a made-up testimonial wall.

## Visual System

### Color

- Primary accent: `#FF6B35`
- Dark text: `#111827`
- Soft surface: `#FAF8F6`
- White card: `#FFFFFF`
- Hero/profile primary deep ink: near `#1F1722`
- Review proof accent chips should stay muted, not neon

### Radius

- Main card radius: `24px`
- Inner card radius: `18px`
- Chip radius: full pill
- Phone frame radius should remain large and smooth

### Shadows

- Use soft elevation, never heavy enterprise shadows.
- Cards should feel tactile, not floating excessively.

### Typography

- Headline: sharp, short, high-contrast
- Section title: clear and direct
- Supporting copy: calm, readable, not verbose
- Mobile card copy should almost always fit in 2 to 4 lines

## Content Hierarchy

Every public-facing trust profile should prioritize this order:

1. Identity
- Name
- Profession
- Experience
- Location or context

2. Trust proof
- Featured review
- Review source
- Proof badge
- Total review count

3. Depth
- Portfolio images
- Career tree
- Additional reviews

4. Action
- Consultation link
- Contact action
- Share action

## Mobile Rules

### Hero

- The mobile hero must show the phone mockup early.
- Audience chips must fit in one row when possible.
- Copy should not push the real product image too far below the fold.

### Phone Mockup

- It must look like a believable mobile product, not a tiny webpage squeezed into a phone frame.
- Avoid stacking too many tall modules.
- If a lower module becomes hidden, compress the upper modules first.

### Bento Actions

- Bottom action cards must fully appear inside the phone frame.
- They should feel tappable, not cramped.
- Keep them visually balanced and horizontally aligned.

### Live Demo

- On mobile, show 5 reviews first, then expand.
- The first view must be digestible.
- The expanded state must still feel like the same product language as the hero card.

### Career Tree

- Career entries should read like a mobile timeline, not a corporate resume.
- Each step must be scannable:
  - period
  - title
  - one clear description

## Component Rules

### Audience Chips

- Keep to 3 primary groups max on the landing page.
- Prefer one-row layout on mobile if feasible.
- Avoid wrapping into awkward pyramids.

### Review Card

- Show:
  - platform/source
  - proof chip
  - excerpt
  - optional screenshot thumbnail
  - current slide / total count

- The review should feel readable even in the compressed hero version.
- Review screenshot thumbnails must support the "this is real" feeling, not decorative clutter.

### Portfolio & Career Card

- This card is not secondary fluff.
- It is one of the two main proof systems with reviews.
- The label should stay short.
- Thumbnails should be large enough to feel intentional.

### Contact

- Contact is important, but not louder than trust proof.
- In the public profile flow:
  - review first
  - career/portfolio second
  - contact third

## Copy Rules

- Prefer outcome over feature
- Prefer proof over claim
- Prefer short over clever
- Prefer send/share language over storage/archive language

### Good examples

- `링크 하나로, 바로 믿게 하세요`
- `각 플랫폼에 흩어진 리뷰를 한 곳에 모아`
- `바로 보이는 신뢰`
- `바로 이어지는 문의`
- `내 리뷰는 나의 자산`

### Avoid

- Generic SaaS language
- Feature inventory language
- Over-explaining what should be obvious from the UI
- Mockup-only wording that the real product cannot fulfill

## What We Borrow From External References

### From TypeUI

- Strong, reusable design tokens
- Clear style consistency across generated UI
- Picking a visual system and sticking to it

### From getdesign.md

- Concrete, explicit design guidance beats screenshot imitation
- Use written design rules so AI and humans build consistently
- Capture spacing, card patterns, and token rules in the repo

## Re:cord Non-Negotiables

- Public profile must feel believable on mobile
- Home promise and product reality must match
- Reviews and career proof are the two core trust engines
- The product must feel ready to send in KakaoTalk, Instagram, Threads, and DMs

## Current Working Model

- Hero phone = compressed trust card
- Live demo = full review proof
- Career tree = full credibility proof
- Public profile = actual sendable trust portfolio

