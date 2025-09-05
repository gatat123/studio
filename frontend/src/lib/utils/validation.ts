/**
 * 입력 검증 유틸리티
 */

// 이메일 검증
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 패스워드 검증
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('패스워드는 최소 8자 이상이어야 합니다.');
  }
  
  if (password.length > 50) {
    errors.push('패스워드는 50자를 초과할 수 없습니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.');
  }
  
  if (!/\d/.test(password)) {
    errors.push('숫자를 포함해야 합니다.');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('특수문자(@$!%*?&)를 포함해야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 닉네임 검증
export function validateNickname(nickname: string): {
  isValid: boolean;
  error?: string;
} {
  if (nickname.length < 2) {
    return { isValid: false, error: '닉네임은 최소 2자 이상이어야 합니다.' };
  }
  
  if (nickname.length > 20) {
    return { isValid: false, error: '닉네임은 20자를 초과할 수 없습니다.' };
  }
  
  if (!/^[가-힣a-zA-Z0-9_]+$/.test(nickname)) {
    return { 
      isValid: false, 
      error: '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.' 
    };
  }
  
  return { isValid: true };
}

// XSS 방지 - HTML 이스케이프
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
}

// 위험한 스크립트 태그 제거
export function sanitizeInput(input: string): string {
  // 스크립트 태그 제거
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 이벤트 핸들러 제거
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  
  // javascript: 프로토콜 제거
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

// URL 검증
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

// 파일 타입 검증
export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  const fileType = file.type.toLowerCase();
  return allowedTypes.some(type => fileType.startsWith(type));
}

// 파일 크기 검증
export function validateFileSize(
  file: File,
  maxSizeInMB: number
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// 이미지 파일 검증
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validateFileType(file, allowedTypes)) {
    return { 
      isValid: false, 
      error: 'JPG, PNG, GIF, WebP 형식만 지원됩니다.' 
    };
  }
  
  if (!validateFileSize(file, 10)) {
    return { 
      isValid: false, 
      error: '파일 크기는 10MB를 초과할 수 없습니다.' 
    };
  }
  
  return { isValid: true };
}

// 폼 데이터 검증 헬퍼
export class FormValidator {
  private errors: Map<string, string> = new Map();
  
  addError(field: string, message: string) {
    this.errors.set(field, message);
  }
  
  clearError(field: string) {
    this.errors.delete(field);
  }
  
  clearAllErrors() {
    this.errors.clear();
  }
  
  hasError(field: string): boolean {
    return this.errors.has(field);
  }
  
  getError(field: string): string | undefined {
    return this.errors.get(field);
  }
  
  getAllErrors(): Record<string, string> {
    const errorObj: Record<string, string> = {};
    this.errors.forEach((value, key) => {
      errorObj[key] = value;
    });
    return errorObj;
  }
  
  isValid(): boolean {
    return this.errors.size === 0;
  }
  
  // 이메일 필드 검증
  validateEmailField(email: string): boolean {
    if (!email) {
      this.addError('email', '이메일을 입력해주세요.');
      return false;
    }
    
    if (!validateEmail(email)) {
      this.addError('email', '올바른 이메일 형식이 아닙니다.');
      return false;
    }
    
    this.clearError('email');
    return true;
  }
  
  // 패스워드 필드 검증
  validatePasswordField(password: string): boolean {
    const result = validatePassword(password);
    
    if (!result.isValid) {
      this.addError('password', result.errors[0]);
      return false;
    }
    
    this.clearError('password');
    return true;
  }
  
  // 닉네임 필드 검증
  validateNicknameField(nickname: string): boolean {
    const result = validateNickname(nickname);
    
    if (!result.isValid && result.error) {
      this.addError('nickname', result.error);
      return false;
    }
    
    this.clearError('nickname');
    return true;
  }
}

// 디바운스 검증 (실시간 입력 검증용)
export function debounceValidation(
  validator: (...args: any[]) => any,
  delay: number = 500
) {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(validator(...args));
      }, delay);
    });
  };
}
