// 사용자 친화적인 에러 메시지 변환 유틸리티

interface ErrorMapping {
  [key: string]: string
}

// 기술적 에러 -> 사용자 친화적 메시지 매핑
const errorMappings: ErrorMapping = {
  // 인증 관련
  'Invalid credentials': '아이디 또는 비밀번호가 올바르지 않습니다 🔑',
  'Unauthorized': '로그인이 필요한 서비스입니다 🔐',
  'Token expired': '세션이 만료되었습니다. 다시 로그인해 주세요 ⏰',
  'Invalid token': '유효하지 않은 인증입니다. 다시 로그인해 주세요',
  'User not found': '등록되지 않은 사용자입니다. 회원가입을 진행해 주세요',
  'Email already exists': '이미 사용 중인 이메일입니다. 다른 이메일을 입력해 주세요',
  'Username already taken': '이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요',
  
  // 네트워크 관련
  'Network error': '인터넷 연결을 확인해 주세요 📶',
  'Failed to fetch': '서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요',
  'Request timeout': '요청 시간이 초과되었습니다. 다시 시도해 주세요 ⏱️',
  'ECONNREFUSED': '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요',
  'ETIMEDOUT': '연결 시간이 초과되었습니다. 인터넷 연결을 확인해 주세요',
  
  // 파일 업로드 관련
  'File too large': '파일 크기가 너무 큽니다 (최대 10MB) 📎',
  'Invalid file type': '지원하지 않는 파일 형식입니다',
  'Upload failed': '파일 업로드에 실패했습니다. 다시 시도해 주세요',
  'No file selected': '파일을 선택해 주세요',
  
  // 데이터베이스 관련
  'Database error': '데이터 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요',
  'Connection pool exhausted': '서버가 바쁩니다. 잠시 후 다시 시도해 주세요',
  'Duplicate entry': '이미 존재하는 데이터입니다',
  'Foreign key constraint': '연결된 데이터가 있어 삭제할 수 없습니다',
  
  // 권한 관련
  'Permission denied': '이 작업을 수행할 권한이 없습니다 ⛔',
  'Access denied': '접근이 거부되었습니다',
  'Forbidden': '접근 권한이 없습니다',
  
  // 결제 관련
  'Payment failed': '결제 처리에 실패했습니다. 카드 정보를 확인해 주세요 💳',
  'Card declined': '카드가 거부되었습니다. 다른 카드를 사용해 주세요',
  'Insufficient funds': '잔액이 부족합니다',
  'Payment method required': '결제 수단을 등록해 주세요',
  
  // 리뷰 관련
  'Review limit exceeded': '리뷰 등록 한도를 초과했습니다. 플랜을 업그레이드해 주세요 📈',
  'Invalid review data': '리뷰 정보가 올바르지 않습니다. 다시 확인해 주세요',
  'Review not found': '리뷰를 찾을 수 없습니다',
  'Already reviewed': '이미 리뷰를 작성하셨습니다',
  
  // OCR 관련
  'OCR failed': '텍스트 추출에 실패했습니다. 더 선명한 이미지를 사용해 주세요 🔍',
  'No text detected': '이미지에서 텍스트를 찾을 수 없습니다',
  'Image quality too low': '이미지 품질이 낮습니다. 더 선명한 이미지를 사용해 주세요',
  
  // 일반 에러
  'Something went wrong': '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요 😅',
  'Bad request': '잘못된 요청입니다. 입력 정보를 확인해 주세요',
  'Not found': '요청하신 페이지를 찾을 수 없습니다',
  'Internal server error': '서버에 문제가 발생했습니다. 빠르게 해결하겠습니다 🔧',
  'Service unavailable': '서비스 점검 중입니다. 잠시 후 이용해 주세요 🚧',
}

// 에러 메시지 변환 함수
export function getUserFriendlyError(error: any): string {
  // 에러 객체에서 메시지 추출
  const errorMessage = error?.message || error?.error || error || 'Unknown error'
  
  // 매핑된 사용자 친화적 메시지 찾기
  for (const [key, value] of Object.entries(errorMappings)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  // HTTP 상태 코드 처리
  if (error?.status) {
    switch (error.status) {
      case 400:
        return '입력 정보를 다시 확인해 주세요 📝'
      case 401:
        return '로그인이 필요합니다 🔐'
      case 403:
        return '접근 권한이 없습니다 ⛔'
      case 404:
        return '요청하신 정보를 찾을 수 없습니다 🔍'
      case 429:
        return '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해 주세요 ⏱️'
      case 500:
        return '서버에 문제가 발생했습니다. 빠르게 해결하겠습니다 🔧'
      case 502:
        return '서버가 응답하지 않습니다. 잠시 후 다시 시도해 주세요'
      case 503:
        return '서비스가 일시적으로 중단되었습니다. 잠시 후 다시 시도해 주세요 🚧'
    }
  }
  
  // 특정 패턴 검사
  if (errorMessage.includes('NEXT_REDIRECT')) {
    return '페이지를 이동하는 중입니다...'
  }
  
  if (errorMessage.includes('fetch')) {
    return '서버와 통신하는 중 문제가 발생했습니다. 인터넷 연결을 확인해 주세요 📶'
  }
  
  if (errorMessage.includes('prisma') || errorMessage.includes('database')) {
    return '데이터 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요 💾'
  }
  
  // 기본 메시지
  return '문제가 발생했습니다. 잠시 후 다시 시도해 주세요 😊'
}

// 에러 토스트 표시 함수
export function showErrorToast(error: any, duration: number = 5000): void {
  const message = getUserFriendlyError(error)
  
  // 기존 토스트 제거
  const existingToast = document.getElementById('error-toast')
  if (existingToast) {
    existingToast.remove()
  }
  
  // 새 토스트 생성
  const toast = document.createElement('div')
  toast.id = 'error-toast'
  toast.className = 'fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg shadow-lg z-50 animate-slideIn'
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 text-red-500">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-red-400 hover:text-red-600">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  `
  
  document.body.appendChild(toast)
  
  // 자동 제거
  setTimeout(() => {
    if (document.getElementById('error-toast')) {
      toast.classList.add('animate-fadeOut')
      setTimeout(() => toast.remove(), 300)
    }
  }, duration)
}

// 성공 메시지 표시 함수
export function showSuccessToast(message: string, duration: number = 3000): void {
  // 기존 토스트 제거
  const existingToast = document.getElementById('success-toast')
  if (existingToast) {
    existingToast.remove()
  }
  
  // 새 토스트 생성
  const toast = document.createElement('div')
  toast.id = 'success-toast'
  toast.className = 'fixed bottom-4 right-4 max-w-md bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg shadow-lg z-50 animate-slideIn'
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 text-green-500">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-green-400 hover:text-green-600">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  `
  
  document.body.appendChild(toast)
  
  // 자동 제거
  setTimeout(() => {
    if (document.getElementById('success-toast')) {
      toast.classList.add('animate-fadeOut')
      setTimeout(() => toast.remove(), 300)
    }
  }, duration)
}