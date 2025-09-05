/**
 * 에러 처리 유틸리티
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '권한이 없습니다.') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}을(를) 찾을 수 없습니다.`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      'RATE_LIMIT',
      429,
      { retryAfter }
    );
    this.name = 'RateLimitError';
  }
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // 네트워크 에러
    if (error.message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    // 타임아웃
    if (error.message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * API 에러 처리
 */
export function handleApiError(error: any): never {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || '서버 오류가 발생했습니다.';

    switch (status) {
      case 401:
        throw new AuthenticationError(message);
      case 403:
        throw new AuthorizationError(message);
      case 404:
        throw new NotFoundError(data?.resource || '리소스');
      case 429:
        throw new RateLimitError(data?.retryAfter);
      case 400:
        throw new ValidationError(message, data?.errors);
      default:
        throw new NetworkError(message, status);
    }
  } else if (error.request) {
    throw new NetworkError('서버에 연결할 수 없습니다.');
  } else {
    throw new AppError(error.message, 'UNKNOWN_ERROR');
  }
}

/**
 * 에러 로깅
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      }),
    } : error,
  };

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Log]', errorInfo);
  }

  // 프로덕션에서는 에러 추적 서비스로 전송
  // TODO: Sentry 등 에러 추적 서비스 연동
}

/**
 * 에러 복구 전략
 */
export interface ErrorRecoveryStrategy {
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: boolean;
  };
  fallback?: () => any;
  notify?: boolean;
}

export async function withErrorRecovery<T>(
  fn: () => Promise<T>,
  strategy: ErrorRecoveryStrategy
): Promise<T> {
  const { retry, fallback, notify } = strategy;
  
  let lastError: unknown;
  let attempts = 0;
  
  if (retry) {
    while (attempts < retry.maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempts++;
        
        if (attempts < retry.maxAttempts) {
          const delay = retry.backoff
            ? retry.delay * Math.pow(2, attempts - 1)
            : retry.delay;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  } else {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  
  if (notify) {
    logError(lastError, 'ErrorRecovery');
  }
  
  if (fallback) {
    return fallback();
  }
  
  throw lastError;
}
