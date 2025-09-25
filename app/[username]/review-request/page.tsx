import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReviewRequestForm } from './ReviewRequestForm'

type PageProps = {
  params: {
    username: string
  }
}

export const dynamic = 'force-dynamic'

export default async function ReviewRequestPage({ params }: PageProps) {
  const username = decodeURIComponent(params.username)

  if (!username) {
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      isPublic: true
    }
  })

  if (!user || user.isPublic === false) {
    notFound()
  }

  return (
    <ReviewRequestForm
      username={username}
      name={user.name}
      bio={user.bio}
      avatar={user.avatar}
    />
  )
}
