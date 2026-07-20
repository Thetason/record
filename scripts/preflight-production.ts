import { spawnSync } from 'child_process'
import { buildLaunchReadiness } from '../lib/launch-readiness'
import { scanTrackedSecrets } from './check-tracked-secrets'

function checkDatabaseReachable() {
  const result = spawnSync(
    'npx',
    ['prisma', 'db', 'execute', '--schema=prisma/schema.prisma', '--stdin'],
    {
      input: 'SELECT 1;',
      encoding: 'utf8',
      env: process.env,
    }
  )

  if (result.status === 0) {
    return {
      databaseReachable: true,
      databaseError: null as string | null,
    }
  }

  const output = [result.stderr, result.stdout]
    .filter(Boolean)
    .join('\n')
    .trim()

  return {
    databaseReachable: false,
    databaseError: output || `prisma db execute failed with exit code ${result.status ?? 'unknown'}`,
  }
}

async function main() {
  const { databaseReachable, databaseError } = checkDatabaseReachable()

  const report = buildLaunchReadiness({
    databaseReachable,
    databaseError
  })

  const trackedSecretFindings = scanTrackedSecrets()

  console.log(
    JSON.stringify(
      {
        ...report,
        repoSecrets: {
          status: trackedSecretFindings.length > 0 ? 'error' : 'ok',
          findings: trackedSecretFindings,
        },
      },
      null,
      2
    )
  )

  if (report.overallStatus === 'error' || trackedSecretFindings.length > 0) {
    process.exit(1)
  }
}

main().catch(async (error) => {
  console.error('preflight failed:', error)
  process.exit(1)
})
