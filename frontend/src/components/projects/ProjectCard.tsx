'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, FolderOpen, Palette, Storyboard, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface Project {
  id: string;
  title: string;
  description?: string;
  category: 'webtoon' | 'illustration' | 'storyboard' | 'concept';
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'archived';
  deadline?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    scenes: number;
    projectMembers: number;
  };
}

interface ProjectCardProps {
  project: Project;
  studioId: string;
}

const categoryIcons = {
  webtoon: FolderOpen,
  illustration: Palette,
  storyboard: Storyboard,
  concept: FileImage,
};

const categoryLabels = {
  webtoon: '웹툰',
  illustration: '일러스트',
  storyboard: '스토리보드',
  concept: '컨셉아트',
};

const statusColors = {
  planning: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-purple-100 text-purple-800',
};

const statusLabels = {
  planning: '기획중',
  in_progress: '진행중',
  review: '검토중',
  completed: '완료',
  archived: '보관됨',
};

export default function ProjectCard({ project, studioId }: ProjectCardProps) {
  const CategoryIcon = categoryIcons[project.category];

  return (
    <Link href={`/studios/${studioId}/projects/${project.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
          {/* 썸네일 영역 */}
          {project.thumbnail && (
            <div className="relative h-48 bg-gray-100">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              <Badge className={`ml-2 ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* 카테고리 및 메타 정보 */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CategoryIcon className="h-4 w-4" />
                <span>{categoryLabels[project.category]}</span>
              </div>
              
              {project._count && (
                <>
                  <div className="flex items-center gap-1">
                    <FileImage className="h-4 w-4" />
                    <span>{project._count.scenes} 씬</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{project._count.projectMembers}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* 날짜 정보 */}
            <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
            
            {/* 마감일 표시 */}
            {project.deadline && (
              <div className="mt-2">
                <div className="text-xs text-red-600">
                  마감: {new Date(project.deadline).toLocaleDateString('ko-KR')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}