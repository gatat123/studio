import { User } from './auth.types';

// Scene related types
export interface Scene {
  id: string;
  projectId: string;
  order: number;
  title: string;
  description?: string;
  draft?: SceneImage;
  artwork?: SceneImage;
  history: SceneVersion[];
  comments: Comment[];
  annotations: Annotation[];
  status: SceneStatus;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SceneImage {
  url: string;
  uploadedAt: Date;
  uploadedBy: User;
  uploadedById: string;
  version: number;
  size: number;
  width?: number;
  height?: number;
  mimeType: string;
}

export interface SceneVersion {
  id: string;
  sceneId: string;
  type: 'draft' | 'artwork';
  url: string;
  version: number;
  uploadedBy: User;
  uploadedById: string;
  uploadedAt: Date;
  comment?: string;
}

export enum SceneStatus {
  EMPTY = 'EMPTY',
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Comment related types
export interface Comment {
  id: string;
  sceneId: string;
  userId: string;
  user: User;
  content: string;
  position?: CommentPosition;
  parentId?: string;
  replies: Comment[];
  resolved: boolean;
  pinned: boolean;
  mentions: string[];
  attachments?: CommentAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentPosition {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  page?: number; // for PDF files
}

export interface CommentAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

// Annotation type
export interface Annotation {
  id: string;
  sceneId: string;
  userId: string;
  user: User;
  type: AnnotationType;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AnnotationType {
  MARKER = 'MARKER',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  ARROW = 'ARROW',
  TEXT = 'TEXT',
}

// Bulk upload related
export interface BulkUploadResult {
  succeeded: UploadSuccess[];
  failed: UploadFailure[];
  totalFiles: number;
  uploadType: 'draft' | 'artwork' | 'both';
}

export interface UploadSuccess {
  fileName: string;
  sceneId: string;
  type: 'draft' | 'artwork';
  url: string;
}

export interface UploadFailure {
  fileName: string;
  error: string;
  reason?: string;
}
