// Comment related type definitions

export interface Comment {
  id: string;
  sceneId: string;
  projectId: string;
  userId: string;
  content: string;
  
  // Position on image (percentage based)
  position?: {
    x: number; // 0-100
    y: number; // 0-100
    page?: number; // For PDF
  };
  
  // Thread management
  parentId?: string | null;
  replies?: Comment[];
  
  // Status
  resolved: boolean;
  pinned: boolean;
  
  // User info
  user?: {
    id: string;
    nickname: string;
    email: string;
    profileImage?: string;
  };
  
  // Mentions
  mentions: string[]; // Array of user IDs
  mentionedUsers?: {
    id: string;
    nickname: string;
    email: string;
  }[];
  
  // Attachments
  attachments?: CommentAttachment[];
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CommentAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface CommentMarker {
  commentId: string;
  position: {
    x: number;
    y: number;
  };
  resolved: boolean;
  hasReplies: boolean;
  user?: {
    nickname: string;
    profileImage?: string;
  };
}

export interface CreateCommentDto {
  sceneId: string;
  content: string;
  position?: {
    x: number;
    y: number;
    page?: number;
  };
  parentId?: string;
  mentions?: string[];
  attachments?: File[];
}

export interface UpdateCommentDto {
  content?: string;
  resolved?: boolean;
  pinned?: boolean;
  mentions?: string[];
}

export interface CommentFilter {
  resolved?: boolean;
  pinned?: boolean;
  userId?: string;
  hasPosition?: boolean;
  parentId?: string | null;
}

export interface CommentNotification {
  id: string;
  type: 'mention' | 'reply' | 'resolve';
  commentId: string;
  projectId: string;
  sceneId: string;
  fromUser: {
    id: string;
    nickname: string;
    profileImage?: string;
  };
  message: string;
  read: boolean;
  createdAt: Date | string;
}
