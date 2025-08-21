// OCR 기능 통합 테스트 스크립트
// 사용법: node test-ocr.js

import fs from 'fs'

// 테스트용 Base64 이미지 (1x1 투명 PNG)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

// Mock 파일 객체 생성
function createMockFile(base64Data, filename = 'test-image.png') {
  // Base64에서 데이터 부분만 추출
  const base64 = base64Data.split(',')[1]
  const buffer = Buffer.from(base64, 'base64')
  
  return {
    name: filename,
    type: 'image/png',
    size: buffer.length,
    arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }
}

// OCR API 테스트
async function testOCRAPI() {
  console.log('🧪 OCR 기능 통합 테스트 시작...\n')
  
  try {
    // FormData 생성
    const formData = new FormData()
    const mockFile = createMockFile(testImageBase64)
    formData.append('image', mockFile)

    console.log('📤 OCR API 요청 전송 중...')
    
    // OCR API 호출 (실제 서버가 실행 중이어야 함)
    const response = await fetch('http://localhost:3000/api/ocr', {
      method: 'POST',
      body: formData,
      headers: {
        // 인증 헤더는 실제 환경에서 필요
        // 'Authorization': 'Bearer your-token'
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}\n${errorData}`)
    }

    const result = await response.json()
    
    console.log('✅ OCR API 응답 수신 성공')
    console.log('📋 응답 데이터:')
    console.log(JSON.stringify(result, null, 2))

    // 응답 검증
    const validationResults = validateOCRResponse(result)
    console.log('\n🔍 응답 검증 결과:')
    validationResults.forEach(result => {
      console.log(`${result.pass ? '✅' : '❌'} ${result.test}: ${result.message}`)
    })

    const passedTests = validationResults.filter(r => r.pass).length
    const totalTests = validationResults.length
    
    console.log(`\n📊 테스트 결과: ${passedTests}/${totalTests} 통과`)
    
    if (passedTests === totalTests) {
      console.log('🎉 모든 테스트 통과! OCR 기능이 정상적으로 작동합니다.')
    } else {
      console.log('⚠️  일부 테스트 실패. 위의 결과를 확인해주세요.')
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 해결 방법:')
      console.log('1. 개발 서버가 실행 중인지 확인: npm run dev')
      console.log('2. 서버가 http://localhost:3000 에서 실행 중인지 확인')
      console.log('3. 방화벽 설정 확인')
    }
  }
}

// OCR 응답 검증 함수
function validateOCRResponse(response) {
  const tests = [
    {
      test: '응답 구조 확인',
      pass: typeof response === 'object' && response !== null,
      message: typeof response === 'object' ? '올바른 JSON 객체' : '잘못된 응답 형식'
    },
    {
      test: 'success 필드 존재',
      pass: 'success' in response,
      message: 'success' in response ? 'success 필드 존재' : 'success 필드 누락'
    },
    {
      test: 'text 필드 존재',
      pass: 'text' in response,
      message: 'text' in response ? 'text 필드 존재' : 'text 필드 누락'
    },
    {
      test: 'parsed 필드 존재',
      pass: 'parsed' in response,
      message: 'parsed' in response ? 'parsed 필드 존재' : 'parsed 필드 누락'
    },
    {
      test: 'confidence 필드 확인',
      pass: 'confidence' in response && typeof response.confidence === 'number',
      message: 'confidence' in response ? `confidence 값: ${response.confidence}` : 'confidence 필드 누락'
    }
  ]

  if (response.parsed) {
    const parsedTests = [
      {
        test: 'parsed.platform 타입',
        pass: typeof response.parsed.platform === 'string',
        message: `platform: "${response.parsed.platform}"`
      },
      {
        test: 'parsed.rating 타입',
        pass: typeof response.parsed.rating === 'number',
        message: `rating: ${response.parsed.rating}`
      },
      {
        test: 'parsed.content 타입',
        pass: typeof response.parsed.content === 'string',
        message: `content: "${response.parsed.content?.slice(0, 50)}${response.parsed.content?.length > 50 ? '...' : ''}"`
      }
    ]
    tests.push(...parsedTests)
  }

  return tests
}

// 환경 확인
function checkEnvironment() {
  console.log('🔧 환경 설정 확인...')
  
  const checks = [
    {
      name: 'Node.js 버전',
      check: () => process.version,
      pass: true,
      message: `Node.js ${process.version}`
    },
    {
      name: 'FormData 지원',
      check: () => typeof FormData !== 'undefined',
      pass: typeof FormData !== 'undefined',
      message: typeof FormData !== 'undefined' ? 'FormData 지원됨' : 'FormData 미지원 (polyfill 필요)'
    },
    {
      name: 'fetch API 지원',
      check: () => typeof fetch !== 'undefined',
      pass: typeof fetch !== 'undefined', 
      message: typeof fetch !== 'undefined' ? 'fetch API 지원됨' : 'fetch API 미지원 (polyfill 필요)'
    }
  ]

  checks.forEach(check => {
    console.log(`${check.pass ? '✅' : '❌'} ${check.name}: ${check.message}`)
  })

  console.log()
}

// 메인 실행
async function main() {
  checkEnvironment()
  await testOCRAPI()
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}