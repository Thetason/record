// OCR API smoke test
// Usage:
//   OCR_TEST_COOKIE="next-auth.session-token=..." node test-ocr.js
//   OCR_TEST_URL="http://localhost:3000" OCR_TEST_PLATFORM="프립" OCR_TEST_COOKIE="..." node test-ocr.js

const TEST_URL = process.env.OCR_TEST_URL || 'http://localhost:3000'
const TEST_COOKIE = process.env.OCR_TEST_COOKIE || ''
const TEST_PLATFORM = process.env.OCR_TEST_PLATFORM || '네이버'

const testImageBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

function createTestBlob(base64Data) {
  const base64 = base64Data.split(',')[1]
  const buffer = Buffer.from(base64, 'base64')
  return new Blob([buffer], { type: 'image/png' })
}

function validateOCRResponse(response) {
  const data = response?.data || {}
  const fieldConfidence = data?.fieldConfidence || {}

  return [
    {
      test: '응답 객체',
      pass: typeof response === 'object' && response !== null,
      message: typeof response === 'object' && response !== null ? 'JSON 응답 수신' : 'JSON 응답 아님',
    },
    {
      test: 'success=true',
      pass: response?.success === true,
      message: `success=${String(response?.success)}`,
    },
    {
      test: 'data 존재',
      pass: typeof data === 'object' && data !== null,
      message: data ? 'data 존재' : 'data 누락',
    },
    {
      test: 'reviewText 존재',
      pass: typeof data.reviewText === 'string',
      message: typeof data.reviewText === 'string'
        ? `reviewText length=${data.reviewText.length}`
        : 'reviewText 누락',
    },
    {
      test: 'platform 존재',
      pass: typeof data.platform === 'string',
      message: typeof data.platform === 'string' ? `platform=${data.platform}` : 'platform 누락',
    },
    {
      test: 'fieldConfidence 구조',
      pass:
        typeof fieldConfidence.platform === 'number' &&
        typeof fieldConfidence.business === 'number' &&
        typeof fieldConfidence.author === 'number' &&
        typeof fieldConfidence.reviewDate === 'number' &&
        typeof fieldConfidence.content === 'number',
      message: `fieldConfidence=${JSON.stringify(fieldConfidence)}`,
    },
    {
      test: 'overall confidence',
      pass: typeof data.confidence === 'number',
      message: typeof data.confidence === 'number' ? `confidence=${data.confidence}` : 'confidence 누락',
    },
  ]
}

async function main() {
  if (!TEST_COOKIE) {
    console.error('❌ OCR_TEST_COOKIE 환경 변수가 필요합니다.')
    console.error('예: OCR_TEST_COOKIE=\"next-auth.session-token=...\" node test-ocr.js')
    process.exit(1)
  }

  console.log('🧪 OCR smoke test 시작')
  console.log(`📍 URL: ${TEST_URL}`)
  console.log(`🏷️ 플랫폼: ${TEST_PLATFORM}`)

  const formData = new FormData()
  formData.append('image', createTestBlob(testImageBase64), 'test-image.png')
  formData.append('platform', TEST_PLATFORM)
  formData.append('version', 'v2')

  const response = await fetch(`${TEST_URL}/api/ocr`, {
    method: 'POST',
    body: formData,
    headers: {
      Cookie: TEST_COOKIE,
    },
  })

  const body = await response.json().catch(async () => ({ raw: await response.text() }))

  console.log(`📨 status=${response.status}`)
  console.log(JSON.stringify(body, null, 2))

  const results = validateOCRResponse(body)
  console.log('\n🔎 검증')
  for (const result of results) {
    console.log(`${result.pass ? '✅' : '❌'} ${result.test}: ${result.message}`)
  }

  const failed = results.filter((item) => !item.pass)
  if (failed.length > 0 || !response.ok) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ test-ocr 실패:', error)
  process.exit(1)
})
