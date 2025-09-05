// Frontend shared types
export * from './auth.types';
export * from './project.types';
export * from './scene.types';

// Additional common types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  projectId: string;
  type: 'ONE_TIME' | 'PERMANENT' | 'LIMITED';
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  createdBy: string;
  createdAt: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  database: boolean;
  storage: boolean;
  services: {
    name: string;
    status: boolean;
  }[];
  timestamp: Date;
}
