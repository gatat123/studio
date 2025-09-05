'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { updateMemberRole, removeMember } from '@/lib/api/projects';
import { useToast } from '@/hooks/use-toast';
import { UserX, Shield, Edit3, Eye } from 'lucide-react';

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

interface ProjectMemberManagerProps {
  projectId: string;
  members: Member[];
}

const roleConfig = {
  viewer: { label: '열람자', icon: Eye, color: 'bg-gray-500' },
  editor: { label: '편집자', icon: Edit3, color: 'bg-blue-500' },
  admin: { label: '관리자', icon: Shield, color: 'bg-purple-500' },
};

export default function ProjectMemberManager({ projectId, members: initialMembers }: ProjectMemberManagerProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setLoadingStates(prev => ({ ...prev, [memberId]: true }));
    
    try {
      await updateMemberRole(projectId, memberId, newRole as 'viewer' | 'editor' | 'admin');
      
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole as 'viewer' | 'editor' | 'admin' }
          : member
      ));
      
      toast({
        title: '권한 변경 완료',
        description: '멤버 권한이 변경되었습니다.',
      });
    } catch (error) {
      toast({
        title: '권한 변경 실패',
        description: '권한 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoadingStates(prev => ({ ...prev, [memberId]: true }));
    
    try {
      await removeMember(projectId, memberId);
      
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: '멤버 제거 완료',
        description: '멤버가 프로젝트에서 제거되었습니다.',
      });
    } catch (error) {
      toast({
        title: '멤버 제거 실패',
        description: '멤버 제거 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          아직 프로젝트 멤버가 없습니다. 초대 코드를 생성하여 멤버를 초대하세요.
        </p>
      ) : (
        <div className="space-y-2">
          {members.map(member => {
            const roleInfo = roleConfig[member.role];
            const RoleIcon = roleInfo.icon;
            
            return (
              <div 
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>
                      {member.user.nickname?.[0]?.toUpperCase() || 
                       member.user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.user.nickname || member.user.email}</p>
                      <Badge className={`${roleInfo.color} text-white`}>
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                    disabled={loadingStates[member.id]}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">열람자</SelectItem>
                      <SelectItem value="editor">편집자</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm"
                        variant="outline"
                        disabled={loadingStates[member.id]}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>멤버 제거</AlertDialogTitle>
                        <AlertDialogDescription>
                          {member.user.nickname || member.user.email}님을 프로젝트에서 제거하시겠습니까?
                          이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          제거
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
