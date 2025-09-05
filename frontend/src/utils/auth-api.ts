import apiClient from '@/utils/api-client';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  PasswordResetRequest,
  PasswordReset,
  EmailVerification,
} from '@/types/auth.types';

// 로그인
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// 회원가입
export const registerApi = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email: credentials.email,
    password: credentials.password,
    nickname: credentials.nickname,
  });
  return response.data;
};

// 로그아웃
export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// 토큰 갱신
export const refreshTokenApi = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  });
  return response.data;
};

// 현재 사용자 정보 조회
export const getCurrentUserApi = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// 프로필 업데이트
export const updateProfileApi = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<User>('/auth/profile', data);
  return response.data;
};

// 비밀번호 재설정 요청
export const requestPasswordResetApi = async (data: PasswordResetRequest): Promise<void> => {
  await apiClient.post('/auth/forgot-password', data);
};

// 비밀번호 재설정
export const resetPasswordApi = async (data: PasswordReset): Promise<void> => {
  await apiClient.post('/auth/reset-password', data);
};

// 이메일 인증
export const verifyEmailApi = async (data: EmailVerification): Promise<void> => {
  await apiClient.post('/auth/verify-email', data);
};

// 이메일 중복 확인
export const checkEmailApi = async (email: string): Promise<boolean> => {
  const response = await apiClient.get<{ available: boolean }>('/auth/check-email', {
    params: { email },
  });
  return response.data.available;
};
