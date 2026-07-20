import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import '../app/api/ocr/route'

const globalForOcrFixtures = globalThis as typeof globalThis & {
  __recordOcrTestables?: {
    analyzeReviewText: (input: string) => {
      platform?: string
      author?: string
      business?: string
      date?: string
      reviewText?: string
    }
    analyzeReviewTextV2: (
      input: unknown,
      retryMode?: boolean,
      forcedPlatform?: string
    ) => {
      platform?: string
      author?: string
      business?: string
      date?: string
      reviewText?: string
    }
    shouldSkipMarketplaceNoise: (text: string, platform: string) => boolean
  }
}

function getOcrTestables() {
  const ocrTestables = globalForOcrFixtures.__recordOcrTestables
  if (!ocrTestables) {
    throw new Error('OCR testables were not registered on globalThis')
  }
  return ocrTestables
}

type TextFixture = {
  name: string
  kind: 'text'
  parser: 'analyzeReviewText'
  input: string
  expected: {
    platform?: string
    author?: string
    business?: string
    date?: string
    reviewTextIncludes?: string[]
    reviewTextExcludes?: string[]
  }
}

type VisionFixture = {
  name: string
  kind: 'vision'
  parser: 'analyzeReviewTextV2'
  forcedPlatform?: string
  retryMode?: boolean
  input: unknown
  expected: {
    platform?: string
    author?: string
    business?: string
    date?: string
    reviewTextIncludes?: string[]
    reviewTextExcludes?: string[]
  }
}

type NoiseFixture = {
  name: string
  kind: 'noise'
  input: {
    platform: string
    text: string
  }
  expected: boolean
}

type Fixture = TextFixture | VisionFixture | NoiseFixture

function loadFixtures(): Fixture[] {
  const dir = path.join(process.cwd(), 'fixtures', 'ocr')
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Fixture)
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertExpectedFields(
  actual: { platform?: string; author?: string; business?: string; date?: string; reviewText?: string },
  expected: TextFixture['expected'] | VisionFixture['expected'],
  fixtureName: string
) {
  if (expected.platform !== undefined) {
    assert(actual.platform === expected.platform, `${fixtureName}: platform expected ${expected.platform}, got ${actual.platform}`)
  }
  if (expected.author !== undefined) {
    assert(actual.author === expected.author, `${fixtureName}: author expected ${expected.author}, got ${actual.author}`)
  }
  if (expected.business !== undefined) {
    assert(actual.business === expected.business, `${fixtureName}: business expected ${expected.business}, got ${actual.business}`)
  }
  if (expected.date !== undefined) {
    assert(actual.date === expected.date, `${fixtureName}: date expected ${expected.date}, got ${actual.date}`)
  }

  const reviewText = actual.reviewText || ''
  for (const snippet of expected.reviewTextIncludes || []) {
    assert(reviewText.includes(snippet), `${fixtureName}: reviewText should include "${snippet}"`)
  }
  for (const snippet of expected.reviewTextExcludes || []) {
    assert(!reviewText.includes(snippet), `${fixtureName}: reviewText should exclude "${snippet}"`)
  }
}

async function main() {
  const fixtures = loadFixtures()
  const failures: string[] = []
  const fixtureDebug = process.env.OCR_FIXTURE_DEBUG === 'true'
  const originalLog = console.log
  const ocrTestables = getOcrTestables()

  for (const fixture of fixtures) {
    try {
      if (!fixtureDebug) {
        console.log = () => undefined
      }

      if (fixture.kind === 'text') {
        const actual = ocrTestables.analyzeReviewText(fixture.input)
        assertExpectedFields(actual, fixture.expected, fixture.name)
      } else if (fixture.kind === 'vision') {
        const actual = ocrTestables.analyzeReviewTextV2(
          fixture.input as never,
          fixture.retryMode === true,
          fixture.forcedPlatform || ''
        )
        assertExpectedFields(actual, fixture.expected, fixture.name)
      } else if (fixture.kind === 'noise') {
        const actual = ocrTestables.shouldSkipMarketplaceNoise(
          fixture.input.text,
          fixture.input.platform
        )
        assert(
          actual === fixture.expected,
          `${fixture.name}: expected ${fixture.expected}, got ${actual}`
        )
      }

      console.log = originalLog
      console.log(`PASS ${fixture.name}`)
    } catch (error) {
      console.log = originalLog
      const message = error instanceof Error ? error.message : String(error)
      failures.push(message)
      console.error(`FAIL ${fixture.name}: ${message}`)
    }
  }

  if (failures.length > 0) {
    console.error(`\nOCR fixture failures: ${failures.length}`)
    process.exit(1)
  }

  console.log(`\nOCR fixtures passed: ${fixtures.length}`)
}

main().catch((error) => {
  console.error('OCR fixture runner failed:', error)
  process.exit(1)
})
