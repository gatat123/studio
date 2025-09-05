'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Studio, 
  StudioMember, 
  CreateStudioDto, 
  UpdateStudioDto,
  StudioInvite,
  MemberRole 
} from '@/types/studio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function useStudio(studioId?: string) {
  const router = useRouter();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [invites, setInvites] = useState<StudioInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 스튜디오 목록 조회
  const fetchStudios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/studios`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch studios');
      
      const data = await response.json();
      setStudios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // 단일 스튜디오 조회
  const fetchStudio = useCallback(async () => {
    if (!studioId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/studios/${studioId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch studio');
      
      const data = await response.json();
      setStudio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [studioId]);

  // 스튜디오 멤버 조회
  const fetchMembers = useCallback(async () => {
    if (!studioId) return;
    
    try {
      const response = await fetch(`${API_URL}/studios/${studioId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch members');
      
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  }, [studioId]);

  // 스튜디오 생성
  const createStudio = async (data: CreateStudioDto): Promise<Studio> => {
    const response = await fetch(`${API_URL}/studios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to create studio');
    
    return response.json();
  };

  // 스튜디오 업데이트
  const updateStudio = async (data: UpdateStudioDto): Promise<Studio> => {
    if (!studioId) throw new Error('Studio ID is required');
    
    const response = await fetch(`${API_URL}/studios/${studioId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to update studio');
    
    const updatedStudio = await response.json();
    setStudio(updatedStudio);
    return updatedStudio;
  };

  // 스튜디오 삭제
  const deleteStudio = async (): Promise<void> => {
    if (!studioId) throw new Error('Studio ID is required');
    
    const response = await fetch(`${API_URL}/studios/${studioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to delete studio');
    
    router.push('/studios');
  };

  // 멤버 역할 변경
  const changeMemberRole = async (userId: string, newRole: MemberRole): Promise<void> => {
    if (!studioId) throw new Error('Studio ID is required');
    
    const response = await fetch(`${API_URL}/studios/${studioId}/members/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    
    if (!response.ok) throw new Error('Failed to change member role');
    
    await fetchMembers();
  };

  // 멤버 제거
  const removeMember = async (userId: string): Promise<void> => {
    if (!studioId) throw new Error('Studio ID is required');
    
    const response = await fetch(`${API_URL}/studios/${studioId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to remove member');
    
    await fetchMembers();
  };

  // 초대 코드 생성
  const createInvite = async (role: MemberRole, maxUses?: number): Promise<StudioInvite> => {
    if (!studioId) throw new Error('Studio ID is required');
    
    const response = await fetch(`${API_URL}/studios/${studioId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ role, maxUses }),
    });
    
    if (!response.ok) throw new Error('Failed to create invite');
    
    const invite = await response.json();
    setInvites([...invites, invite]);
    return invite;
  };

  // 초대 이메일 발송
  const sendInviteEmail = async (email: string, role: MemberRole): Promise<void> => {
    if (!studioId) throw new Error('Studio ID is required');
    
    const response = await fetch(`${API_URL}/studios/${studioId}/invite-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ email, role }),
    });
    
    if (!response.ok) throw new Error('Failed to send invite email');
  };

  useEffect(() => {
    if (studioId) {
      fetchStudio();
      fetchMembers();
    } else {
      fetchStudios();
    }
  }, [studioId, fetchStudio, fetchMembers, fetchStudios]);

  return {
    studio,
    studios,
    members,
    invites,
    loading,
    error,
    createStudio,
    updateStudio,
    deleteStudio,
    changeMemberRole,
    removeMember,
    createInvite,
    sendInviteEmail,
    refetch: studioId ? fetchStudio : fetchStudios,
  };
}
