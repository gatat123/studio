// User related types
export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDIO_OWNER = 'STUDIO_OWNER',
  ARTIST = 'ARTIST',
  REVIEWER = 'REVIEWER',
  VIEWER = 'VIEWER',
}

// Auth related types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nickname?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
