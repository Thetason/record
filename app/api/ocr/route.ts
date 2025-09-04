import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const vision = require('@google-cloud/vision');

// Google Vision API 클라이언트 초기화
let visionClient: any = null;

// 초기화 함수
async function initializeVisionClient() {
  if (visionClient) return visionClient;
  
  try {
    console.log('Vision API 클라이언트 초기화 시작...');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // Base64 인코딩된 키가 있는 경우 (Vercel 프로덕션)
    if (process.env.GOOGLE_VISION_API_KEY) {
      console.log('Base64 키 사용');
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_VISION_API_KEY, 'base64').toString()
      );
      visionClient = new vision.ImageAnnotatorClient({
        credentials,
        projectId: credentials.project_id,
      });
    } 
    // 로컬 JSON 파일 경로가 있는 경우 (개발 환경)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('로컬 키 파일 사용:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });
    }
    
    if (visionClient) {
      console.log('✅ Vision API 클라이언트 초기화 성공');
    } else {
      console.log('❌ Vision API 클라이언트 초기화 실패');
    }
  } catch (error) {
    console.error('❌ Google Vision API 초기화 에러:', error);
  }
  
  return visionClient;
}

export async function POST(req: NextRequest) {
  try {
    // 임시로 인증 우회 (테스트용)
    console.log('📸 OCR API 호출됨');
    
    // 인증 확인 (임시 비활성화)
    /*
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false,
          error: '로그인이 필요합니다.' 
        },
        { status: 401 }
      );
    }
    */

    // 임시 사용자 정보 (테스트용)
    const user = { 
      id: 'test-user', 
      plan: 'FREE' 
    };
    
    /*
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, plan: true }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: '사용자를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    */

    // 요청 데이터 파싱
    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error('FormData 파싱 에러:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: '잘못된 요청 형식입니다.' 
        },
        { status: 400 }
      );
    }
    
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    // 이미지 크기 체크 (10MB 제한)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 크기는 10MB 이하여야 합니다.' 
        },
        { status: 400 }
      );
    }

    // Vision API 클라이언트 초기화
    const client = await initializeVisionClient();
    
    // Vision API가 초기화되지 않은 경우 Mock 데이터 반환
    if (!client) {
      console.log('Google Vision API가 설정되지 않음. Mock 데이터 반환');
      
      // 개발용 Mock 데이터
      const mockData = {
        text: '⭐⭐⭐⭐⭐ 5.0\n\n정말 만족스러운 서비스였습니다!\n선생님이 너무 친절하시고 전문적이세요.\n다음에도 꼭 다시 찾고 싶습니다.\n\n2024년 12월 15일\n네이버 리뷰',
        platform: 'naver',
        rating: 5,
        date: '2024-12-15',
        confidence: 0.95
      };
      
      return NextResponse.json({
        success: true,
        data: mockData,
        mock: true,
        message: 'OCR API가 설정되지 않아 샘플 데이터를 반환합니다.'
      });
    }

    // 이미지를 Buffer로 변환
    const buffer = Buffer.from(await image.arrayBuffer());

    // Google Vision API 호출
    console.log('🔍 Vision API 호출 시작...');
    const [result] = await client.textDetection({
      image: { content: buffer.toString('base64') }
    });

    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return NextResponse.json(
        { error: '텍스트를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 전체 텍스트 추출
    const fullText = detections[0].description || '';
    
    // 텍스트 분석 및 데이터 추출
    const extractedData = analyzeReviewText(fullText);

    // OCR 사용 기록 저장 (임시 비활성화)
    /*
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'OCR_SCAN',
        category: 'review',
        details: {
          platform: extractedData.platform,
          rating: extractedData.rating,
          textLength: fullText.length
        }
      }
    });
    */

    return NextResponse.json({
      success: true,
      data: {
        ...extractedData,
        text: fullText,
        confidence: detections[0].confidence || 0.9
      }
    });

  } catch (error) {
    console.error('OCR 처리 에러:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'OCR 처리 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// 텍스트에서 리뷰 정보 추출
function analyzeReviewText(text: string) {
  // 플랫폼 감지
  let platform = 'unknown';
  if (text.includes('네이버') || text.includes('NAVER')) {
    platform = 'naver';
  } else if (text.includes('카카오') || text.includes('kakao')) {
    platform = 'kakao';
  } else if (text.includes('인스타그램') || text.includes('Instagram')) {
    platform = 'instagram';
  } else if (text.includes('구글') || text.includes('Google')) {
    platform = 'google';
  }

  // 평점 추출 (별점 또는 숫자)
  let rating = 5;
  const starMatch = text.match(/⭐+/);
  if (starMatch) {
    rating = starMatch[0].length;
  } else {
    const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:점|\/\s*5)/);
    if (ratingMatch) {
      rating = Math.min(5, Math.max(1, parseFloat(ratingMatch[1])));
    }
  }

  // 날짜 추출
  let date = new Date().toISOString().split('T')[0];
  const datePatterns = [
    /(\d{4})[년.-](\d{1,2})[월.-](\d{1,2})/,
    /(\d{1,2})[월.-](\d{1,2})[일]/,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      const year = dateMatch[1].length === 4 ? dateMatch[1] : new Date().getFullYear();
      const month = dateMatch[2] || dateMatch[1];
      const day = dateMatch[3] || dateMatch[2];
      date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      break;
    }
  }

  // 작성자명 추출 (선택적)
  let author = '';
  const authorPatterns = [
    /작성자\s*[:：]\s*([^\n]+)/,
    /닉네임\s*[:：]\s*([^\n]+)/,
    /([가-힣]{2,4})\s*님/
  ];
  
  for (const pattern of authorPatterns) {
    const authorMatch = text.match(pattern);
    if (authorMatch) {
      author = authorMatch[1].trim();
      break;
    }
  }

  return {
    platform,
    rating,
    date,
    author,
    reviewText: text
  };
}