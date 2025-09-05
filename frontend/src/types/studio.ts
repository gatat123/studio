export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Studio {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  projectCount?: number;
  role?: MemberRole;
}

export interface StudioMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface CreateStudioDto {
  name: string;
  description?: string;
}

export interface UpdateStudioDto {
  name?: string;
  description?: string;
  logo?: string;
}

export interface StudioInvite {
  id: string;
  code: string;
  studioId: string;
  role: MemberRole;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}
