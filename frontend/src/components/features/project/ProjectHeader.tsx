'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types/project.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusDropdown from './StatusDropdown';
import { Settings, Share2, Calendar, Users, FileImage } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import InviteCodeModal from './InviteCodeModal';

interface ProjectHeaderProps {
  project: Project;
  studioId: string;
}

const categoryConfig = {
  webtoon: { label: '웹툰', icon: '🎨' },
  illustration: { label: '일러스트', icon: '🖼️' },
  storyboard: { label: '스토리보드', icon: '📋' },
  concept: { label: '컨셉아트', icon: '💡' },
};

export default function ProjectHeader({ project, studioId }: ProjectHeaderProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const category = categoryConfig[project.category];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              초대
            </Button>
            
            <Link href={`/studios/${studioId}/projects/${project.id}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                설정
              </Button>
            </Link>
            
            <StatusDropdown 
              projectId={project.id}
              currentStatus={project.status}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileImage className="h-4 w-4" />
            <span>{project.scenes?.length || 0}개 씬</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.collaborators?.length || 0}명 참여</span>
          </div>
          
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>마감: {format(new Date(project.deadline), 'PPP', { locale: ko })}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>생성: {formatRelativeTime(project.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">{category.label}</Badge>
          {project.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {showInviteModal && (
        <InviteCodeModal
          projectId={project.id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  );
}
