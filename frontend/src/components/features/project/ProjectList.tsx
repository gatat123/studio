'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Project } from '@/lib/types/project.types';
import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProjectListProps {
  projects: Project[];
  studioId: string;
}

export default function ProjectList({ projects, studioId }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 필터링 로직
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'newest';
  
  let filteredProjects = [...projects];
  
  // 상태 필터
  if (status) {
    filteredProjects = filteredProjects.filter(p => p.status === status);
  }
  
  // 카테고리 필터
  if (category) {
    filteredProjects = filteredProjects.filter(p => p.category === category);
  }
  
  // 정렬
  switch(sort) {
    case 'newest':
      filteredProjects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'oldest':
      filteredProjects.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case 'name':
      filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }
  
  if (filteredProjects.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          프로젝트가 없습니다. 새 프로젝트를 생성해보세요.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProjectCard 
            project={project} 
            studioId={studioId}
            onClick={() => router.push(`/studios/${studioId}/projects/${project.id}`)}
          />
        </motion.div>
      ))}
    </div>
  );
}
