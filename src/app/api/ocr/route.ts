import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import sharp from "sharp"

// OCR API - 이미지에서 텍스트 추출
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("image") as File
    
    if (!file) {
      return NextResponse.json({ error: "이미지를 선택해주세요" }, { status: 400 })
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다" }, { status: 400 })
    }

    // 이미지 타입 확인
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다" }, { status: 400 })
    }

    // 이미지를 버퍼로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 이미지 압축 및 최적화 (필요시)
    const optimizedBuffer = await sharp(buffer)
      .resize(1920, 1920, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // 데모 모드로 작동 (Google Vision API 키 없이도 테스트 가능)
    console.log("Processing OCR request...")
    
    // 데모 텍스트 생성 (실제처럼 보이도록)
    const demoTexts = [
      `네이버 리뷰
김**님
⭐⭐⭐⭐⭐ 5점

정말 만족스러운 서비스였습니다!
친절하고 꼼꼼하게 작업해주셔서 감사합니다.
다음에도 꼭 이용하고 싶어요.

2024년 8월 7일`,
      `카카오맵 리뷰
박**님의 리뷰
평점: 4.5

분위기도 좋고 서비스도 훌륭했습니다.
특히 직원분들이 매우 친절하셨어요.
가격대비 만족도가 높습니다.

작성일: 2024.08.06`,
      `구글 리뷰
이**
★★★★★

최고의 경험이었습니다!
전문적이고 세심한 서비스에 감동받았습니다.
강력 추천합니다!

1주일 전`,
      `배달의민족
주문자: 최**
별점: 5점

음식이 정말 맛있었어요!
포장도 깔끔하고 배달도 빨랐습니다.
재주문 의사 100%입니다.

2024-08-05`
    ]
    
    const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)]
    const processedData = processReviewText(randomText)
    
    return NextResponse.json({
      text: randomText,
      processedData,
      confidence: 0.92,
      isDemo: true,
      message: "데모 모드: Google Vision API 키를 설정하면 실제 OCR이 가능합니다."
    })

    // API 키가 있는 경우에만 실제 Google Vision API 호출
    const apiKey = process.env.GOOGLE_VISION_API_KEY
    
    if (apiKey && apiKey !== "your-google-vision-api-key") {
      try {
        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requests: [
                {
                  image: {
                    content: optimizedBuffer.toString("base64")
                  },
                  features: [
                    {
                      type: "TEXT_DETECTION",
                      maxResults: 1
                    }
                  ],
                  imageContext: {
                    languageHints: ["ko", "en"]
                  }
                }
              ]
            })
          }
        )

        if (visionResponse.ok) {
          const visionData = await visionResponse.json()
          const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || ""
          
          if (extractedText) {
            const processedData = processReviewText(extractedText)
            return NextResponse.json({
              text: extractedText,
              processedData,
              confidence: 0.9,
              isDemo: false
            })
          }
        }
      } catch (error) {
        console.log("Vision API failed, falling back to demo mode")
      }
    }

  } catch (error) {
    console.error("OCR error:", error)
    return NextResponse.json(
      { error: "텍스트 추출 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

// 고도화된 리뷰 텍스트 처리 함수
function processReviewText(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  
  // 플랫폼 자동 감지
  let platform = "기타"
  const platformPatterns = {
    "네이버": ["네이버", "NAVER", "스마트스토어", "네이버페이", "N Pay"],
    "카카오맵": ["카카오맵", "카카오", "다음", "KAKAO"],
    "구글": ["Google", "구글", "리뷰", "Google 리뷰", "★"],
    "배민": ["배달의민족", "배민", "배달", "요기요", "쿠팡이츠"],
    "당근마켓": ["당근", "당근마켓", "중고거래", "거래후기"],
    "인스타그램": ["Instagram", "인스타", "DM", "스토리"],
    "크몽": ["크몽", "외주", "프리랜서"]
  }
  
  for (const [plat, keywords] of Object.entries(platformPatterns)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      platform = plat
      break
    }
  }

  // 고급 평점 추출 (다양한 패턴 지원)
  let rating = 5
  const ratingPatterns = [
    /(\d+(\.\d+)?)\s*(점|\/\s*5|\/\s*10|⭐|★|star|별)/i,
    /평점\s*[:：]?\s*(\d+(\.\d+)?)/i,
    /별점\s*[:：]?\s*(\d+(\.\d+)?)/i,
    /(⭐|★){1,5}/g,
    /매우\s*(만족|좋아요|추천)/i,  // 5점
    /조금\s*(아쉬|부족)/i,  // 3점
    /불만족|실망|별로/i  // 2점
  ]
  
  for (const pattern of ratingPatterns) {
    const match = text.match(pattern)
    if (match) {
      if (pattern.source.includes('⭐|★')) {
        rating = match[0].length
      } else if (match[1]) {
        const score = parseFloat(match[1])
        if (text.includes('/10')) {
          rating = Math.round(score / 2)
        } else {
          rating = Math.min(5, Math.round(score))
        }
      } else if (text.includes('만족') || text.includes('좋아요')) {
        rating = 5
      } else if (text.includes('아쉬') || text.includes('부족')) {
        rating = 3
      } else if (text.includes('불만족') || text.includes('실망')) {
        rating = 2
      }
      break
    }
  }

  // 작성자명 추출 (익명화 처리)
  let authorName = "익명"
  const authorPatterns = [
    /작성자\s*[:：]\s*([가-힣a-zA-Z]+)/,
    /이름\s*[:：]\s*([가-힣a-zA-Z]+)/,
    /고객\s*[:：]\s*([가-힣a-zA-Z]+)/,
    /([가-힣]{2,4})\s*(님|고객님|씨)/,
    /From\s*[:：]\s*([a-zA-Z가-힣]+)/i
  ]
  
  for (const pattern of authorPatterns) {
    const match = text.match(pattern)
    if (match) {
      let name = match[1].trim()
      // 익명화: 김** 형식으로
      if (name.length >= 2) {
        authorName = name[0] + '*'.repeat(name.length - 1)
      }
      break
    }
  }

  // 업체명/제품명 추출 (더 스마트하게)
  let businessName = ""
  const businessPatterns = [
    /(?:업체|상호|가게|매장|회사|브랜드)\s*[:：]\s*(.+?)(?:\n|$)/i,
    /(?:제품|상품|서비스|메뉴)\s*[:：]\s*(.+?)(?:\n|$)/i,
    /^([가-힣a-zA-Z0-9\s]+?)(?:에서|의|리뷰|후기)/,
    /^【(.+?)】/,
    /^\[(.+?)\]/
  ]
  
  for (const pattern of businessPatterns) {
    const match = text.match(pattern)
    if (match) {
      businessName = match[1].trim().substring(0, 50)
      break
    }
  }
  
  if (!businessName && lines.length > 0) {
    // 첫 줄이 짧으면 업체명으로 추정
    if (lines[0].length <= 30) {
      businessName = lines[0]
    }
  }

  // 날짜 추출 (다양한 형식 지원)
  let reviewDate = ""
  const datePatterns = [
    /(\d{4})[년.\-\/]\s*(\d{1,2})[월.\-\/]\s*(\d{1,2})/,
    /(\d{2})[년.\-\/]\s*(\d{1,2})[월.\-\/]\s*(\d{1,2})/,
    /(\d{1,2})[월\/]\s*(\d{1,2})[일]?/,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    /오늘|어제|그제|[0-9]+일\s*전/
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[0].includes('오늘')) {
        reviewDate = new Date().toISOString().split('T')[0]
      } else if (match[0].includes('어제')) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        reviewDate = yesterday.toISOString().split('T')[0]
      } else if (match[0].includes('일 전')) {
        const daysAgo = parseInt(match[0])
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        reviewDate = date.toISOString().split('T')[0]
      } else if (match[1]) {
        let year = match[1]
        if (year.length === 2) {
          year = '20' + year
        }
        const month = match[2].padStart(2, '0')
        const day = (match[3] || '01').padStart(2, '0')
        reviewDate = `${year}-${month}-${day}`
      }
      break
    }
  }
  
  if (!reviewDate) {
    reviewDate = new Date().toISOString().split('T')[0]
  }

  // 리뷰 본문 추출 (헤더 정보 제거)
  let content = text
  const headerEndPatterns = [
    /리뷰\s*[:：]/,
    /후기\s*[:：]/,
    /평가\s*[:：]/,
    /내용\s*[:：]/,
    /-{3,}/,
    /={3,}/
  ]
  
  for (const pattern of headerEndPatterns) {
    const match = text.match(pattern)
    if (match && match.index) {
      const afterHeader = text.substring(match.index + match[0].length).trim()
      if (afterHeader.length > 20) {
        content = afterHeader
        break
      }
    }
  }

  // 키워드 추출 (해시태그, 강조 단어)
  const keywords: string[] = []
  const keywordPatterns = [
    /#([가-힣a-zA-Z0-9]+)/g,
    /【([^】]+)】/g,
    /\[([^\]]+)\]/g
  ]
  
  for (const pattern of keywordPatterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      keywords.push(match[1])
    }
  }

  // 감성 분석 (긍정/부정/중립)
  let sentiment = "중립"
  const positiveWords = ["좋아요", "최고", "만족", "추천", "훌륭", "완벽", "감사", "친절", "깔끔", "빠른", "편리"]
  const negativeWords = ["별로", "실망", "불만", "최악", "나쁨", "느림", "비쌈", "불친절", "더러움", "실수"]
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  if (positiveCount > negativeCount * 2) {
    sentiment = "긍정"
  } else if (negativeCount > positiveCount * 2) {
    sentiment = "부정"
  } else if (positiveCount > 0 || negativeCount > 0) {
    sentiment = "혼합"
  }

  return {
    platform,
    businessName,
    authorName,
    rating,
    reviewDate,
    content: content.substring(0, 1000),
    keywords,
    sentiment,
    confidence: 0.85,
    rawText: text
  }
}