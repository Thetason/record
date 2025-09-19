import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import sharp from 'sharp';
import { LRUCache } from 'lru-cache';
import cleanKoreanReview, { stripCommonNoiseLines as stripNoiseLocal, normalizeWhitespacePunct as normPunct } from '@/lib/text-clean';
import { improveSpacingViaService } from '@/lib/spacing-service';
import { rateLimit, getIP, rateLimitResponse, apiLimits } from '@/lib/rate-limit';
const vision = require('@google-cloud/vision');

// Google Vision API 클라이언트 초기화
let visionClient: any = null;
const cache = new LRUCache<string, any>({ max: 500, ttl: 1000 * 60 * 60 * 24 * 7 });
const enableTesseractFallback = process.env.ENABLE_TESSERACT_FALLBACK === 'true';
const visionTimeoutMs = Number(process.env.OCR_VISION_TIMEOUT_MS || 18000);
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

    // Build cache key from image hash
    const bufRaw = Buffer.from(await image.arrayBuffer());
    lastUploadedBuffer = bufRaw;
    const hash = crypto.createHash('sha256').update(bufRaw).digest('hex');
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
    const full = result.fullTextAnnotation?.text?.trim();
    // Fallback to annotations array
    const detections = result.textAnnotations;
    
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
    let baseForCleaner = normalization.baseText;
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
          const j: any = await resp.json();
          const external = (j.cleaned || j.text);
          if (external && typeof external === 'string') {
            cleaned = external;
            externalApplied = true;
          }
        }
      } catch {}
    }

    // Final safety normalization
    cleaned = cleanKoreanReview(cleaned, { maskPII: true, strong: true });
    
    // 텍스트 분석 및 데이터 추출(Spacing 서비스 적용 결과 기준)
    const extractedData = analyzeReviewText(baseForCleaner);

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

    const postSteps: string[] = [];
    if (normalization.spacingApplied) postSteps.push('spacing-service');
    if (externalApplied) postSteps.push('external');
    postSteps.push('local');

    const payload = {
      ...extractedData,
      text: cleaned,
      rawText: rawFullText,
      normalizedText: cleaned,
      confidence: (Array.isArray(detections) && detections[0] && (detections[0] as any).confidence) ? (detections[0] as any).confidence : 0.9,
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
          let baseForCleaner = normalization.baseText;
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
                const j: any = await resp.json();
                const external = (j.cleaned || j.text);
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
  }

  // 평점 추출 (별점 또는 숫자)
  let rating = 5;
  const starMatch = cleaned.match(/⭐+/);
  if (starMatch) {
    rating = starMatch[0].length;
  } else {
    const ratingMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:점|\/\s*5)/);
    if (ratingMatch) {
      rating = Math.min(5, Math.max(1, parseFloat(ratingMatch[1])));
    }
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
    rating,
    date,
    author,
    business,
    reviewText: body
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

// 공통 UI 노이즈 라인 제거(플랫폼 공통 요소들)
function stripCommonNoiseLines(text: string): string {
  const rawLines = text.split('\n').map(l => l.trim());
  const uiWords = [
    '팔로우','팔로잉','프로필','번역','공유','신고','접기','더보기','지도보기','길찾기','전화',
    '좋아요','댓글','메뉴','사장님','사장님 댓글','답글','관심',
  ];
  const isSymbolOnly = (s: string) => s.length <= 3 && /^[^\w가-힣]+$/.test(s);
  const filtered = rawLines.filter(l => l && !uiWords.some(w => l === w || l.includes(w)) && !isSymbolOnly(l));
  // 상단 고정 헤더 영역 컷(텍스트 상단 10% 가정)
  // 텍스트 기반 컷이므로 첫 2~3줄에 노이즈가 몰릴 때 제거
  const startIdx = Math.min(3, Math.floor(filtered.length * 0.1));
  return filtered.slice(startIdx).join('\n').trim();
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
  const bottomNoise = ['더보기', '접기', '공유', '신고', '번역', '좋아요'];
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

  return { author, body: bodyLines.join('\n').trim(), date };
}

// Generic cleanup for platforms: drop common UI words
function parseGeneric(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const ui = ['접기', '더보기', '공유', '신고', '번역', '팔로우', '프로필'];
  return lines.filter(l => !ui.includes(l)).join('\n').trim();
}

// Heuristic re-ordering using geometry (blocks/paragraphs/words)
function rebuildReadingOrder(result: any): string | null {
  // Prefer paragraph-level reconstruction from fullTextAnnotation
  const pages = result.fullTextAnnotation?.pages || [];
  const lines: { x: number; y: number; text: string }[] = [];

  const getCenter = (vertices: any[]) => {
    const xs = vertices.map((v: any) => v.x || 0);
    const ys = vertices.map((v: any) => v.y || 0);
    const x = (Math.min(...xs) + Math.max(...xs)) / 2;
    const y = (Math.min(...ys) + Math.max(...ys)) / 2;
    const h = Math.max(...ys) - Math.min(...ys);
    return { x, y, h };
  };

  // Estimate page height for y-based trimming
  let pageMaxY = 0;
  for (const page of pages) {
    for (const block of page.blocks || []) {
      for (const para of block.paragraphs || []) {
        const words = (para.words || []).map((w: any) => (w.symbols || []).map((s: any) => s.text).join(''));
        const text = words.join(' ').trim();
        if (!text) continue;
        const { x, y } = getCenter(para.boundingBox?.vertices || []);
        pageMaxY = Math.max(pageMaxY, ...(para.boundingBox?.vertices || []).map((v: any) => v.y || 0));
        lines.push({ x, y, text });
      }
    }
  }

  // Fallback to word annotations if no paragraphs
  if (lines.length === 0 && Array.isArray(result.textAnnotations)) {
    const words = result.textAnnotations.slice(1).map((a: any) => {
      const { x, y, h } = getCenter(a.boundingPoly?.vertices || []);
      return { x, y, h, text: a.description };
    });
    if (words.length === 0) return null;
    // Group words into lines by similar Y (tolerance relative to word height)
    words.sort((a: any, b: any) => (a.y === b.y ? a.x - b.x : a.y - b.y));
    const grouped: { y: number; items: typeof words }[] = [];
    for (const w of words) {
      const band = grouped.find(g => Math.abs(g.y - w.y) <= Math.max(8, w.h * 0.6));
      if (band) {
        band.items.push(w);
        // keep representative y as average for stability
        band.y = (band.y * (band.items.length - 1) + w.y) / band.items.length;
      } else {
        grouped.push({ y: w.y, items: [w] });
      }
    }
    // Sort bands top->bottom, words left->right
    grouped.sort((a, b) => a.y - b.y);
    const rebuiltText = grouped
      .map(g => g.items.sort((a, b) => a.x - b.x).map(i => i.text).join(' '))
      .join('\n');
    return rebuiltText.trim();
  }

  // Simple multi-column handling: split by big x gaps if needed could be added later
  // Optional: cut fixed header region (top 12% by default)
  const cutRatio = Number(process.env.OCR_TOP_CUT_RATIO || 0.12);
  const yCut = pageMaxY ? pageMaxY * cutRatio : 0;
  const filtered = yCut ? lines.filter(l => l.y >= yCut) : lines;

  // Sort paragraph lines by y then x
  filtered.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  return filtered.map(l => l.text).join('\n').trim() || null;
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
