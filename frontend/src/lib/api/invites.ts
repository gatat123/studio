import { API_BASE_URL } from './client';

interface InviteCode {
  id: string;
  code: string;
  type: 'one-time' | 'permanent' | 'limited';
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  role: 'viewer' | 'editor' | 'admin';
  createdAt: string;
}

// 초대 코드 생성
export async function generateInviteCode(
  projectId: string,
  options: {
    type: 'one-time' | 'permanent' | 'limited';
    role: 'viewer' | 'editor' | 'admin';
    maxUses?: number;
    expiresAt?: Date;
  }
): Promise<InviteCode> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/invite-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(options),
  });
  
  if (!response.ok) throw new Error('Failed to generate invite code');
  return response.json();
}

// 초대 코드 목록 조회
export async function getInviteCodes(projectId: string): Promise<InviteCode[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/invite-codes`, {
      credentials: 'include',
    });
    
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    return [];
  }
}

// 초대 코드 삭제
export async function deleteInviteCode(
  projectId: string,
  codeId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/invite-codes/${codeId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );
  
  if (!response.ok) throw new Error('Failed to delete invite code');
}

// 초대 코드로 프로젝트 참가
export async function joinProjectWithCode(code: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/join/${code}`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Failed to join project');
}
