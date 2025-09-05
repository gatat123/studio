'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/use-toast';

interface InviteCode {
  id: string;
  code: string;
  type: 'one-time' | 'permanent' | 'limited';
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  role: 'viewer' | 'editor' | 'admin';
  createdAt: Date;
  createdBy: string;
}

export function useInviteCode(projectId: string) {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch invite codes
  const fetchInviteCodes = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/projects/${projectId}/invite-codes`);
      setInviteCodes(response.data);
    } catch (error) {
      console.error('Failed to fetch invite codes:', error);
      toast({
        title: '오류',
        description: '초대 코드를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Generate new invite code
  const generateInviteCode = useCallback(async (options: {
    type: 'one-time' | 'permanent' | 'limited';
    maxUses?: number;
    expiresAt?: Date;
    role: 'viewer' | 'editor' | 'admin';
  }): Promise<InviteCode> => {
    const response = await api.post(`/api/projects/${projectId}/invite-code`, options);
    const newCode = response.data;
    
    // Update local state
    setInviteCodes(prev => [...prev, newCode]);
    
    return newCode;
  }, [projectId]);

  // Delete invite code
  const deleteInviteCode = useCallback(async (code: string) => {
    await api.delete(`/api/projects/${projectId}/invite-codes/${code}`);
    
    // Update local state
    setInviteCodes(prev => prev.filter(ic => ic.code !== code));
  }, [projectId]);

  // Validate invite code
  const validateInviteCode = useCallback(async (code: string) => {
    const response = await api.get(`/api/projects/validate-invite/${code}`);
    return response.data;
  }, []);

  // Join project by invite code
  const joinByInviteCode = useCallback(async (code: string) => {
    const response = await api.post(`/api/projects/join/${code}`);
    return response.data;
  }, []);

  return {
    inviteCodes,
    loading,
    fetchInviteCodes,
    generateInviteCode,
    deleteInviteCode,
    validateInviteCode,
    joinByInviteCode,
  };
}