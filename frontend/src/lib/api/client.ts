import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { handleApiError, logError, withErrorRecovery } from '@/lib/errors/error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// CSRF Token storage
let csrfToken: string | null = null;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃
  withCredentials: true, // 쿠키 포함
});

// XSS 방지: Response sanitization
function sanitizeResponse(data: any): any {
  if (typeof data === 'string') {
    // HTML 엔티티 디코딩 방지
    return data.replace(/[<>]/g, '');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeResponse);
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      sanitized[key] = sanitizeResponse(data[key]);
    }
    return sanitized;
  }
  return data;
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Auth token 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF token 추가 (POST, PUT, DELETE 요청에만)
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      if (!csrfToken) {
        // CSRF 토큰 가져오기
        try {
          const response = await axios.get(`${API_BASE_URL}/csrf-token`);
          csrfToken = response.data.token;
        } catch (error) {
          logError(error, 'CSRF Token Fetch');
        }
      }
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Request ID 추가 (추적용)
    config.headers['X-Request-ID'] = crypto.randomUUID();

    return config;
  },
  (error) => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // XSS 방지를 위한 response sanitization
    if (process.env.NODE_ENV === 'production') {
      response.data = sanitizeResponse(response.data);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // 401 에러 처리
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      csrfToken = null;
      
      // 로그인 페이지로 리다이렉트 (로그인 페이지 자체는 제외)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // 429 Rate Limit 에러 처리
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      logError(
        { status: 429, retryAfter },
        'Rate Limit Exceeded'
      );
    }

    // API 에러 핸들링
    handleApiError(error);
  }
);

// 보안이 강화된 API 요청 함수
interface SecureRequestOptions extends AxiosRequestConfig {
  retry?: {
    maxAttempts?: number;
    delay?: number;
  };
  sanitize?: boolean;
}

export async function secureRequest<T = any>(
  config: SecureRequestOptions
): Promise<T> {
  const { retry, sanitize = true, ...axiosConfig } = config;

  const makeRequest = async () => {
    const response = await apiClient.request<T>(axiosConfig);
    return sanitize ? sanitizeResponse(response.data) : response.data;
  };

  if (retry) {
    return withErrorRecovery(makeRequest, {
      retry: {
        maxAttempts: retry.maxAttempts || 3,
        delay: retry.delay || 1000,
        backoff: true,
      },
      notify: true,
    });
  }

  return makeRequest();
}

// 파일 업로드용 특별 클라이언트
export const fileUploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5분 타임아웃 (대용량 파일)
  withCredentials: true,
});

fileUploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 파일 업로드는 브라우저가 Content-Type을 자동 설정
    delete config.headers['Content-Type'];
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

fileUploadClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    handleApiError(error);
  }
);

// 유틸리티 함수들
export const api = {
  get: <T = any>(url: string, config?: SecureRequestOptions) =>
    secureRequest<T>({ ...config, method: 'GET', url }),
    
  post: <T = any>(url: string, data?: any, config?: SecureRequestOptions) =>
    secureRequest<T>({ ...config, method: 'POST', url, data }),
    
  put: <T = any>(url: string, data?: any, config?: SecureRequestOptions) =>
    secureRequest<T>({ ...config, method: 'PUT', url, data }),
    
  patch: <T = any>(url: string, data?: any, config?: SecureRequestOptions) =>
    secureRequest<T>({ ...config, method: 'PATCH', url, data }),
    
  delete: <T = any>(url: string, config?: SecureRequestOptions) =>
    secureRequest<T>({ ...config, method: 'DELETE', url }),
    
  uploadFile: (url: string, formData: FormData, onProgress?: (progress: number) => void) =>
    fileUploadClient.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }),
};
