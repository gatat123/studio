'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types/project.types';
import { Calendar, Users, FileImage, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  studioId: string;
  onClick: () => void;
}

const statusConfig = {
  planning: { label: '기획', color: 'bg-gray-500' },
  in_progress: { label: '진행중', color: 'bg-blue-500' },
  review: { label: '검토중', color: 'bg-yellow-500' },
  completed: { label: '완료', color: 'bg-green-500' },
  archived: { label: '보관', color: 'bg-purple-500' },
};

const categoryConfig = {
  webtoon: { label: '웹툰', icon: '🎨' },
  illustration: { label: '일러스트', icon: '🖼️' },
  storyboard: { label: '스토리보드', icon: '📋' },
  concept: { label: '컨셉아트', icon: '💡' },
};

export default function ProjectCard({ project, studioId, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status];
  const category = categoryConfig[project.category];
  const sceneCount = project.scenes?.length || 0;
  const memberCount = project.collaborators?.length || 0;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <Badge 
            className={cn(status.color, 'text-white')}
            variant="default"
          >
            {status.label}
          </Badge>
          <span className="text-2xl">{category.icon}</span>
        </div>
        
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          {project.title}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {project.description}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileImage className="h-4 w-4" />
              <span>{sceneCount}개</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount}명</span>
            </div>
          </div>
          
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatRelativeTime(project.deadline)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatRelativeTime(project.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
