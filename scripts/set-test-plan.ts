import { PrismaClient } from './prisma-client'

// One-off: lift the review cap on the disposable import-test account so a
// full-scale (hundreds of reviews) performance test isn't truncated at the
// premium 100 limit. Scoped to the exact username+email so it can only ever
// touch the throwaway test account.
//
// Apply: sh scripts/prod-run.sh --confirm set-test-plan.ts

const prisma = new PrismaClient()
const CONFIRM = process.env.AVATAR_FIX_CONFIRM === 'YES'

const TEST_USERNAME = 'rc-import-test'
const TEST_EMAIL = 'rc-import-test@record-internal.test'

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: TEST_USERNAME },
    select: { id: true, username: true, email: true, plan: true, reviewLimit: true },
  })
  if (!user) {
    console.log(`test user "${TEST_USERNAME}" not found`)
    return
  }
  if (user.email !== TEST_EMAIL) {
    console.error(`email mismatch (${user.email}) — aborting`)
    process.exitCode = 1
    return
  }
  console.log(`found: ${user.username} plan=${user.plan} reviewLimit=${user.reviewLimit}`)
  if (!CONFIRM) {
    console.log('dry run. apply: sh scripts/prod-run.sh --confirm set-test-plan.ts')
    return
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { plan: 'pro', reviewLimit: -1 },
  })
  console.log('✓ set plan=pro, reviewLimit=-1 (unlimited)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
