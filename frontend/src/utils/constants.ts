// API 기본 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 토큰 키
export const TOKEN_KEY = 'studio_access_token';
export const REFRESH_TOKEN_KEY = 'studio_refresh_token';

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  STUDIOS: '/studios',
  STUDIO_DETAIL: (id: string) => `/studios/${id}`,
  PROJECT_DETAIL: (studioId: string, projectId: string) => `/studios/${studioId}/projects/${projectId}`,
  SCENE_DETAIL: (studioId: string, projectId: string, sceneId: string) => `/studios/${studioId}/projects/${projectId}/scenes/${sceneId}`,
};

// 프로젝트 카테고리
export const PROJECT_CATEGORIES = {
  WEBTOON: 'webtoon',
  ILLUSTRATION: 'illustration',
  STORYBOARD: 'storyboard',
  CONCEPT: 'concept',
} as const;

// 프로젝트 상태
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// 스튜디오 멤버 역할
export const STUDIO_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

// 프로젝트 멤버 역할
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

// 씬 상태
export const SCENE_STATUS = {
  EMPTY: 'empty',
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
} as const;

// 파일 업로드 제한
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 100,
  ACCEPTED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
};

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// 알림 타입
export const NOTIFICATION_TYPES = {
  COMMENT: 'comment',
  MENTION: 'mention',
  UPLOAD: 'upload',
  STATUS_CHANGE: 'status_change',
  INVITE: 'invite',
  PROJECT_UPDATE: 'project_update',
} as const;

// WebSocket 이벤트
export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // 스튜디오
  STUDIO_JOIN: 'studio:join',
  STUDIO_LEAVE: 'studio:leave',
  STUDIO_UPDATE: 'studio:update',
  
  // 프로젝트
  PROJECT_JOIN: 'project:join',
  PROJECT_LEAVE: 'project:leave',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  // 씬
  SCENE_CREATE: 'scene:create',
  SCENE_UPDATE: 'scene:update',
  SCENE_DELETE: 'scene:delete',
  SCENE_REORDER: 'scene:reorder',
  SCENE_BULK_UPLOAD: 'scene:bulk-upload',
  
  // 댓글
  COMMENT_CREATE: 'comment:create',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  COMMENT_RESOLVE: 'comment:resolve',
  
  // 사용자
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
} as const;
