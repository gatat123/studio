import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProjectCard, { Project } from '@/components/projects/ProjectCard';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: { studioId: string };
  searchParams: { status?: string; category?: string; sort?: string };
}

async function getProjects(studioId: string, filters: any) {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token');
  
  if (!token) {
    redirect('/login');
  }

  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/studios/${studioId}/projects${queryParams ? `?${queryParams}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

export default async function ProjectsPage({ params, searchParams }: PageProps) {
  const { studioId } = params;
  const projects: Project[] = await getProjects(studioId, searchParams);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">프로젝트</h1>
          <p className="text-gray-600 mt-2">
            스튜디오의 모든 프로젝트를 관리하세요
          </p>
        </div>
        <Link href={`/studios/${studioId}/projects/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 프로젝트
          </Button>
        </Link>
      </div>

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FolderOpen className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            프로젝트가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            첫 번째 프로젝트를 생성하여 시작하세요
          </p>
          <Link href={`/studios/${studioId}/projects/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              프로젝트 생성
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              studioId={studioId} 
            />
          ))}
        </div>
      )}
    </div>
  );
}