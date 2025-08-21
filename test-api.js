#!/usr/bin/env node

/**
 * 리뷰 API 엔드포인트 테스트 스크립트
 */

const BASE_URL = 'http://localhost:3001';
let authCookie = '';

// 테스트 유틸 함수들
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie,
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { status: 0, data: { error: error.message }, ok: false };
  }
};

const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('---');
};

// 테스트 데이터
const testReview = {
  platform: "네이버",
  business: "테스트 업체",
  rating: 5,
  content: "훌륭한 서비스였습니다. 정말 만족합니다!",
  author: "김**",
  reviewDate: "2024-01-15",
  originalUrl: "https://example.com/review/123"
};

const updatedReview = {
  platform: "카카오맵",
  business: "수정된 업체명",
  rating: 4,
  content: "수정된 리뷰 내용입니다.",
  author: "이**",
  reviewDate: "2024-01-20"
};

// 테스트 함수들
async function testAuth() {
  log('=== 인증 테스트 ===');
  
  // 인증되지 않은 요청 테스트
  const unauthResult = await makeRequest(`${BASE_URL}/api/reviews`);
  log('인증 없이 리뷰 조회:', unauthResult);
  
  if (unauthResult.status === 401) {
    console.log('✅ 인증 없이 접근 시 401 반환 - 정상');
  } else {
    console.log('❌ 인증 없이 접근할 수 있음 - 보안 문제');
  }
}

async function testCreateReview() {
  log('=== 리뷰 생성 테스트 ===');
  
  const result = await makeRequest(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    body: JSON.stringify(testReview)
  });
  
  log('리뷰 생성 결과:', result);
  
  if (result.ok) {
    console.log('✅ 리뷰 생성 성공');
    return result.data.id;
  } else {
    console.log('❌ 리뷰 생성 실패');
    return null;
  }
}

async function testGetReviews() {
  log('=== 리뷰 조회 테스트 ===');
  
  const result = await makeRequest(`${BASE_URL}/api/reviews`);
  log('리뷰 조회 결과:', result);
  
  if (result.ok) {
    console.log('✅ 리뷰 조회 성공');
    return result.data;
  } else {
    console.log('❌ 리뷰 조회 실패');
    return null;
  }
}

async function testGetReviewById(reviewId) {
  log('=== 특정 리뷰 조회 테스트 ===');
  
  const result = await makeRequest(`${BASE_URL}/api/reviews/${reviewId}`);
  log('특정 리뷰 조회 결과:', result);
  
  if (result.ok) {
    console.log('✅ 특정 리뷰 조회 성공');
    return result.data;
  } else {
    console.log('❌ 특정 리뷰 조회 실패');
    return null;
  }
}

async function testUpdateReview(reviewId) {
  log('=== 리뷰 수정 테스트 ===');
  
  const result = await makeRequest(`${BASE_URL}/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedReview)
  });
  
  log('리뷰 수정 결과:', result);
  
  if (result.ok) {
    console.log('✅ 리뷰 수정 성공');
    return result.data;
  } else {
    console.log('❌ 리뷰 수정 실패');
    return null;
  }
}

async function testDeleteReview(reviewId) {
  log('=== 리뷰 삭제 테스트 ===');
  
  const result = await makeRequest(`${BASE_URL}/api/reviews/${reviewId}`, {
    method: 'DELETE'
  });
  
  log('리뷰 삭제 결과:', result);
  
  if (result.ok) {
    console.log('✅ 리뷰 삭제 성공');
    return true;
  } else {
    console.log('❌ 리뷰 삭제 실패');
    return false;
  }
}

async function testSearchAndFilter() {
  log('=== 검색/필터링 테스트 ===');
  
  // 플랫폼 필터링
  const platformResult = await makeRequest(`${BASE_URL}/api/reviews?platform=네이버`);
  log('플랫폼 필터링 결과:', platformResult);
  
  // 검색
  const searchResult = await makeRequest(`${BASE_URL}/api/reviews?search=테스트`);
  log('검색 결과:', searchResult);
  
  // 페이지네이션
  const paginationResult = await makeRequest(`${BASE_URL}/api/reviews?page=1&limit=5`);
  log('페이지네이션 결과:', paginationResult);
}

async function testValidation() {
  log('=== 입력 검증 테스트 ===');
  
  // 필수 필드 누락
  const invalidReview1 = {
    platform: "네이버",
    business: "테스트 업체"
    // rating, content, author, reviewDate 누락
  };
  
  const result1 = await makeRequest(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    body: JSON.stringify(invalidReview1)
  });
  
  log('필수 필드 누락 테스트:', result1);
  
  // 잘못된 평점
  const invalidReview2 = {
    ...testReview,
    rating: 6 // 1-5 범위 초과
  };
  
  const result2 = await makeRequest(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    body: JSON.stringify(invalidReview2)
  });
  
  log('잘못된 평점 테스트:', result2);
}

// 메인 테스트 실행
async function runTests() {
  console.log('🚀 리뷰 API 테스트 시작\n');
  
  try {
    // 1. 인증 테스트
    await testAuth();
    
    // 인증이 필요하므로 여기서 테스트 중단
    console.log('⚠️  인증이 필요합니다. 실제 브라우저에서 로그인 후 쿠키를 가져와야 합니다.');
    console.log('또는 테스트용 인증 우회 코드를 추가해야 합니다.');
    
    // 입력 검증 테스트는 실행 가능
    await testValidation();
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
  
  console.log('\n🏁 테스트 완료');
}

// Node.js fetch polyfill
if (!global.fetch) {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

runTests();