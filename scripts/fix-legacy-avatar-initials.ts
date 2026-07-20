import { PrismaClient } from './prisma-client'

// One-off cleanup: older signups stored a name initial (e.g. "테") in the
// avatar column, which crashes next/image wherever the avatar is rendered.
// Nulls out every avatar value that is not a renderable image source.
//
// Usage:
//   DATABASE_URL=... AVATAR_FIX_CONFIRM=YES npx tsx scripts/fix-legacy-avatar-initials.ts
//   (omit AVATAR_FIX_CONFIRM to run as a dry run)

const prisma = new PrismaClient()

function isRenderableImageSrc(value: string): boolean {
  const trimmed = value.trim()
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  )
}

async function main() {
  const users = await prisma.user.findMany({
    where: { avatar: { not: null } },
    select: { id: true, username: true, avatar: true },
  })

  const broken = users.filter((u) => u.avatar && !isRenderableImageSrc(u.avatar))

  console.log(`checked ${users.length} users with avatar values`)
  console.log(`found ${broken.length} non-URL avatar values`)
  for (const u of broken) {
    console.log(`  - ${u.username}: ${JSON.stringify(u.avatar)}`)
  }

  if (broken.length === 0) {
    return
  }

  if (process.env.AVATAR_FIX_CONFIRM !== 'YES') {
    console.log('dry run only. set AVATAR_FIX_CONFIRM=YES to null these values.')
    return
  }

  const result = await prisma.user.updateMany({
    where: { id: { in: broken.map((u) => u.id) } },
    data: { avatar: null },
  })
  console.log(`nulled avatar for ${result.count} users`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
