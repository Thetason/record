import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel Pro: 30초 타임아웃 (Free는 10초 고정)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import sharp from 'sharp';
import { LRUCache } from 'lru-cache';
import cleanKoreanReview, { stripCommonNoiseLines as stripNoiseLocal } from '@/lib/text-clean';
import { improveSpacingViaService } from '@/lib/spacing-service';
import { rateLimit, getIP, rateLimitResponse, apiLimits } from '@/lib/rate-limit';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';

type AnnotateImageResponse = protos.google.cloud.vision.v1.IAnnotateImageResponse;
type Vertex = protos.google.cloud.vision.v1.IVertex;
type Word = protos.google.cloud.vision.v1.IWord;
type Symbol = protos.google.cloud.vision.v1.ISymbol;
type EntityAnnotation = protos.google.cloud.vision.v1.IEntityAnnotation;

type CleanServiceResponse = {
  cleaned?: string;
  text?: string;
};

// Google Vision API 클라이언트 초기화
let visionClient: ImageAnnotatorClient | null = null;
const cache = new LRUCache<string, Record<string, unknown>>({ max: 500, ttl: 1000 * 60 * 60 * 24 * 7 });
const enableTesseractFallback = process.env.ENABLE_TESSERACT_FALLBACK === 'true';
const visionTimeoutMs = Number(process.env.OCR_VISION_TIMEOUT_MS || 8000); // Vercel Free 10초 timeout 대응
const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  if (!ms || Number.isNaN(ms) || ms <= 0) {
    return promise;
  }
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT_${label}_${ms}`));
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

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
      visionClient = new ImageAnnotatorClient({
        credentials,
        projectId: credentials.project_id,
      });
    } 
    // 로컬 JSON 파일 경로가 있는 경우 (개발 환경)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('로컬 키 파일 사용:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      visionClient = new ImageAnnotatorClient({
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
  let lastUploadedBuffer: Buffer | null = null;
  try {
    // Feature flag: allow disabling OCR and always return mock
    const ocrEnabled = process.env.ENABLE_OCR !== 'false';
    console.log('📸 OCR API 호출됨');

    if (!ocrEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'OCR 기능이 현재 비활성화되어 있습니다.'
        },
        { status: 503 }
      );
    }

    // Rate limiting (per IP)
    const clientIp = getIP(req) || 'unknown';
    try {
      await limiter.check(req, apiLimits.ocr, `ocr_${clientIp}`);
    } catch {
      return rateLimitResponse(60);
    }

    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '로그인이 필요합니다.'
        },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, plan: true, reviewLimit: true }
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
    const version = (formData.get('version') as string) || 'v2'; // 기본값: v2 (영역기반 - 가장 정확함)
    const retryMode = formData.get('retry') === 'true'; // 2차 재시도 모드
    const forcedPlatform = (formData.get('platform') as string) || ''; // 사용자가 선택한 플랫폼 (강제)

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: '이미지가 필요합니다.'
        },
        { status: 400 }
      );
    }

    console.log(`📸 OCR 버전: ${version}${retryMode ? ' (2차 재시도 모드)' : ''}`);

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

    // Build cache key from image hash + version + retry mode
    const bufRaw = Buffer.from(await image.arrayBuffer());
    lastUploadedBuffer = bufRaw;
    const hash = crypto.createHash('sha256').update(bufRaw).update(version).update(retryMode ? 'retry' : 'normal').digest('hex');
    const cached = cache.get(hash);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cache: true });
    }

    // Preprocess image to improve OCR
    let processed = bufRaw;
    try {
      const img = sharp(bufRaw).resize({ width: 1600, withoutEnlargement: true }).grayscale().normalize();
      // optional threshold to reduce UI noise; avoid over-binarization for photos
      processed = await img.toBuffer();
    } catch {}

    // Vision API 클라이언트 초기화
    const client = ocrEnabled ? await initializeVisionClient() : null;
    
    // Vision API가 초기화되지 않은 경우 Mock 데이터 반환
    if (!client) {
      console.log('Google Vision API가 설정되지 않음. Mock 데이터 반환');
      
      // 개발용 Mock 데이터
      const mockData = {
        text: '정말 만족스러운 서비스였습니다!\n선생님이 너무 친절하시고 전문적이세요.\n다음에도 꼭 다시 찾고 싶습니다.\n\n2024년 12월 15일\n네이버 리뷰',
        platform: 'naver',
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
    const buffer = processed;

    // Google Vision API 호출
    console.log(`🔍 Vision API 호출 시작... (timeout: ${visionTimeoutMs}ms)`);
    // Prefer documentTextDetection to get structured blocks/paragraphs/words
    const [result] = await withTimeout(
      client.documentTextDetection({
        image: { content: buffer.toString('base64') },
        imageContext: { languageHints: ['ko', 'en'] }
      }),
      visionTimeoutMs,
      'VISION'
    );

    // Try Google's assembled text first
    let full = result.fullTextAnnotation?.text?.trim();
    // Fallback to annotations array
    let detections = result.textAnnotations as EntityAnnotation[] | undefined;

    // Some UI-heavy 이미지에서는 DocumentTextDetection이 텍스트 일부만 반환할 수 있음. 보조 API 호출로 보충
    const needsTextFallback = !full || full.length < Number(process.env.OCR_TEXT_FALLBACK_LENGTH ?? 400);
    if (needsTextFallback) {
      try {
        const [alt] = await withTimeout(
          client.textDetection({ image: { content: buffer.toString('base64') }, imageContext: { languageHints: ['ko', 'en'] } }),
          visionTimeoutMs,
          'VISION_TEXT_FALLBACK'
        );
        const altFull = alt?.fullTextAnnotation?.text?.trim();
        const altDesc = alt?.textAnnotations?.[0]?.description?.trim();
        const candidate = [altFull, altDesc].filter(Boolean).sort((a, b) => (b?.length ?? 0) - (a?.length ?? 0))[0];
        if (candidate && (!full || candidate.length > full.length)) {
          full = candidate;
          detections = alt?.textAnnotations ?? detections;
        }
      } catch (fallbackError) {
        console.warn('문서 OCR 보조 호출 실패:', fallbackError);
      }
    }

    if (!full && (!detections || detections.length === 0)) {
      // Try Tesseract fallback before giving up (load lazily to avoid worker bundling issues)
      if (enableTesseractFallback) {
        try {
          const { default: Tesseract } = await import('tesseract.js');
          const tess = await Tesseract.recognize(buffer, 'kor+eng');
          const tText = (tess?.data?.text || '').trim();
          if (tText) {
            const cleanedT = cleanKoreanReview(stripNoiseLocal(refineSpacing(tText)), { maskPII: true, strong: true });
            const tExtract = analyzeReviewText(cleanedT);
            const payload = {
              ...tExtract,
              text: cleanedT,
              rawText: tText,
              normalizedText: cleanedT,
              confidence: 0.7,
              engine: 'tesseract',
              postprocess: 'local'
            }
            cache.set(hash, payload);
            return NextResponse.json({ success: true, data: payload });
          }
        } catch (e) {
          console.warn('Tesseract fallback failed or unavailable:', e);
        }
      } else {
        console.warn('Tesseract fallback 비활성화됨 (ENABLE_TESSERACT_FALLBACK !== "true")');
      }
      return NextResponse.json({ success: false, error: '텍스트를 찾을 수 없습니다.' }, { status: 422 });
    }
    
    // Rebuild text in reading order when Google's assembled text is noisy
    const rebuilt = rebuildReadingOrder(result);
    const rawFullText = (rebuilt || full || detections?.[0]?.description || '').trim();
    // Local cleaning
    const normalization = await normalizeForAnalysis(rawFullText);
    const baseForCleaner = normalization.baseText;
    // External cleaner (optional)
    let cleaned = baseForCleaner;
    let externalApplied = false;
    const svc = process.env.TEXT_CLEAN_SERVICE_URL;
    if (svc) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2000);
        const resp = await fetch(svc, { method: 'POST', body: JSON.stringify({ text: baseForCleaner }), headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal });
        clearTimeout(t);
        if (resp.ok) {
          const j = await resp.json() as CleanServiceResponse;
          const external = j.cleaned || j.text;
          if (external && typeof external === 'string') {
            cleaned = external;
            externalApplied = true;
          }
        }
      } catch {}
    }

    // Final safety normalization
    cleaned = cleanKoreanReview(cleaned, { maskPII: true, strong: true });

    // 텍스트 분석 및 데이터 추출
    let extractedData;
    if (version === 'v2') {
      console.log(`🆕 V2 알고리즘 사용 (영역 기반 파싱)${retryMode ? ' [재시도 모드]' : ''}${forcedPlatform ? ` [플랫폼: ${forcedPlatform}]` : ''}`);
      extractedData = analyzeReviewTextV2(result, retryMode, forcedPlatform);
    } else {
      console.log('📜 V1 알고리즘 사용 (기존 텍스트 기반)');
      extractedData = analyzeReviewText(baseForCleaner);
    }

    // OCR 사용 기록 저장 (임시 비활성화)
    /*
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'OCR_SCAN',
        category: 'review',
        details: {
          platform: extractedData.platform,
          textLength: fullText.length
        }
      }
    });
    */

    const postSteps: string[] = [];
    if (normalization.spacingApplied) postSteps.push('spacing-service');
    if (externalApplied) postSteps.push('external');
    postSteps.push('local');

    const detectionsList = Array.isArray(detections) ? detections : [];
    const topDetectionConfidence =
      detectionsList.length > 0 && typeof detectionsList[0]?.confidence === 'number'
        ? detectionsList[0]!.confidence ?? 0.9
        : 0.9;

    const payload = {
      ...extractedData,
      text: cleaned,
      rawText: rawFullText,
      normalizedText: cleaned,
      confidence: topDetectionConfidence,
      engine: 'google',
      postprocess: postSteps.join('+'),
      intermediateText: {
        denoised: normalization.denoised,
        base: baseForCleaner
      }
    }
    cache.set(hash, payload);
    return NextResponse.json({ success: true, data: payload });

  } catch (error) {
    console.error('OCR 처리 에러:', error);
    if (enableTesseractFallback && error instanceof Error && error.message?.startsWith('TIMEOUT_VISION')) {
      console.error('Vision API timeout 발생, Tesseract fallback 시도');
    }
    if (enableTesseractFallback && lastUploadedBuffer) {
      try {
        const { default: Tesseract } = await import('tesseract.js');
        const tess = await Tesseract.recognize(lastUploadedBuffer, 'kor+eng');
        const tText = (tess?.data?.text || '').trim();
        if (tText) {
          const normalization = await normalizeForAnalysis(tText);
          const baseForCleaner = normalization.baseText;
          let cleanedT = baseForCleaner;
          let externalApplied = false;

          if (process.env.TEXT_CLEAN_SERVICE_URL) {
            try {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 2000);
              const resp = await fetch(process.env.TEXT_CLEAN_SERVICE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: baseForCleaner }),
                signal: ctrl.signal
              });
              clearTimeout(t);
              if (resp.ok) {
                const j = await resp.json() as CleanServiceResponse;
                const external = j.cleaned || j.text;
                if (external && typeof external === 'string') {
                  cleanedT = external;
                  externalApplied = true;
                }
              }
            } catch {}
          }

          cleanedT = cleanKoreanReview(cleanedT, { maskPII: true, strong: true });
          const tExtract = analyzeReviewText(baseForCleaner);
          const postSteps = [] as string[];
          if (normalization.spacingApplied) postSteps.push('spacing-service');
          if (externalApplied) postSteps.push('external');
          postSteps.push('local');
          const payload = {
            ...tExtract,
            text: cleanedT,
            rawText: tText,
            normalizedText: cleanedT,
            confidence: 0.7,
            engine: 'tesseract',
            postprocess: postSteps.join('+'),
            intermediateText: {
              denoised: normalization.denoised,
              base: baseForCleaner
            }
          }
          return NextResponse.json({ success: true, data: payload });
        }
      } catch (e) {
        console.warn('Tesseract final fallback failed or unavailable:', e);
      }
    }
    return NextResponse.json({ success: false, error: 'OCR 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 504 });
  }
}

// 텍스트에서 리뷰 정보 추출
function analyzeReviewText(text: string) {
  const cleaned = normalizeText(text);
  // 플랫폼 감지
  let platform = 'unknown';
  if (
    cleaned.includes('네이버') || cleaned.includes('NAVER') ||
    /리뷰\s*[\d,]+.*사진\s*[\d,]+/.test(cleaned) ||
    /^팔로우$/m.test(cleaned)
  ) {
    platform = 'naver';
  } else if (text.includes('카카오') || text.includes('kakao')) {
    platform = 'kakao';
  } else if (text.includes('인스타그램') || text.includes('Instagram')) {
    platform = 'instagram';
  } else if (text.includes('구글') || text.includes('Google')) {
    platform = 'google';
  } else if (text.includes('당근') || text.toLowerCase().includes('daangn')) {
    platform = '당근';
  }

  // 날짜 추출
  let date = new Date().toISOString().split('T')[0];
  const datePatterns = [
    /(\d{4})[년.-](\d{1,2})[월.-](\d{1,2})/,
    /(\d{1,2})[월.-](\d{1,2})[일]/,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    /(\d{1,2})\.(\d{1,2})(?:\.(?:월|\w+))?/,
    /(\d{1,2})\s*일\s*전/, // 3일 전
    /(어제|그제)/
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = cleaned.match(pattern);
    if (dateMatch) {
      if (pattern.source.includes('일\\s*전')) {
        const days = parseInt(dateMatch[1], 10) || 0;
        const d = new Date();
        d.setDate(d.getDate() - days);
        date = d.toISOString().split('T')[0];
      } else if (dateMatch[1] === '어제' || dateMatch[1] === '그제') {
        const delta = dateMatch[1] === '어제' ? 1 : 2;
        const d = new Date();
        d.setDate(d.getDate() - delta);
        date = d.toISOString().split('T')[0];
      } else {
        const y = dateMatch[1];
        const year = y && y.length === 4 ? y : String(new Date().getFullYear());
        const month = (dateMatch[2] || dateMatch[1]).toString();
        const day = (dateMatch[3] || dateMatch[2]).toString();
        date = `${month.length === 1 && year === String(new Date().getFullYear()) && !dateMatch[3] ? year : year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
      }
      break;
    }
  }

  // 작성자명 추출 (선택적)
  let author = '';
  const authorPatterns = [
    /작성자\s*[:：]\s*([^\n]+)/,
    /닉네임\s*[:：]\s*([^\n]+)/,
    /([가-힣A-Za-z0-9*]{2,15})\s*님/
  ];
  
  for (const pattern of authorPatterns) {
    const authorMatch = cleaned.match(pattern);
    if (authorMatch) {
      author = authorMatch[1].trim();
      break;
    }
  }

  // 네이버 전용 파서: 상단 메타/팔로우/접기/하단 태그 제거, 본문만 추출
  let body = cleaned;
  let business = '';
  if (platform === 'naver') {
    const n = parseNaver(cleaned);
    author = n.author || author;
    date = n.date || date;
    body = n.body || cleaned;
    business = n.business || '';
  } else if (platform === 'kakao') {
    const k = parseKakao(cleaned);
    author = k.author || author;
    date = k.date || date;
    body = k.body || cleaned;
  } else {
    body = parseGeneric(cleaned);
  }

  return {
    platform,
    date,
    author,
    business,
    reviewText: body
  };
}

