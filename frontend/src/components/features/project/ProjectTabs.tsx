'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/lib/types/project.types';
import SceneList from '@/components/features/scene/SceneList';
import ProjectMembers from './ProjectMembers';
import ProjectActivity from './ProjectActivity';
import { FileImage, Users, Activity } from 'lucide-react';

interface ProjectTabsProps {
  project: Project;
  studioId: string;
}

export default function ProjectTabs({ project, studioId }: ProjectTabsProps) {
  return (
    <Tabs defaultValue="scenes" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
        <TabsTrigger value="scenes" className="flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          씬
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          멤버
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          활동
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="scenes" className="mt-6">
        <SceneList 
          projectId={project.id} 
          studioId={studioId} 
          scenes={project.scenes || []}
        />
      </TabsContent>
      
      <TabsContent value="members" className="mt-6">
        <ProjectMembers 
          projectId={project.id}
          members={project.collaborators || []}
        />
      </TabsContent>
      
      <TabsContent value="activity" className="mt-6">
        <ProjectActivity 
          projectId={project.id}
        />
      </TabsContent>
    </Tabs>
  );
}
