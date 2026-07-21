import { PrismaClient } from './prisma-client'

// One-off cleanup: remove the disposable QA account used for the live
// AI-import verification (2026-07-22). Scoped to the exact username+email
// pair so it can never touch a real user.
//
// Dry run:  sh scripts/prod-run.sh delete-qa-user.ts
// Apply:    sh scripts/prod-run.sh --confirm delete-qa-user.ts

const prisma = new PrismaClient()
const CONFIRM = process.env.AVATAR_FIX_CONFIRM === 'YES'

const QA_USERNAME = 'qa-vision-check'
const QA_EMAIL = 'qa-vision-check@record-internal.test'

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: QA_USERNAME },
    select: { id: true, username: true, email: true, _count: { select: { reviews: true } } }
  })

  if (!user) {
    console.log(`QA user "${QA_USERNAME}" not found — nothing to do.`)
    return
  }
  if (user.email !== QA_EMAIL) {
    console.error(`username matches but email is ${user.email} (expected ${QA_EMAIL}) — aborting.`)
    process.exitCode = 1
    return
  }

  console.log(`found QA user: ${user.username} <${user.email}> reviews=${user._count.reviews}`)
  if (!CONFIRM) {
    console.log('dry run. 적용하려면: sh scripts/prod-run.sh --confirm delete-qa-user.ts')
    return
  }

  await prisma.$transaction([
    prisma.review.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } })
  ])
  console.log('✓ QA user deleted (reviews + account)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