// V2: 영역 기반 파싱 (Vision API의 boundingBox 활용)
function analyzeReviewTextV2(visionResult: AnnotateImageResponse | null | undefined, retryMode = false, forcedPlatform = '') {
  const annotations = (visionResult?.textAnnotations as EntityAnnotation[] | undefined) || [];

  if (annotations.length <= 1) {
    return {
      platform: 'unknown',
      date: new Date().toISOString().split('T')[0],
      author: '',
      business: '',
      reviewText: ''
    };
  }

  // 🎯 fullTextAnnotation의 word 단위 파싱 (띄어쓰기 개선)
  const pages = visionResult?.fullTextAnnotation?.pages || [];
  const wordsFromPages: Array<{ text: string; boundingBox: any }> = [];

  for (const page of pages) {
    for (const block of page.blocks || []) {
      for (const paragraph of block.paragraphs || []) {
        for (const word of paragraph.words || []) {
          // word의 symbols를 합쳐서 단어 텍스트 생성
          const wordText = (word.symbols || [])
            .map(symbol => symbol.text || '')
            .join('');

          if (wordText.trim()) {
            wordsFromPages.push({
              text: wordText,
              boundingBox: word.boundingBox
            });
          }
        }
      }
    }
  }

  console.log(`📝 fullTextAnnotation에서 추출한 단어 수: ${wordsFromPages.length}`);

  // 👤 작성자 추출: "리뷰 XX · 사진 XX" 패턴의 바로 위 텍스트
  let extractedAuthor = '';
  if (wordsFromPages.length > 0) {
    // Y 좌표로 정렬 (위에서 아래로)
    const sortedByY = [...wordsFromPages].sort((a, b) => {
      const yA = a.boundingBox?.vertices?.[0]?.y ?? 0;
      const yB = b.boundingBox?.vertices?.[0]?.y ?? 0;
      return yA - yB;
    });

    // "리뷰" 단어 찾기 (숫자가 뒤따라오는 경우)
    const reviewIndex = sortedByY.findIndex((word, idx) => {
      if (word.text === '리뷰' || word.text.startsWith('리뷰')) {
        // 다음 단어가 숫자인지 확인
        const nextWord = sortedByY[idx + 1];
        if (nextWord && /^\d+$/.test(nextWord.text)) {
          return true;
        }
      }
      return false;
    });

    if (reviewIndex > 0) {
      // "리뷰" 바로 위 단어를 작성자로 추출
      const reviewY = sortedByY[reviewIndex].boundingBox?.vertices?.[0]?.y ?? 0;

      // reviewY보다 작은 Y 좌표 중 가장 가까운 단어 찾기
      for (let i = reviewIndex - 1; i >= 0; i--) {
        const candidateY = sortedByY[i].boundingBox?.vertices?.[0]?.y ?? 0;
        const candidateText = sortedByY[i].text;

        // Y 좌표 차이가 100px 이내이고, 유효한 작성자명 패턴
        if (reviewY - candidateY < 100 && /^[가-힣a-zA-Z0-9*_]+$/.test(candidateText)) {
          // 메타데이터 제외
          if (!/^(팔로우|팔로잉|방문자|NAVER|홈|소식|예약|사진|주변|정보)$/.test(candidateText)) {
            extractedAuthor = candidateText;
            console.log(`👤 작성자 추출 성공: "${extractedAuthor}" (리뷰 위 ${reviewY - candidateY}px)`);
            break;
          }
        }
      }
    }
  }

  // 전체 텍스트 (textAnnotations[0])
  const fullText = annotations[0]?.description ?? '';
  const fullLines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

  console.log(`📄 전체 텍스트 라인 수: ${fullLines.length}`);

  // 이미지 높이 계산
  const allYs = annotations.slice(1).flatMap(a =>
    (a.boundingPoly?.vertices || []).map(v => v?.y ?? 0)
  );
  const maxY = Math.max(...allYs, 1);

  console.log(`📐 이미지 높이: ${maxY}px`);

  // 한글 플랫폼명 → 영문 코드 매핑
  const normalizePlatform = (platform: string): string => {
    const mapping: Record<string, string> = {
      '네이버': 'naver',
      '카카오맵': 'kakao',
      '카카오': 'kakao',
      '당근': 'danggeun',
      '크몽': 'kmong',
      '인스타그램': 'instagram',
      '구글': 'google',
    };
    return mapping[platform] || platform.toLowerCase();
  };

  // 🔍 플랫폼별 UI 패턴 감지
  const detectPlatform = (): string => {
    const topTexts = fullLines.slice(0, 20).join(' ');

    // 네이버 - "리뷰", "방문자", "사진" 조합 또는 "이웃추가" 등
    if ((topTexts.includes('리뷰') && topTexts.includes('방문자')) ||
        topTexts.includes('이웃추가') ||
        topTexts.includes('플레이스')) {
      console.log('🏷️ 플랫폼 감지: 네이버');
      return 'naver';
    }

    // 카카오 - "별점", "리뷰", "친구" 조합
    if ((topTexts.includes('별점') || topTexts.includes('★')) &&
        (topTexts.includes('친구') || topTexts.includes('카카오'))) {
      console.log('🏷️ 플랫폼 감지: 카카오');
      return 'kakao';
    }

    // 크몽 - "작업일", "주문 금액" 조합
    if (topTexts.includes('작업일') || (topTexts.includes('주문') && topTexts.includes('금액'))) {
      console.log('🏷️ 플랫폼 감지: 크몽');
      return 'kmong';
    }

    // 당근 - "동네", "매너온도", "당근", ("후기" + "도움돼요") 조합
    if (topTexts.includes('동네') ||
        topTexts.includes('매너온도') ||
        topTexts.includes('당근') ||
        (topTexts.includes('후기') && topTexts.includes('도움돼요'))) {
      console.log('🏷️ 플랫폼 감지: 당근');
      return 'danggeun';
    }

    // 인스타그램 - "좋아요", "댓글", "instagram" 등
    if (topTexts.includes('좋아요') && topTexts.includes('댓글')) {
      console.log('🏷️ 플랫폼 감지: 인스타그램');
      return 'instagram';
    }

    console.log('🏷️ 플랫폼 감지: 알 수 없음 (기본: naver)');
    return 'naver';
  };

  // 사용자가 플랫폼을 지정한 경우 우선 사용, 없으면 자동 감지
  const detectedPlatform = forcedPlatform
    ? normalizePlatform(forcedPlatform)
    : detectPlatform();

  console.log(`🎯 최종 플랫폼: ${detectedPlatform}${forcedPlatform ? ' (사용자 지정)' : ' (자동 감지)'}`);


  // 📸 리뷰 이미지 영역 감지 (큰 Y축 갭이 있는 경우 = 이미지가 있음)
  // ⚠️ 네이버는 이미지 감지 비활성화 (오감지로 인한 본문 손실 방지)
  const detectReviewImageBoundary = (): number => {
    // 네이버 플랫폼은 이미지 감지 스킵
    if (detectedPlatform === 'naver') {
      console.log(`⏭️ [네이버] 이미지 감지 비활성화 (필터링으로 처리)`);
      return 0;
    }

    const sortedAnnotations = annotations.slice(1)
      .filter(a => a.boundingPoly?.vertices?.[0]?.y)
      .sort((a, b) => {
        const yA = a.boundingPoly!.vertices![0]!.y!;
        const yB = b.boundingPoly!.vertices![0]!.y!;
        return yA - yB;
      });

    // Y축 좌표 차이가 큰 갭 찾기 (이미지 영역으로 추정)
    let maxGap = 0;
    let gapStartY = 0;

    for (let i = 1; i < sortedAnnotations.length; i++) {
      const prevY = sortedAnnotations[i - 1].boundingPoly!.vertices![0]!.y!;
      const currY = sortedAnnotations[i].boundingPoly!.vertices![0]!.y!;
      const gap = currY - prevY;

      // 300px 이상 갭이 있고, 상위 30% 영역 내에 있으면 이미지로 간주
      if (gap > 300 && currY < maxY * 0.3 && gap > maxGap) {
        maxGap = gap;
        gapStartY = currY;
      }
    }

    if (maxGap > 0) {
      console.log(`📸 리뷰 이미지 감지: Y=${gapStartY}px (갭=${maxGap}px)`);
      return gapStartY;
    }

    return 0;
  };

  const imageBottomY = detectReviewImageBoundary();

  // 📅 카카오맵 날짜 영역 감지 (날짜 밑부터 리뷰 본문)
  const detectDateBoundary = (): number => {
    if (detectedPlatform !== 'kakao') return 0;

    // 날짜 패턴: "2025.03.24." 또는 "2022.07.07."
    const datePattern = /^\d{4}\.\d{2}\.\d{2}\.$/;

    for (const annotation of annotations.slice(1)) {
      const text = annotation.description ?? '';
      const y = annotation.boundingPoly?.vertices?.[0]?.y ?? 0;

      if (datePattern.test(text)) {
        // 날짜 텍스트의 높이를 고려하여 날짜 아래부터 본문 시작
        const height = (annotation.boundingPoly?.vertices?.[2]?.y ?? y) - y;
        const dateBottomY = y + height;
        console.log(`📅 [카카오] 날짜 감지: "${text}" at Y=${y}px, 본문 시작=${dateBottomY}px`);
        return dateBottomY;
      }
    }

    return 0;
  };

  const dateBottomY = detectDateBoundary();

  // 👤 크몽 닉네임 영역 감지 (닉네임 밑부터 리뷰 본문)
  const detectNicknameBoundary = (): number => {
    if (detectedPlatform !== 'kmong') return 0;

    // 닉네임 패턴: "천*****", "슬*****" (한글 1자 + 별표 4개 이상)
    const nicknamePattern = /^[가-힣][*]{4,}$/;

    for (const annotation of annotations.slice(1)) {
      const text = annotation.description ?? '';
      const y = annotation.boundingPoly?.vertices?.[0]?.y ?? 0;

      if (nicknamePattern.test(text)) {
        // 닉네임 텍스트의 높이를 고려하여 닉네임 아래부터 본문 시작
        const height = (annotation.boundingPoly?.vertices?.[2]?.y ?? y) - y;
        const nicknameBottomY = y + height;
        console.log(`👤 [크몽] 닉네임 감지: "${text}" at Y=${y}px, 본문 시작=${nicknameBottomY}px`);
        return nicknameBottomY;
      }
    }

    return 0;
  };

  const nicknameBottomY = detectNicknameBoundary();

  // 📅 당근 상대 날짜 영역 감지 (날짜 밑부터 리뷰 본문)
  const detectDanggeunDateBoundary = (): number => {
    if (detectedPlatform !== 'danggeun') return 0;

    // 상대 날짜 패턴: "2년 전", "2개월 전", "3일 전", "1주 전"
    const datePattern = /^\d+(년|개월|일|주)\s*전$/;

    for (const annotation of annotations.slice(1)) {
      const text = annotation.description ?? '';
      const y = annotation.boundingPoly?.vertices?.[0]?.y ?? 0;

      if (datePattern.test(text)) {
        // 날짜 텍스트의 높이를 고려하여 날짜 아래부터 본문 시작
        const height = (annotation.boundingPoly?.vertices?.[2]?.y ?? y) - y;
        const dateBottomY = y + height;
        console.log(`📅 [당근] 날짜 감지: "${text}" at Y=${y}px, 본문 시작=${dateBottomY}px`);
        return dateBottomY;
      }
    }

    return 0;
  };

  const danggeunDateBottomY = detectDanggeunDateBoundary();

  // 영역별 분류 - 재시도 모드에서는 content 영역을 더 넓게 설정
  const regions = {
    header: [] as EntityAnnotation[],
    businessName: [] as EntityAnnotation[],
    navigation: [] as EntityAnnotation[],
    userInfo: [] as EntityAnnotation[],
    content: [] as EntityAnnotation[],
    tags: [] as EntityAnnotation[],
    footer: [] as EntityAnnotation[]
  };

  // 일반 모드: content 영역 최대한 넓게 (리뷰 텍스트 거의 전체 보존)
  // 재시도 모드: content 영역 좁게 (노이즈 강력 제거)
  const contentStartRatio = retryMode ? 0.30 : 0.05;
  const contentEndRatio = retryMode ? 0.75 : 0.98;

  annotations.slice(1).forEach(annotation => {
    const vertices = annotation.boundingPoly?.vertices || [];
    if (vertices.length === 0) return;

    const y = vertices[0]?.y ?? 0;
    const yRatio = y / maxY;

    if (yRatio < 0.10) regions.header.push(annotation);
    else if (yRatio < 0.18) regions.businessName.push(annotation);
    else if (yRatio < 0.25) regions.navigation.push(annotation);
    else if (yRatio < contentStartRatio) regions.userInfo.push(annotation);
    else if (yRatio < contentEndRatio) regions.content.push(annotation);
    else if (yRatio < 0.92) regions.tags.push(annotation);
    else regions.footer.push(annotation);
  });

  console.log('📊 영역별 텍스트 블록 수:', {
    header: regions.header.length,
    businessName: regions.businessName.length,
    navigation: regions.navigation.length,
    userInfo: regions.userInfo.length,
    content: regions.content.length,
    tags: regions.tags.length,
    footer: regions.footer.length
  });

  // 업체명 추출
  const businessTexts = regions.businessName.map(a => a.description ?? '').filter(Boolean);
  const business = businessTexts
    .filter(text => /[가-힣]{2,}/.test(text))
    .filter(text => !/^(뒤로|메뉴|공유|리뷰|사진|방문자|팔로우)$/.test(text))
    .sort((a, b) => b.length - a.length)[0] ?? '';

  console.log('🏪 업체명 후보:', businessTexts, '→ 선택:', business);

  // 작성자 추출 (fullTextAnnotation에서 추출한 값 우선 사용)
  let author = extractedAuthor;

  // userInfoTexts는 날짜 추출에도 필요하므로 항상 정의
  const headerTexts = regions.header.map(a => a.description ?? '').filter(Boolean);
  const userInfoTexts = regions.userInfo.map(a => a.description ?? '').filter(Boolean);

  // fallback: 기존 방식
  if (!author) {
    const allAuthorTexts = [...headerTexts, ...userInfoTexts];

    author = allAuthorTexts
      .filter(text => /^[가-힣a-zA-Z0-9*_]{2,15}$/.test(text))
      .filter(text => !/^(리뷰|사진|방문자|팔로우|후기|ㆍ|\d+)$/.test(text))
      .filter(text => !/^\d+$/.test(text))
      .find(text => text.length >= 2) ?? '';

    console.log('👤 작성자 후보 (fallback):', allAuthorTexts, '→ 선택:', author);
  }

  // 날짜 추출
  const footerTexts = regions.footer.map(a => a.description ?? '');
  const allDateTexts = [...userInfoTexts, ...footerTexts].join(' ');
  
  let date = new Date().toISOString().split('T')[0];
  
  const absoluteDateMatch = allDateTexts.match(/(\d{2,4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (absoluteDateMatch) {
    const [, y, m, d] = absoluteDateMatch;
    const year = y.length === 4 ? y : `20${y}`;
    date = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else {
    const relativeMatch = allDateTexts.match(/(\d+)\s*(일|개월|시간|분)\s*전/);
    
    if (relativeMatch) {
      const [, num, unit] = relativeMatch;
      const now = new Date();
      const offset = parseInt(num, 10);
      
      if (unit === '일') {
        now.setDate(now.getDate() - offset);
      } else if (unit === '개월') {
        now.setMonth(now.getMonth() - offset);
      } else if (unit === '시간') {
        now.setHours(now.getHours() - offset);
      } else if (unit === '분') {
        now.setMinutes(now.getMinutes() - offset);
      }
      
      date = now.toISOString().split('T')[0];
    }
  }

  console.log('📅 날짜 추출:', { allDateTexts, date });

  // 본문 추출
  // 일반 모드: 최소 필터링 (긴 리뷰 텍스트 최대한 보존)
  // 재시도 모드: 공격적 필터링 (뒷부분 쓰레기 데이터 제거)

  // 📸 네이버 특화: 이미지가 있으면 이미지 아래부터 리뷰 시작
  // 📅 카카오 특화: 날짜가 있으면 날짜 아래부터 리뷰 시작
  // 👤 크몽 특화: 닉네임이 있으면 닉네임 아래부터 리뷰 시작
  // 📅 당근 특화: 상대 날짜가 있으면 날짜 아래부터 리뷰 시작
  const contentAnnotations = regions.content.filter(a => {
    const y = a.boundingPoly?.vertices?.[0]?.y ?? 0;

    // 네이버: 이미지 감지된 경우, 이미지 아래 텍스트만 처리
    if (imageBottomY > 0 && detectedPlatform === 'naver') {
      return y >= imageBottomY;
    }

    // 카카오: 날짜 감지된 경우, 날짜 아래 텍스트만 처리
    if (dateBottomY > 0 && detectedPlatform === 'kakao') {
      return y >= dateBottomY;
    }

    // 크몽: 닉네임 감지된 경우, 닉네임 아래 텍스트만 처리
    if (nicknameBottomY > 0 && detectedPlatform === 'kmong') {
      return y >= nicknameBottomY;
    }

    // 당근: 상대 날짜 감지된 경우, 날짜 아래 텍스트만 처리
    if (danggeunDateBottomY > 0 && detectedPlatform === 'danggeun') {
      return y >= danggeunDateBottomY;
    }

    return true;
  });

  const sortedContent = contentAnnotations.sort((a, b) => {
    const yA = a.boundingPoly?.vertices?.[0]?.y ?? 0;
    const yB = b.boundingPoly?.vertices?.[0]?.y ?? 0;
    const xA = a.boundingPoly?.vertices?.[0]?.x ?? 0;
    const xB = b.boundingPoly?.vertices?.[0]?.x ?? 0;
    return yA !== yB ? yA - yB : xA - xB;
  });

  // ⛔ "접기" 또는 "사장님의 답글" 키워드 이후 텍스트 제외
  let stopAtIndex = -1;
  sortedContent.forEach((a, idx) => {
    const text = a.description ?? '';
    if (text === '접기' && stopAtIndex === -1) {
      stopAtIndex = idx;
      console.log(`⛔ "접기" 감지 - 인덱스 ${idx}에서 본문 추출 중단`);
    }
    // 당근: "사장님의 답글" 감지
    if ((text.includes('사장님의') && text.includes('답글')) && stopAtIndex === -1) {
      stopAtIndex = idx;
      console.log(`⛔ [당근] "사장님의 답글" 감지 - 인덱스 ${idx}에서 본문 추출 중단`);
    }
  });

  const finalContent = stopAtIndex !== -1
    ? sortedContent.slice(0, stopAtIndex)
    : sortedContent;

  // 🎯 fullTextAnnotation words 활용 (띄어쓰기 개선)
  // Vision API가 이미 단어 단위로 구분한 것을 활용
  let reviewText = '';

  // wordsFromPages가 있으면 우선 사용 (더 정확한 띄어쓰기)
  const useWordsFromPages = wordsFromPages.length > 0;

  if (useWordsFromPages) {
    console.log(`✨ fullTextAnnotation words 사용 (${wordsFromPages.length}개 단어)`);

    // Y 좌표 기준으로 정렬
    const sortedWords = wordsFromPages.sort((a, b) => {
      const yA = a.boundingBox?.vertices?.[0]?.y ?? 0;
      const yB = b.boundingBox?.vertices?.[0]?.y ?? 0;
      const xA = a.boundingBox?.vertices?.[0]?.x ?? 0;
      const xB = b.boundingBox?.vertices?.[0]?.x ?? 0;
      return yA !== yB ? yA - yB : xA - xB;
    });

    // 🎯 "팔로우" 버튼 이후부터 시작 (리뷰 콘텐츠 영역)
    let contentStartY = 0;
    const followWord = sortedWords.find(w => w.text.includes('팔로우'));
    if (followWord) {
      contentStartY = followWord.boundingBox?.vertices?.[0]?.y ?? 0;
      console.log(`📍 "팔로우" 감지 - Y ${contentStartY} 이후부터 추출`);
    }

    // "접기" 이후 제외
    let wordStopIndex = -1;
    sortedWords.forEach((word, idx) => {
      if (word.text === '접기' && wordStopIndex === -1) {
        wordStopIndex = idx;
        console.log(`⛔ "접기" 감지 - 인덱스 ${idx}에서 중단`);
      }
      if ((word.text.includes('사장님의') && word.text.includes('답글')) && wordStopIndex === -1) {
        wordStopIndex = idx;
      }
    });

    const finalWords = wordStopIndex !== -1
      ? sortedWords.slice(0, wordStopIndex)
      : sortedWords;

    // 필터링하면서 공백으로 연결
    const filteredWords: string[] = [];

    for (const word of finalWords) {
      const text = word.text;
      const y = word.boundingBox?.vertices?.[0]?.y ?? 0;

      // "팔로우" 이전 영역은 스킵 (상단 UI 제외)
      if (contentStartY > 0 && y <= contentStartY) continue;

      // 필터링 - 제외할 텍스트는 건너뛰기
      if (!text.trim()) continue;

      // 네이버 필터링
      if (detectedPlatform === 'naver') {
      // 대문자만 있는 텍스트 (로고, 브랜드명)
      if (/^[A-Z\s]+$/.test(text) && text.length > 1) continue;

      // 프로필명 패턴 (한글+숫자 조합)
      if (/^[가-힣]+\d+$/.test(text)) continue;

      // 프로필명 패턴 (영문+숫자 조합: songwisdom1, wisdom123 등)
      if (/^[a-zA-Z]+\d+$/.test(text)) continue;

      // 단독 영어 단어 (짧은 것)
      if (/^[A-Za-z]+$/.test(text) && text.length <= 15) continue;

      // 기존 필터들
      if (/^리뷰\s*\d+\s*[·•]\s*사진\s*\d+$/.test(text)) continue;
      if (text.trim() === '리뷰') continue;
      if (text.trim() === '사진') continue;
      if (/^\d{1,3}$/.test(text.trim())) continue;
      if (/^[·•\s]+$/.test(text)) continue;
      if (/^\d{2,4}\.\d{1,2}\.\d{1,2}\.[월화수목금토일]?$/.test(text)) continue;
      if (/^\d+번째\s*방문$/.test(text)) continue;
      if (/^(영수증|반응\s*남기기)$/.test(text)) continue;
      if (/^리뷰\s*\d+$/.test(text)) continue;
      if (/^사진\s*\d+$/.test(text)) continue;
      if (/^방문자\s*\d*$/.test(text)) continue;
      if (/^팔로우\s*\d*$/.test(text)) continue;
      if (/^팔로잉$/.test(text)) continue;
      if (text === '접기') continue;
    }

    // 카카오 필터링
    if (detectedPlatform === 'kakao') {
      if (/^\d{4}\.\d{2}\.\d{2}\.$/.test(text)) continue;
      if (/^후기\s*\d+$/.test(text)) continue;
      if (/^별점평균\s*[\d.]+$/.test(text)) continue;
      if (/^팔로워\s*\d+$/.test(text)) continue;
      if (text === '위치기반') continue;
    }

    // 크몽 필터링
    if (detectedPlatform === 'kmong') {
      if (/^[가-힣][*]{4,}$/.test(text)) continue;
      if (/^\d{2}\.\d{2}\.\d{2}\s*\d{0,2}:?\d{0,2}$/.test(text)) continue;
      if (/^작업일\s*[:：]?/.test(text)) continue;
      if (/^주문\s*금액\s*[:：]?/.test(text)) continue;
      if (/^\d+만원\s*(미만|이상|~)/.test(text)) continue;
      if (/^\d+(시간|일|주|개월)이내$/.test(text)) continue;
    }

    // 당근 필터링
    if (detectedPlatform === 'danggeun') {
      if (/^\d+(년|개월|일|주)\s*전$/.test(text)) continue;
      if (/^후기\s*\d+/.test(text)) continue;
      if (/^도움돼요\s*\d*$/.test(text)) continue;
      if (/^(유용한순|최신순|오래된순)/.test(text)) continue;
      if (/^평균\s*별점\s*[\d.]+$/.test(text)) continue;
      if (/^(홈|소식|전체|조혜어|채팅\s*문의|전체\s*문의)$/.test(text)) continue;
    }

    // 공통 필터링
    if (/^[🔥✅😊✨📈🗣️👦🧑‍🎓💼📚🎯💪👍❤️⭐🌟]/.test(text)) continue;

    if (!retryMode) {
      if (/^\d+\s*(일|시간|분|개월)\s*전$/.test(text)) continue;
      if (/^\d+\s*도움\s*돼요?$/.test(text)) continue;
      if (/^(채팅\s*문의|확인\s*>|답변\s*\d+|더보기|번역|공유|신고|삭제|수정)$/.test(text)) continue;
    } else {
      if (text.trim().length < 2) continue;
      if (text.length <= 10 && /^(열정적|소통|체계적|초보자|깔끔|적합|실력|친절|가성비|아늑|추천|꼼꼼|전문적|만족|최고|좋아요|해요|대요|네요|예요)$/.test(text)) continue;
      if (/^\d+\s*(일|시간|분|개월)\s*전$/.test(text)) continue;
      if (/^\d+\s*도움\s*돼요?$/.test(text)) continue;
      if (/^(채팅\s*문의|확인\s*>|답변\s*\d+|더보기|번역|공유|신고|삭제|수정)$/.test(text)) continue;
      if (/^[.,·ㆍ\-_]+$/.test(text)) continue;
      if (/^\d+[가-힣]{1,2}$/.test(text)) continue;
    }

      // 필터링 통과한 단어 추가
      filteredWords.push(text);
    }

    // 공백으로 연결
    reviewText = filteredWords.join(' ').trim();
    console.log(`✨ fullTextAnnotation 기반 추출: ${filteredWords.length}개 단어`);

  } else {
    // fallback: 기존 textAnnotations 방식
    console.log(`⚠️ fullTextAnnotation 없음, textAnnotations 사용`);

    // 🎯 "팔로우" 버튼 이후부터 시작 (리뷰 콘텐츠 영역)
    let contentStartY = 0;
    const followAnnotation = finalContent.find(a => (a.description ?? '').includes('팔로우'));
    if (followAnnotation) {
      contentStartY = followAnnotation.boundingPoly?.vertices?.[0]?.y ?? 0;
      console.log(`📍 "팔로우" 감지 (fallback) - Y ${contentStartY} 이후부터 추출`);
    }

    let lastAnnotation: any = null;

    for (let i = 0; i < finalContent.length; i++) {
      const annotation = finalContent[i];
      const text = annotation.description ?? '';
      const y = annotation.boundingPoly?.vertices?.[0]?.y ?? 0;

      // "팔로우" 이전 영역은 스킵 (상단 UI 제외)
      if (contentStartY > 0 && y <= contentStartY) continue;

      // 필터링 - 제외할 텍스트는 건너뛰기
      if (!text.trim()) continue;

      // 네이버 필터링
      if (detectedPlatform === 'naver') {
        // 대문자만 있는 텍스트 (로고, 브랜드명)
        if (/^[A-Z\s]+$/.test(text) && text.length > 1) continue;

        // 프로필명 패턴 (한글+숫자 조합)
        if (/^[가-힣]+\d+$/.test(text)) continue;

        // 프로필명 패턴 (영문+숫자 조합: songwisdom1, wisdom123 등)
        if (/^[a-zA-Z]+\d+$/.test(text)) continue;

        // 단독 영어 단어 (짧은 것)
        if (/^[A-Za-z]+$/.test(text) && text.length <= 15) continue;

        // 기존 필터들
        if (/^리뷰\s*\d+\s*[·•]\s*사진\s*\d+$/.test(text)) continue;
        if (text.trim() === '리뷰') continue;
        if (text.trim() === '사진') continue;
        if (/^\d{1,3}$/.test(text.trim())) continue;
        if (/^[·•\s]+$/.test(text)) continue;
        if (/^\d{2,4}\.\d{1,2}\.\d{1,2}\.[월화수목금토일]?$/.test(text)) continue;
        if (/^\d+번째\s*방문$/.test(text)) continue;
        if (/^(영수증|반응\s*남기기)$/.test(text)) continue;
        if (/^리뷰\s*\d+$/.test(text)) continue;
        if (/^사진\s*\d+$/.test(text)) continue;
        if (/^방문자\s*\d*$/.test(text)) continue;
        if (/^팔로우\s*\d*$/.test(text)) continue;
        if (/^팔로잉$/.test(text)) continue;
        if (text === '접기') continue;
      }

      // 카카오 필터링
      if (detectedPlatform === 'kakao') {
        if (/^\d{4}\.\d{2}\.\d{2}\.$/.test(text)) continue;
        if (/^후기\s*\d+$/.test(text)) continue;
        if (/^별점평균\s*[\d.]+$/.test(text)) continue;
        if (/^팔로워\s*\d+$/.test(text)) continue;
        if (text === '위치기반') continue;
      }

      // 크몽 필터링
      if (detectedPlatform === 'kmong') {
        if (/^[가-힣][*]{4,}$/.test(text)) continue;
        if (/^\d{2}\.\d{2}\.\d{2}\s*\d{0,2}:?\d{0,2}$/.test(text)) continue;
        if (/^작업일\s*[:：]?/.test(text)) continue;
        if (/^주문\s*금액\s*[:：]?/.test(text)) continue;
        if (/^\d+만원\s*(미만|이상|~)/.test(text)) continue;
        if (/^\d+(시간|일|주|개월)이내$/.test(text)) continue;
      }

      // 당근 필터링
      if (detectedPlatform === 'danggeun') {
        if (/^\d+(년|개월|일|주)\s*전$/.test(text)) continue;
        if (/^후기\s*\d+/.test(text)) continue;
        if (/^도움돼요\s*\d*$/.test(text)) continue;
        if (/^(유용한순|최신순|오래된순)/.test(text)) continue;
        if (/^평균\s*별점\s*[\d.]+$/.test(text)) continue;
        if (/^(홈|소식|전체|조혜어|채팅\s*문의|전체\s*문의)$/.test(text)) continue;
      }

      // 공통 필터링
      if (/^[🔥✅😊✨📈🗣️👦🧑‍🎓💼📚🎯💪👍❤️⭐🌟]/.test(text)) continue;

      if (!retryMode) {
        if (/^\d+\s*(일|시간|분|개월)\s*전$/.test(text)) continue;
        if (/^\d+\s*도움\s*돼요?$/.test(text)) continue;
        if (/^(채팅\s*문의|확인\s*>|답변\s*\d+|더보기|번역|공유|신고|삭제|수정)$/.test(text)) continue;
      } else {
        if (text.trim().length < 2) continue;
        if (text.length <= 10 && /^(열정적|소통|체계적|초보자|깔끔|적합|실력|친절|가성비|아늑|추천|꼼꼼|전문적|만족|최고|좋아요|해요|대요|네요|예요)$/.test(text)) continue;
        if (/^\d+\s*(일|시간|분|개월)\s*전$/.test(text)) continue;
        if (/^\d+\s*도움\s*돼요?$/.test(text)) continue;
        if (/^(채팅\s*문의|확인\s*>|답변\s*\d+|더보기|번역|공유|신고|삭제|수정)$/.test(text)) continue;
        if (/^[.,·ㆍ\-_]+$/.test(text)) continue;
        if (/^\d+[가-힣]{1,2}$/.test(text)) continue;
      }

      // 통과한 텍스트만 처리
      if (reviewText.length === 0) {
        // 첫 단어는 그대로 추가
        reviewText = text;
        lastAnnotation = annotation;
    } else {
      // 이전 단어와의 간격 계산
      const prevBoundingBox = lastAnnotation?.boundingPoly?.vertices;
      const currBoundingBox = annotation.boundingPoly?.vertices;

      if (prevBoundingBox && currBoundingBox) {
        // 이전 단어의 오른쪽 끝 X 좌표
        const prevEndX = Math.max(
          prevBoundingBox[1]?.x ?? 0,
          prevBoundingBox[2]?.x ?? 0
        );
        // 현재 단어의 왼쪽 시작 X 좌표
        const currStartX = Math.min(
          currBoundingBox[0]?.x ?? 0,
          currBoundingBox[3]?.x ?? 0
        );
        // 간격
        const gap = currStartX - prevEndX;

        // 이전 단어의 너비 계산
        const prevStartX = Math.min(
          prevBoundingBox[0]?.x ?? 0,
          prevBoundingBox[3]?.x ?? 0
        );
        const prevWidth = prevEndX - prevStartX;

        // 이전 단어의 평균 문자 너비 (한글/영문 대략 계산)
        const prevTextLength = (lastAnnotation.description ?? '').length || 1;
        const avgCharWidth = prevWidth / prevTextLength;

        // 간격이 평균 문자 너비의 50% 이상이면 띄어쓰기 (기존 30%에서 상향)
        if (gap > avgCharWidth * 0.5) {
          reviewText += ' ' + text;
        } else {
          reviewText += text;
        }
      } else {
        // BoundingBox 정보가 없으면 기본 띄어쓰기
        reviewText += ' ' + text;
      }

      lastAnnotation = annotation; // 현재 annotation을 마지막으로 추가된 것으로 기록
    }
  }
}  // useWordsFromPages 분기 종료

  reviewText = reviewText.trim();
  
  // 후처리
  reviewText = reviewText
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/([.,!?])\s+/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  console.log(`✅ V2 추출 결과${retryMode ? ' [재시도]' : ''}:`, {
    platform: detectedPlatform,
    business,
    author,
    date,
    textLength: reviewText.length,
    preview: reviewText.slice(0, 100) + '...'
  });

  return {
    platform: detectedPlatform,
    date,
    author,
    business,
    reviewText
  };
}

function normalizeText(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function parseNaver(text: string): { author: string; body: string; date: string; business: string } {
  const rawLines = text.split('\n').map(l => l.trim());
  const lines = rawLines.filter(Boolean);
  let author = '';
  let date = '';
  let business = '';

  // 후보: 첫 줄(마스킹 이름), 혹은 "작성자: xxx"
  const top = lines[0] || '';
  if (/^[A-Za-z0-9가-힣*]{2,15}$/.test(top)) author = top;
  const authorLine = lines.find(l => /작성자\s*[:：]/.test(l));
  if (authorLine) {
    const m = authorLine.match(/[:：]\s*(.+)$/);
    if (m) author = m[1].trim();
  }

  // 리뷰/사진/팔로우 등 상단 메타 제거 + 상단 네비/시계/심볼 노이즈 제거
  const noiseTop = [
    /^리뷰\s*\d+(?:개)?$/,
    /^사진\s*\d+(?:장)?$/,
    /^팔로우(?:\s*\+?\d+)?$/i,
    /^팔로잉$/,
    /^프로필$/,
    /^후기\s*모아보기$/,
    /^(홈\s*)(소식)?\s*(예약)?\s*(리뷰)?$/,
    /^주변$/,
    /^정보$/,
    /^지도보기?$/,
    /^길찾기$/,
    /^전화$/,
    /^저장$/
  ];
  let start = 0;
  const isSymbolOnly = (s: string) => /^[^\w가-힣]+$/.test(s);
  const looksLikeClock = (s: string) => /\d{1,2}:\d{2}/.test(s);
  const looksLikeNetwork = (s: string) => /(5G|LTE|wifi|Wi-?Fi|X)/i.test(s);

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (i === 0 && author && l === author) { start = i + 1; continue; }
    if (noiseTop.some(r => r.test(l))) { start = i + 1; continue; }
    if (/^\[[^\]]+\]$/.test(l)) { start = i + 1; continue; } // 카테고리 태그 [보컬, 미디]
    if (/^리뷰\s*[\d,]+\s*[.,·]\s*사진\s*[\d,]+$/.test(l)) { start = i + 1; continue; }
    // 연속적으로 메타만 있는 구간 스킵
    if (i <= 6 && (l.length <= 3 || /^(팔로우|팔로잉)$/.test(l) || isSymbolOnly(l) || looksLikeClock(l) || looksLikeNetwork(l))) { start = i + 1; continue; }
    break;
  }

  // 하단 노이즈(접기/시설 태그류) 컷오프
  const bottomNoise = [
    '접기', '더보기', '번역', '공유', '신고', '메뉴', '답글', '사장님', '사장님 댓글',
    '시설이 깔끔해요', '아늑해요', '실력이', '친절해요', '재방문', '추천', '가성비가 좋아요',
    '채팅', '문의', '확인', '도움', '돼요', '도움돼요', '일 전', '개월 전', '시간 전', '분 전',
  ];
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (lines[i] === '접기') { end = i; break; }
    if (bottomNoise.some(k => lines[i].includes(k)) && (i - start) > 1) { end = i; break; }
  }

  // 본문 후보
  let bodyLines = lines.slice(start, end);
  // 중간에 끼어든 하트/불릿/단어 태그 정리
  bodyLines = bodyLines.filter(l => !/^[•♡♥※▶·ㆍ]+/.test(l));
  // 짧은 태그성 라인 제거(2~4글자, ‘해요/좋아요/깔끔/아늑’ 등 키워드 포함)
  const tagHints = ['해요', '좋아요', '깔끔', '아늑', '재방문', '추천', '친절', '실력', '가성비'];
  bodyLines = bodyLines.filter(l => !(l.length <= 6 && tagHints.some(k => l.includes(k))));
  // 날짜 후보를 본문 상하단에서 탐색
  const dateLine = bodyLines.find(l => /(\d{4}[.\-]\d{1,2}[.\-]\d{1,2})|(\d{1,2}[.\-]\d{1,2})|(\d+\s*일\s*전)|(어제|그제)/.test(l))
    || rawLines.reverse().find(l => /(\d{4}|\d{2})[.\-]\d{1,2}[.\-]\d{1,2}/.test(l));
  if (dateLine) {
    const d = analyzeReviewText(dateLine).date; // reuse
    if (d) date = d;
    // 날짜만 있는 라인은 본문에서 제거
    bodyLines = bodyLines.filter(l => l !== dateLine);
  }

  // 잔여 노이즈 라인 필터
  bodyLines = bodyLines.filter(l => !/^리뷰\s*\d+|^사진\s*\d+|^팔로우/.test(l));
  // 추가 노이즈: 단일 기호/별/물음표/단독 X 라인 삭제
  bodyLines = bodyLines.filter(l => !/^(\?|x|X|☆|★|\*|\-|=|—|·|ㆍ)$/.test(l));
  // 시간 표현 필터 ("11일 전", "3도움돼요", "채팅 문의 확인 >" 등)
  bodyLines = bodyLines.filter(l => {
    const trimmed = l.trim();
    // 숫자 + "일 전" / "시간 전" / "분 전" / "개월 전"
    if (/^\d+\s*(일|시간|분|개월)\s*전$/.test(trimmed)) return false;
    // 숫자 + "도움돼요" / "도움 돼요"
    if (/^\d+\s*도움\s*돼요?$/.test(trimmed)) return false;
    // "채팅 문의", "확인 >" 등 UI 텍스트
    if (/채팅\s*문의|확인\s*>|문의하기|답변\s*\d+/.test(trimmed)) return false;
    return true;
  });

  // 비즈니스명 후보: 상단 근처의 한국어 중심 라인 중 노이즈 제외, 특정 키워드 포함 우선
  const bizKeywords = ['학원','클래스','스튜디오','센터','샵','뮤직','필라테스','PT','뷰티','헤어','네일','요가','보컬'];
  const isNoise = (s: string) => /^(홈|리뷰|사진|정보|지도|길찾기|전화|저장|공유|리뷰\s|사진\s|팔로우|팔로잉|프로필|후기\s*모아보기)$/.test(s);
  const topWindow = lines.slice(0, Math.min(lines.length, 12));
  const bizCandidates = topWindow
    .filter(l => !isNoise(l) && /[가-힣]{2,}/.test(l) && l.length <= 30)
    .map(l => ({ l, score: bizKeywords.some(k => l.includes(k)) ? 2 : 1 }))
    .sort((a,b)=> b.score - a.score || b.l.length - a.l.length);
  if (bizCandidates[0]) business = bizCandidates[0].l.replace(/[†‡★☆✩✭✮✯⭐️]+/g,'').trim();

  const body = bodyLines.join('\n').trim();
  return { author, body, date, business };
}

// Kakao style: 상단 닉네임/별점/방문일자, 하단 "지도보기/공유/신고" 또는 "좋아요"류 제거
function parseKakao(text: string): { author: string; body: string; date: string } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let author = '';
  let date = '';

  // 첫 줄 닉네임 또는 "작성자:"
  const top = lines[0] || '';
  if (/^[A-Za-z0-9가-힣*]{2,15}$/.test(top)) author = top;
  const authorLine = lines.find(l => /작성자\s*[:：]/.test(l));
  if (authorLine) author = authorLine.split(/[:：]/)[1]?.trim() || author;

  // 상단 메타/버튼 제거
  const topNoise = [/^지도보기$/, /^공유$/, /^신고$/, /^좋아요\s*\d*$/, /^팔로우$/];
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i <= 2 && (lines[i] === author || topNoise.some(r => r.test(lines[i])))) {
      start = i + 1; continue;
    }
    break;
  }

  // 하단 노이즈 제거
  const bottomNoise = ['더보기', '접기', '공유', '신고', '번역', '좋아요', '채팅', '문의', '도움돼요'];
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (bottomNoise.some(k => lines[i].includes(k)) && (i - start) > 1) { end = i; break; }
  }

  let bodyLines = lines.slice(start, end);
  // 방문일/작성일 추출
  const dateLine = bodyLines.find(l => /(\d{4}[.\-]\d{1,2}[.\-]\d{1,2})|(\d{1,2}[.\-]\d{1,2})|(\d+\s*일\s*전)|(어제|그제)/.test(l));
  if (dateLine) {
    const d = analyzeReviewText(dateLine).date;
    if (d) date = d;
    bodyLines = bodyLines.filter(l => l !== dateLine);
  }

  // 태그/속성 라인 제거(예: 분위기/서비스/가격대 등)
  const attrHints = ['분위기', '서비스', '가격', '메뉴', '청결', '직원', '추천'];
  bodyLines = bodyLines.filter(l => !attrHints.some(k => l.includes(k)));

  // 시간 표현 필터 (네이버와 동일)
  bodyLines = bodyLines.filter(l => {
    const trimmed = l.trim();
    if (/^\d+\s*(일|시간|분|개월)\s*전$/.test(trimmed)) return false;
    if (/^\d+\s*도움\s*돼요?$/.test(trimmed)) return false;
    if (/채팅\s*문의|확인\s*>|문의하기|답변\s*\d+/.test(trimmed)) return false;
    return true;
  });

  return { author, body: bodyLines.join('\n').trim(), date };
}

