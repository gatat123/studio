// Comment Types
export interface Comment {
  id: string;
  sceneId: string;
  userId: string;
  author: {
    id: string;
    email: string;
    nickname: string;
    avatar?: string;
  };
  content: string;
  positionX?: number;
  positionY?: number;
  page?: number;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  resolved: boolean;
  pinned: boolean;
  mentions?: string[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  positionX?: number;
  positionY?: number;
  page?: number;
  parentId?: string;
  mentions?: string[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

export interface UpdateCommentDto {
  content?: string;
  resolved?: boolean;
  pinned?: boolean;
}