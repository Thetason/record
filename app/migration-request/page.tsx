import { MigrationRequestClient } from './MigrationRequestClient'

interface MigrationRequestPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function MigrationRequestPage({ searchParams }: MigrationRequestPageProps) {
  const params = (await searchParams) || {}

  const getSingle = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
      return value[0]
    }

    return value
  }

  return (
    <MigrationRequestClient
      initialAudience={getSingle(params.audience)}
      initialPlatform={getSingle(params.platform)}
      initialMethod={getSingle(params.method)}
      initialSource={getSingle(params.from)}
    />
  )
}