// Generic cleanup for platforms: drop common UI words
function parseGeneric(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const ui = ['접기', '더보기', '공유', '신고', '번역', '팔로우', '프로필'];
  return lines.filter(l => !ui.includes(l)).join('\n').trim();
}

// Heuristic re-ordering using geometry (blocks/paragraphs/words)
function rebuildReadingOrder(result: AnnotateImageResponse | null | undefined): string | null {
  const pages = result?.fullTextAnnotation?.pages ?? [];
  const lines: { x: number; y: number; text: string }[] = [];

  const getCenter = (vertices: Vertex[] = []) => {
    const xs = vertices.map((v) => v?.x ?? 0);
    const ys = vertices.map((v) => v?.y ?? 0);
    if (xs.length === 0 || ys.length === 0) {
      return { x: 0, y: 0, h: 0 };
    }
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      h: maxY - minY
    };
  };

  for (const page of pages) {
    for (const block of page?.blocks ?? []) {
      for (const para of block?.paragraphs ?? []) {
        const words = (para?.words ?? []).map((word: Word) => (word?.symbols ?? []).map((symbol: Symbol) => symbol?.text ?? '').join(''));
        const text = words.join(' ').trim();
        if (!text) continue;
        const { x, y } = getCenter(para?.boundingBox?.vertices ?? []);
        lines.push({ x, y, text });
      }
    }
  }

  if (lines.length === 0) {
    const annotations = result?.textAnnotations as EntityAnnotation[] | undefined;
    if (!annotations || annotations.length <= 1) {
      return null;
    }

    type WordCluster = { x: number; y: number; h: number; text: string };
    const clusters: WordCluster[] = annotations
      .slice(1)
      .map((annotation) => {
        const { x, y, h } = getCenter(annotation.boundingPoly?.vertices ?? []);
        return { x, y, h, text: annotation.description ?? '' };
      })
      .filter((cluster) => cluster.text.trim().length > 0);

    if (clusters.length === 0) {
      return null;
    }

    clusters.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
    const grouped: Array<{ y: number; items: WordCluster[] }> = [];
    for (const cluster of clusters) {
      const band = grouped.find((group) => Math.abs(group.y - cluster.y) <= Math.max(8, cluster.h * 0.6));
      if (band) {
        band.items.push(cluster);
        band.y = (band.y * (band.items.length - 1) + cluster.y) / band.items.length;
      } else {
        grouped.push({ y: cluster.y, items: [cluster] });
      }
    }

    grouped.sort((a, b) => a.y - b.y);
    const reconstructed = grouped
      .map((group) => group.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(' ').trim())
      .filter(Boolean)
      .join('\n');

    return reconstructed || null;
  }

  const cutRatio = Number(process.env.OCR_TOP_CUT_RATIO || 0.12);
  const maxY = lines.reduce((acc, line) => Math.max(acc, line.y), 0);
  const yCut = maxY ? maxY * cutRatio : 0;
  const filtered = yCut ? lines.filter((line) => line.y >= yCut) : lines;

  filtered.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  return filtered.map((line) => line.text).join('\n').trim() || null;
}

// Post-OCR spacing refinement for Korean-heavy lines
function refineSpacing(text: string): string {
  return text.split('\n').map(line => {
    const tokens = line.trim().split(/\s+/);
    const hangul = /[\uAC00-\uD7AF]/;
    const singleHangul = tokens.filter(t => t.length === 1 && hangul.test(t)).length;
    const ratio = tokens.length ? singleHangul / tokens.length : 0;
    if (ratio >= 0.5) {
      // Collapse spaces between Hangul letters, keep punctuation spacing sane
      return line
        .replace(/(?<=[\uAC00-\uD7AF])\s+(?=[\uAC00-\uD7AF])/g, '')
        .replace(/\s+([,\.\!\?%\)\]\}])/g, '$1')
        .replace(/([\(\[\{])\s+/g, '$1');
    }
    return line;
  }).join('\n');
}

async function normalizeForAnalysis(raw: string) {
  const refined = refineSpacing(raw);
  const denoised = stripNoiseLocal(refined);
  const spaced = await improveSpacingViaService(denoised);
  const baseText = spaced ?? denoised;
  return {
    refined,
    denoised,
    baseText,
    spacingApplied: Boolean(spaced)
  };
}
