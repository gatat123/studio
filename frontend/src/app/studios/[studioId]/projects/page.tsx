import { Metadata } from 'next';
import { getProjects } from '@/lib/api/projects';
import ProjectList from '@/components/features/project/ProjectList';
import ProjectFilters from '@/components/features/project/ProjectFilters';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: '프로젝트 | Studio',
  description: '프로젝트 목록',
};

interface ProjectsPageProps {
  params: {
    studioId: string;
  };
  searchParams: {
    status?: string;
    category?: string;
    sort?: string;
  };
}

export default async function ProjectsPage({ 
  params, 
  searchParams 
}: ProjectsPageProps) {
  const projects = await getProjects(params.studioId, searchParams);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">프로젝트</h1>
        <Link href={`/studios/${params.studioId}/projects/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 프로젝트
          </Button>
        </Link>
      </div>

      <ProjectFilters />
      
      <div className="mt-8">
        <ProjectList 
          projects={projects} 
          studioId={params.studioId} 
        />
      </div>
    </div>
  );
}
