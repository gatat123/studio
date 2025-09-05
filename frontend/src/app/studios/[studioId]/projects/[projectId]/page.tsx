import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/api/projects';
import ProjectHeader from '@/components/features/project/ProjectHeader';
import ProjectTabs from '@/components/features/project/ProjectTabs';

export const metadata: Metadata = {
  title: '프로젝트 상세 | Studio',
  description: '프로젝트 상세 정보',
};

interface ProjectDetailPageProps {
  params: {
    studioId: string;
    projectId: string;
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  try {
    const project = await getProject(params.projectId);

    if (!project) {
      notFound();
    }

    return (
      <div className="container py-8">
        <ProjectHeader 
          project={project} 
          studioId={params.studioId} 
        />
        
        <div className="mt-8">
          <ProjectTabs 
            project={project} 
            studioId={params.studioId} 
          />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
