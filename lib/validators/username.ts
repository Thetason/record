const DEFAULT_RESERVED = new Set([
  'admin',
  'root',
  'api',
  'www',
  'mail',
  'ftp',
  'test',
  'guest',
  'user',
  'null',
  'undefined'
]);

export type UsernameValidationOptions = {
  minLength?: number;
  maxLength?: number;
  hardMaxLength?: number;
  reserved?: string[];
};

export type UsernameValidationSuccess = {
  ok: true;
  value: string;
  truncated: boolean;
};

export type UsernameValidationFailure = {
  ok: false;
  status: number;
  message: string;
};

export type UsernameValidationResult =
  | UsernameValidationSuccess
  | UsernameValidationFailure;

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export function validateAndNormalizeUsername(
  raw: unknown,
  options: UsernameValidationOptions = {}
): UsernameValidationResult {
  const {
    minLength = 3,
    maxLength = 20,
    hardMaxLength = 256,
    reserved
  } = options;

  if (typeof raw !== 'string') {
    return {
      ok: false,
      status: 400,
      message: '사용자명을 입력해주세요'
    };
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      ok: false,
      status: 400,
      message: '사용자명을 입력해주세요'
    };
  }

  if (trimmed.length > hardMaxLength) {
    return {
      ok: false,
      status: 414,
      message: '사용자명이 너무 깁니다'
    };
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      ok: false,
      status: 400,
      message: '사용자명은 3-20자의 영문자, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다'
    };
  }

  if (trimmed.length < minLength) {
    return {
      ok: false,
      status: 400,
      message: '사용자명은 3자 이상이어야 합니다'
    };
  }

  let normalized = trimmed;
  let truncated = false;

  if (trimmed.length > maxLength) {
    normalized = trimmed.slice(0, maxLength);
    truncated = true;
  }

  const reservedSet = new Set(
    reserved?.map(value => value.toLowerCase()) ?? DEFAULT_RESERVED
  );

  if (reservedSet.has(normalized.toLowerCase())) {
    return {
      ok: false,
      status: 400,
      message: '이 사용자명은 사용할 수 없습니다'
    };
  }

  return {
    ok: true,
    value: normalized,
    truncated
  };
}
