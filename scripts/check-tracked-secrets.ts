import { execFileSync } from "child_process"
import { existsSync, readFileSync, statSync } from "fs"
import path from "path"

type SecretFinding = {
  path: string
  reason: string
}

const IGNORED_ENV_FILES = new Set([
  ".env.example",
  ".env.sample",
  ".env.template",
])

function listTrackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: process.cwd(),
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
}

function looksSensitiveByPath(filePath: string) {
  const baseName = path.basename(filePath)
  const normalized = filePath.toLowerCase()

  if (baseName.startsWith(".env") && !IGNORED_ENV_FILES.has(baseName)) {
    return "tracked env file"
  }

  if (
    /\.(pem|p12|pfx|key|der|crt|cer)$/i.test(baseName) ||
    /(^|\/)id_(rsa|ed25519)(\.pub)?$/i.test(normalized)
  ) {
    return "tracked key/certificate file"
  }

  if (
    /\.json$/i.test(baseName) &&
    /(service-account|service_account|firebase-admin|google-credentials|vision-credentials|gcp-key)/i.test(baseName)
  ) {
    return "tracked service credential JSON"
  }

  return null
}

function looksSensitiveByContent(filePath: string) {
  if (!existsSync(filePath)) {
    return null
  }

  const stats = statSync(filePath)
  if (stats.size > 512 * 1024) {
    return null
  }

  const content = readFileSync(filePath, "utf8")

  if (/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(content)) {
    return "private key material inside tracked file"
  }

  return null
}

export function scanTrackedSecrets() {
  const findings: SecretFinding[] = []
  const trackedFiles = listTrackedFiles()

  for (const trackedPath of trackedFiles) {
    const pathFinding = looksSensitiveByPath(trackedPath)
    if (pathFinding) {
      findings.push({
        path: trackedPath,
        reason: pathFinding,
      })
      continue
    }

    const contentFinding = looksSensitiveByContent(path.join(process.cwd(), trackedPath))
    if (contentFinding) {
      findings.push({
        path: trackedPath,
        reason: contentFinding,
      })
    }
  }

  return findings
}

function main() {
  const findings = scanTrackedSecrets()

  if (findings.length > 0) {
    console.error(
      JSON.stringify(
        {
          status: "error",
          findings,
        },
        null,
        2
      )
    )
    process.exit(1)
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        findings: [],
      },
      null,
      2
    )
  )
}

if (require.main === module) {
  main()
}
