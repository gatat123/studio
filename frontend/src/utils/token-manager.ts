// JWT 토큰 관리 유틸리티
import { parseCookies, setCookie, destroyCookie } from 'nookies';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// 토큰 저장
export const saveTokens = (accessToken: string, refreshToken: string, rememberMe = false) => {
  const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7일 또는 1일

  // HttpOnly 쿠키로 저장 (서버사이드에서만 가능)
  // 클라이언트에서는 localStorage 사용
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    // 쿠키에도 저장 (SSR 지원)
    setCookie(null, ACCESS_TOKEN_KEY, accessToken, {
      maxAge,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    setCookie(null, REFRESH_TOKEN_KEY, refreshToken, {
      maxAge,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
};

// 토큰 가져오기
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

// 토큰 삭제
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    destroyCookie(null, ACCESS_TOKEN_KEY, { path: '/' });
    destroyCookie(null, REFRESH_TOKEN_KEY, { path: '/' });
  }
};

// 토큰 유효성 검사
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // 밀리초로 변환
    return Date.now() > exp;
  } catch {
    return true;
  }
};

// SSR에서 쿠키 가져오기
export const getServerSideTokens = (ctx: any) => {
  const cookies = parseCookies(ctx);
  return {
    accessToken: cookies[ACCESS_TOKEN_KEY] || null,
    refreshToken: cookies[REFRESH_TOKEN_KEY] || null,
  };
};
