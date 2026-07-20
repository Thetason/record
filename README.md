# Re:cord - Public Trust Link for Professionals

<div align="center">
  <h1>Re:cord 📝</h1>
  <p><strong>Your reputation should move with you.</strong></p>
  <p>상담 전에 보내는 공개 신뢰 링크를 만드는 전문가용 프로필 제품</p>
</div>

## What Re:cord Is

Re:cord is a product for turning scattered reviews, direct testimonials, portfolio images, and a short introduction into one public profile link that can be sent before consultation.

The current product is not defined by OCR, bulk import, or admin features.
It is defined by whether one link helps a customer quickly understand:

- who this professional is
- why they are credible
- where to inquire or book

## Current Product Truth

If older documents conflict, use these first:

- [START_HERE.md](./START_HERE.md)
- [CURRENT_TRUTH_2026-03-27.md](./CURRENT_TRUTH_2026-03-27.md)
- [FEATURE_KEEP_HIDE_CUT_MATRIX_2026-03-27.md](./FEATURE_KEEP_HIDE_CUT_MATRIX_2026-03-27.md)
- [PROJECT_A_TO_Z_2026-03-27.md](./PROJECT_A_TO_Z_2026-03-27.md)
- [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)
- [DEPLOY_STATUS.md](./DEPLOY_STATUS.md)
- [GLOBAL_LAUNCH_READINESS.md](./GLOBAL_LAUNCH_READINESS.md)

## Core Product Today

- **Public trust profile**: a shareable page with reviews, work images, intro, and CTA
- **Review vault**: collect and organize archived platform reviews and direct reviews
- **Profile editing**: prepare the page people will actually receive before consultation
- **Share flow**: copy link, share to Kakao, use Instagram/Threads profile links, generate QR
- **Direct review request**: gather new testimonials through a public request link

## Supporting, Not Defining, Layers

These still exist in the repo and matter operationally, but they are not the main product identity:

- OCR-assisted screenshot parsing
- CSV bulk upload
- concierge-style migration setup
- advanced customization and legacy expansion pages

## Current Wedge

The current sharpest wedge is `hair stylists`.

Why:

- trust resets are common when moving salons or going independent
- reviews and work images strongly influence consultation conversion
- a shareable link fits the real channels already used today

Other audiences exist in the repo, but the current strategy is still hair-first.

## Tech Stack

- **Frontend**: Next.js 15.5.12, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js App Router + API routes, Prisma ORM
- **Database**: SQLite for local development, PostgreSQL for production
- **Authentication**: NextAuth.js
- **Optional import layer**: Google Cloud Vision API for OCR-assisted parsing
- **Deployment**: Vercel

## Local Setup

### Requirements

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/Thetason/record.git
cd record
npm install
cp .env.example .env.local
npm run db:push:dev
npm run seed:demo:dev
npm run dev
```

Notes:

- `npm run dev` regenerates the Prisma dev client from `prisma/schema.dev.prisma`
- local development uses `prisma/dev.db`
- production build/runtime uses `prisma/schema.prisma`

## Environment

Minimum local environment:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Optional:

```env
# OCR
GOOGLE_VISION_API_KEY="your-api-key"
ENABLE_OCR="true"

# Email
ENABLE_EMAIL="false"
```

For production readiness, use:

- [GLOBAL_LAUNCH_READINESS.md](./GLOBAL_LAUNCH_READINESS.md)
- [PRODUCTION_OPERATOR_CHECKLIST.md](./PRODUCTION_OPERATOR_CHECKLIST.md)

## Verification

```bash
# lint + build + typecheck + OCR fixtures
npm run verify

# boot a local app and verify the main public/authenticated flows
npm run smoke:local

# scan tracked files for secrets
npm run secrets:check
```

## Main Routes

- `/` - landing page
- `/signup` - sign up
- `/login` - login
- `/dashboard` - main workspace
- `/dashboard/profile` - profile editing and preview
- `/dashboard/reviews` - review vault and direct-review moderation
- `/dashboard/share` - sharing workspace
- `/[username]` - public trust profile
- `/[username]/review-request` - direct review request page
- `/pricing` - plan selection and checkout
- `/migration-request` - beta concierge onboarding

## Import and Onboarding

- OCR and bulk import are available as supporting workflows
- CSV is the only structured bulk file format currently supported
- the current core onboarding path is still:
  1. create a profile
  2. choose representative reviews
  3. add work images and CTA
  4. share the link

## Deployment

Vercel deployment is supported, but passing CI is not the same as being production-ready.
Before launch, follow the production readiness docs and run the production preflight checks.

## License

This project is private software. Unauthorized copying and distribution are prohibited.

## Contact

- Email: support@record.kr
- Website: https://www.recordyours.com
