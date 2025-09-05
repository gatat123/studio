'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Edit3, Eye } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';

interface Member {
  id: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    avatar?: string;
  };
  role: 'viewer' | 'editor' | 'admin';
  joinedAt: string;
}

interface ProjectMembersProps {
  projectId: string;
  members: Member[];
}

const roleConfig = {
  viewer: { label: '열람자', icon: Eye, color: 'bg-gray-500' },
  editor: { label: '편집자', icon: Edit3, color: 'bg-blue-500' },
  admin: { label: '관리자', icon: Shield, color: 'bg-purple-500' },
};

export default function ProjectMembers({ projectId, members }: ProjectMembersProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        아직 프로젝트 멤버가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(member => {
        const roleInfo = roleConfig[member.role];
        const RoleIcon = roleInfo.icon;
        
        return (
          <div 
            key={member.id}
            className="flex items-center gap-3 p-4 border rounded-lg"
          >
            <Avatar>
              <AvatarImage src={member.user.avatar} />
              <AvatarFallback>
                {member.user.nickname?.[0]?.toUpperCase() || 
                 member.user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-medium">
                {member.user.nickname || member.user.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  className={`${roleInfo.color} text-white`}
                  variant="default"
                >
                  <RoleIcon className="mr-1 h-3 w-3" />
                  {roleInfo.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(member.joinedAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
