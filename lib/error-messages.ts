// 사용자 친화적인 에러 메시지 매핑
export const errorMessages: Record<string, string> = {
  // 인증 관련
  'Invalid credentials': '아이디 또는 비밀번호가 올바르지 않습니다.',
  'User not found': '등록되지 않은 사용자입니다.',
  'Email already exists': '이미 가입된 이메일입니다.',
  'Username already taken': '이미 사용 중인 아이디입니다.',
  'Password too weak': '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.',
  'Session expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'Unauthorized': '로그인이 필요한 서비스입니다.',
  'Access denied': '접근 권한이 없습니다.',
  
  // 유효성 검사
  'Required field': '필수 입력 항목입니다.',
  'Invalid email format': '올바른 이메일 형식이 아닙니다.',
  'Invalid phone format': '올바른 전화번호 형식이 아닙니다.',
  'File too large': '파일 크기가 너무 큽니다. (최대 10MB)',
  'Invalid file type': '지원하지 않는 파일 형식입니다.',
  
  // 리뷰 관련
  'Review limit exceeded': '무료 플랜의 리뷰 한도(50개)를 초과했습니다.',
  'Duplicate review': '이미 등록된 리뷰입니다.',
  'Review not found': '리뷰를 찾을 수 없습니다.',
  'Invalid review data': '리뷰 정보가 올바르지 않습니다.',
  
  // 네트워크 에러
  'Network error': '네트워크 연결을 확인해주세요.',
  'Server error': '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  'Rate limit exceeded': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  
  // 데이터베이스
  'Database connection error': '데이터베이스 연결에 실패했습니다.',
  'Transaction failed': '작업 처리 중 오류가 발생했습니다.',
  'Data not found': '요청한 데이터를 찾을 수 없습니다.',
  'Connection pool exhausted': '서버가 바쁩니다. 잠시 후 다시 시도해 주세요',
  
  // 결제 관련
  'Payment failed': '결제 처리에 실패했습니다.',
  'Invalid card': '유효하지 않은 카드 정보입니다.',
  'Insufficient funds': '잔액이 부족합니다.',
  'Payment already processed': '이미 처리된 결제입니다.',
  
  // 파일 업로드
  'Upload failed': '파일 업로드에 실패했습니다.',
  'Invalid image': '이미지 파일이 손상되었거나 지원하지 않는 형식입니다.',
  'OCR failed': '텍스트 인식에 실패했습니다. 더 선명한 이미지를 사용해주세요.',
  
  // 일반 에러
  'Something went wrong': '예기치 않은 오류가 발생했습니다.',
  'Try again later': '잠시 후 다시 시도해주세요.',
  'Contact support': '지속적으로 문제가 발생하면 고객센터로 문의해주세요.',
};

// 에러 코드를 사용자 친화적 메시지로 변환
export function getUserFriendlyError(error: string | Error | unknown): string {
  // Error 객체인 경우
  if (error instanceof Error) {
    const message = error.message;
    
    // 매핑된 메시지가 있는 경우
    for (const [key, value] of Object.entries(errorMessages)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // 특정 에러 타입 처리
    if (error.name === 'TypeError') {
      return '데이터 처리 중 오류가 발생했습니다.';
    }
    if (error.name === 'SyntaxError') {
      return '입력한 정보가 올바르지 않습니다.';
    }
    
    return errorMessages['Something went wrong'];
  }
  
  // 문자열인 경우
  if (typeof error === 'string') {
    return errorMessages[error] || error;
  }
  
  // 기본 메시지
  return errorMessages['Something went wrong'];
}

// 에러 타입별 아이콘 매핑
export const errorIcons = {
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  success: '✅',
};

// 에러 심각도 레벨
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 에러 카테고리
export enum ErrorCategory {
  AUTH = 'auth',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  PAYMENT = 'payment',
  FILE = 'file',
  GENERAL = 'general',
}

// 구조화된 에러 응답
export interface ErrorResponse {
  message: string;
  code?: string;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  details?: unknown;
  timestamp?: string;
  requestId?: string;
}
