import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import vision from '@google-cloud/vision'

// Google Vision 클라이언트 초기화
// 프로덕션: Base64 인코딩된 키, 로컬: JSON 파일
const getVisionClient = () => {
  if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_VISION_API_KEY) {
    return new vision.ImageAnnotatorClient({
      credentials: JSON.parse(
        Buffer.from(process.env.GOOGLE_VISION_API_KEY, 'base64').toString()
      ),
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    })
  } else {
    // API 키가 없을 때 더미 응답 반환
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
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다' },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (10MB 제한)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    // API 클라이언트 체크
    if (!client) {
      // Google Vision API가 설정되지 않은 경우 더미 데이터 반환
      console.warn('Google Vision API not configured, returning mock data')
      return NextResponse.json({
        success: true,
        text: '네이버 리뷰\n★★★★★\n정말 친절하고 꼼꼼하게 가르쳐주세요!\n김**\n2024.01.20',
        parsed: {
          platform: '네이버',
          business: '',
          rating: 5,
          content: '정말 친절하고 꼼꼼하게 가르쳐주세요!',
          author: '김**',
          reviewDate: '2024-01-20'
        },
        confidence: 0.95,
        isMockData: true
      })
    }

    // 이미지를 Buffer로 변환
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Google Vision API로 텍스트 추출
    const [result] = await client.textDetection({
      image: {
        content: buffer
      },
      imageContext: {
        languageHints: ['ko', 'en'] // 한글과 영어 우선
      }
    })

    const detections = result.textAnnotations
    
    if (!detections || detections.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          text: '',
          message: '텍스트를 찾을 수 없습니다' 
        },
        { status: 200 }
      )
    }

    // 전체 텍스트 추출 (첫 번째 annotation이 전체 텍스트)
    const fullText = detections[0].description || ''

    // 리뷰 정보 파싱
    const parsedReview = parseReviewText(fullText)

    return NextResponse.json({
      success: true,
      text: fullText,
      parsed: parsedReview,
      confidence: detections[0].confidence || 0.95
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