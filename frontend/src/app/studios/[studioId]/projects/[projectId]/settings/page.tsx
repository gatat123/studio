import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/api/projects';
import ProjectSettings from '@/components/features/project/ProjectSettings';

export const metadata: Metadata = {
  title: '프로젝트 설정 | Studio',
  description: '프로젝트 설정 관리',
};

interface ProjectSettingsPageProps {
  params: {
    studioId: string;
    projectId: string;
  };
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  try {
    const project = await getProject(params.projectId);

    if (!project) {
      notFound();
    }

    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">프로젝트 설정</h1>
        <ProjectSettings 
          project={project} 
          studioId={params.studioId} 
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
