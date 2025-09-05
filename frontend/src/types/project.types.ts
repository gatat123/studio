import { User } from './auth.types';

// Studio related types
export interface Studio {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  owner: User;
  ownerId: string;
  members: StudioMember[];
  projects: Project[];
  inviteCode?: string;
  settings: StudioSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudioMember {
  id: string;
  studioId: string;
  userId: string;
  user: User;
  role: StudioRole;
  joinedAt: Date;
}

export enum StudioRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface StudioSettings {
  allowPublicJoin: boolean;
  requireApproval: boolean;
  notificationEnabled: boolean;
  defaultProjectVisibility: ProjectVisibility;
}

// Project related types
export interface Project {
  id: string;
  studioId: string;
  studio?: Studio;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  deadline?: Date;
  thumbnail?: string;
  scenes: Scene[];
  collaborators: ProjectMember[];
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deleteType?: DeleteType;
  backupUrl?: string;
}

export enum ProjectCategory {
  WEBTOON = 'WEBTOON',
  ILLUSTRATION = 'ILLUSTRATION',
  STORYBOARD = 'STORYBOARD',
  CONCEPT = 'CONCEPT',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum ProjectVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  STUDIO_ONLY = 'STUDIO_ONLY',
}

export enum DeleteType {
  SOFT = 'SOFT',
  IMMEDIATE = 'IMMEDIATE',
  ARCHIVED = 'ARCHIVED',
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  role: ProjectRole;
  joinedAt: Date;
}

export enum ProjectRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
