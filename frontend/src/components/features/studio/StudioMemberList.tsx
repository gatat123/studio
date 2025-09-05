'use client';

import React, { useState } from 'react';
import { User, Shield, Edit, Eye, MoreVertical, UserMinus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StudioMember, MemberRole } from '@/types/studio';
import { formatDate } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';

interface StudioMemberListProps {
  members: StudioMember[];
  currentUserRole: MemberRole;
  onRoleChange: (userId: string, newRole: MemberRole) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function StudioMemberList({
  members,
  currentUserRole,
  onRoleChange,
  onRemoveMember,
}: StudioMemberListProps) {
  const { user } = useAuth();
  const [loadingMember, setLoadingMember] = useState<string | null>(null);

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-green-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleName = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return '소유자';
      case 'admin':
        return '관리자';
      case 'editor':
        return '편집자';
      case 'viewer':
        return '뷰어';
    }
  };

  const handleRoleChange = async (userId: string, newRole: MemberRole) => {
    setLoadingMember(userId);
    try {
      await onRoleChange(userId, newRole);
    } catch (error) {
      console.error('Failed to change role:', error);
    } finally {
      setLoadingMember(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (confirm('정말 이 멤버를 제거하시겠습니까?')) {
      setLoadingMember(userId);
      try {
        await onRemoveMember(userId);
      } catch (error) {
        console.error('Failed to remove member:', error);
      } finally {
        setLoadingMember(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">스튜디오 멤버</h3>
        <p className="text-sm text-gray-500 mt-1">
          총 {members.length}명의 멤버가 있습니다.
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    {member.id === user?.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        나
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(member.role)}
                      <span className="text-sm text-gray-600">
                        {getRoleName(member.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {canManageMembers && member.role !== 'owner' && member.id !== user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingMember === member.id}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== 'admin' && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'admin')}
                      >
                        관리자로 변경
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'editor' && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'editor')}
                      >
                        편집자로 변경
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'viewer' && (
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, 'viewer')}
                      >
                        뷰어로 변경
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      멤버 제거
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              {formatDate(member.joinedAt)} 가입
            </div>
          </div>
        ))}
      </div>
      
      {canManageMembers && (
        <div className="p-4 border-t border-gray-200">
          <Button className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            멤버 초대하기
          </Button>
        </div>
      )}
    </div>
  );
}
