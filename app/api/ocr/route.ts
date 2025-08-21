import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import vision from '@google-cloud/vision'

// 허용된 이미지 파일 형식
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Google Vision 클라이언트 초기화
const getVisionClient = () => {
  try {
    // 프로덕션 환경: Base64 인코딩된 서비스 계정 키
    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_VISION_API_KEY) {
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_VISION_API_KEY, 'base64').toString()
      )
      return new vision.ImageAnnotatorClient({
        credentials,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
      })
    }
    
    // 로컬 개발 환경: 서비스 계정 JSON 파일
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      })
    }
    
    // API 키 방식 (간단한 설정용)
    if (process.env.GOOGLE_CLOUD_API_KEY) {
      return new vision.ImageAnnotatorClient({
        apiKey: process.env.GOOGLE_CLOUD_API_KEY
      })
    }
    
    console.warn('Google Vision API credentials not configured')
    return null
  } catch (error) {
    console.error('Failed to initialize Google Vision client:', error)
    return null
  }
}

const client = getVisionClient()

export async function POST(req: NextRequest) {
  try {
    // 인증 체크
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // FormData에서 이미지 파일 추출
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (error) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다. FormData를 사용해주세요.' },
        { status: 400 }
      )
    }

    const imageFile = formData.get('image') as File
    
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다' },
        { status: 400 }
      )
    }

    // 파일 크기 체크
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다` },
        { status: 400 }
      )
    }

    // 파일 형식 체크
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다. JPEG, PNG, WebP 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 빈 파일 체크
    if (imageFile.size === 0) {
      return NextResponse.json(
        { error: '빈 파일입니다. 올바른 이미지 파일을 업로드해주세요.' },
        { status: 400 }
      )
    }

    // API 클라이언트 체크
    if (!client) {
      // Google Vision API가 설정되지 않은 경우 더미 데이터 반환
      console.warn('Google Vision API not configured, returning mock data')
      
      // 다양한 플랫폼의 샘플 데이터 랜덤 선택
      const mockData = [
        {
          text: '네이버 리뷰
★★★★★
정말 친절하고 꼼꼼하게 가르쳐주세요!
김**
2024.08.20',
          parsed: {
            platform: '네이버',
            business: '뷰티 살롱',
            rating: 5,
            content: '정말 친절하고 꼼꼼하게 가르쳐주세요!',
            author: '김**',
            reviewDate: '2024-08-20'
          }
        },
        {
          text: '카카오맵
⭐⭐⭐⭐
서비스가 좋아요 추천합니다
이**
2024.08.19',
          parsed: {
            platform: '카카오맵',
            business: '헬스장',
            rating: 4,
            content: '서비스가 좋아요 추천합니다',
            author: '이**',
            reviewDate: '2024-08-19'
          }
        },
        {
          text: '구글 리뷰
★★★★★ 5.0
 Very professional and friendly staff!
John D.
August 18, 2024',
          parsed: {
            platform: '구글',
            business: 'Hair Salon',
            rating: 5,
            content: 'Very professional and friendly staff!',
            author: 'John D.',
            reviewDate: '2024-08-18'
          }
        }
      ]
      
      const randomMockData = mockData[Math.floor(Math.random() * mockData.length)]
      
      return NextResponse.json({
        success: true,
        text: randomMockData.text,
        parsed: randomMockData.parsed,
        confidence: 0.95,
        isMockData: true,
        message: '테스트 모드: Google Vision API를 설정하면 실제 OCR이 작동합니다.'
      })
    }

    // 이미지를 Buffer로 변환
    let bytes: ArrayBuffer
    let buffer: Buffer
    
    try {
      bytes = await imageFile.arrayBuffer()
      buffer = Buffer.from(bytes)
    } catch (error) {
      console.error('Failed to convert image to buffer:', error)
      return NextResponse.json(
        { error: '이미지 파일 처리 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    // 이미지 유효성 검사 (간단한 헤더 체크)
    if (!isValidImageBuffer(buffer)) {
      return NextResponse.json(
        { error: '올바르지 않은 이미지 파일입니다' },
        { status: 400 }
      )
    }

    // Google Vision API로 텍스트 추출
    let result: any
    try {
      const [visionResult] = await client.textDetection({
        image: {
          content: buffer
        },
        imageContext: {
          languageHints: ['ko', 'en'], // 한글과 영어 우선
          textDetectionParams: {
            enableTextDetectionConfidenceScore: true
          }
        }
      })
      result = visionResult
    } catch (error: any) {
      console.error('Google Vision API error:', error)
      
      // API 쿼터 초과 에러 처리
      if (error.code === 8 || error.message?.includes('quota')) {
        return NextResponse.json(
          { error: 'OCR 서비스 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        )
      }
      
      // 기타 API 에러
      return NextResponse.json(
        { 
          error: 'OCR 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
          details: error.message
        },
        { status: 503 }
      )
    }

    const detections = result.textAnnotations
    
    if (!detections || detections.length === 0) {
      return NextResponse.json({
        success: false,
        text: '',
        parsed: {
          platform: '',
          business: '',
          rating: 5,
          content: '',
          author: '',
          reviewDate: ''
        },
        message: '이미지에서 텍스트를 찾을 수 없습니다. 더 선명한 이미지를 사용해보세요.',
        confidence: 0
      })
    }

    // 전체 텍스트 추출 (첫 번째 annotation이 전체 텍스트)
    const fullText = detections[0].description || ''
    const confidence = detections[0].confidence || 0.95

    // 신뢰도가 너무 낮은 경우 경고
    if (confidence < 0.7) {
      console.warn(`Low OCR confidence: ${confidence}`)
    }

    // 리뷰 정보 파싱
    const parsedReview = parseReviewText(fullText)

    return NextResponse.json({
      success: true,
      text: fullText,
      parsed: parsedReview,
      confidence: confidence,
      message: confidence < 0.8 ? '텍스트 인식 정확도가 낮을 수 있습니다. 결과를 확인해주세요.' : undefined
    })

  } catch (error) {
    console.error('OCR 처리 오류:', error)
    return NextResponse.json(
      { 
        error: 'OCR 처리 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 이미지 버퍼 유효성 검사
function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 8) return false
  
  const header = buffer.subarray(0, 12)
  
  // JPEG
  if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) return true
  
  // PNG
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return true
  
  // WebP
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
    return buffer.length >= 12 && 
           header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
  }
  
  return false
}

// 리뷰 텍스트 파싱 함수
function parseReviewText(text: string) {
  // 평점 추출
  const ratingMatch = text.match(/[★⭐]{1,5}/)
  const numericRatingMatch = text.match(/([0-9.]+)점/)
  let rating = 5

  if (ratingMatch) {
    rating = ratingMatch[0].length
  } else if (numericRatingMatch) {
    rating = Math.min(5, Math.max(1, parseFloat(numericRatingMatch[1])))
  }

  // 플랫폼 추출
  const platformMatch = text.match(/(네이버|카카오맵|카카오|구글|인스타그램|인스타)/)
  const platform = platformMatch ? platformMatch[1] : ''

  // 작성자 추출 (마스킹된 이름)
  const authorMatch = text.match(/([가-힣]{1,4})\*{1,3}/)
  const author = authorMatch ? authorMatch[0] : ''

  // 날짜 추출
  const dateMatch = text.match(/(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})|(\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2})/)
  let reviewDate = ''
  
  if (dateMatch) {
    reviewDate = dateMatch[0].replace(/[.\-/]/g, '-')
    // 2자리 연도를 4자리로 변환
    if (reviewDate.match(/^\d{2}-/)) {
      reviewDate = '20' + reviewDate
    }
  }

  // 업체명 추출 (간단한 패턴)
  const businessPatterns = [
    /([가-힣]+필라테스)/,
    /([가-힣]+스튜디오)/,
    /([가-힣]+PT)/,
    /([가-힣]+짐)/,
    /([가-힣]+요가)/,
    /([가-힣]+헬스)/,
    /([가-힣]+크로스핏)/,
    /([가-힣]+미용실)/,
    /([가-힣]+네일)/,
    /([가-힣]+속눈썹)/,
    /([가-힣]+피부관리실)/,
    /([가-힣]+에스테틱)/
  ]
  
  let business = ''
  for (const pattern of businessPatterns) {
    const match = text.match(pattern)
    if (match) {
      business = match[1]
      break
    }
  }

  // 리뷰 본문 추출 (불필요한 부분 제거)
  let content = text
    .replace(/[★⭐]+/g, '')
    .replace(/\d+점/g, '')
    .replace(/(네이버|카카오맵|카카오|구글|인스타그램|인스타)/g, '')
    .replace(/\d{2,4}[.\-/]\d{1,2}[.\-/]\d{1,2}/g, '')
    .replace(/[가-힣]{1,4}\*{1,3}/g, '')
    .trim()

  return {
    platform,
    business,
    rating,
    content,
    author,
    reviewDate
  }
}