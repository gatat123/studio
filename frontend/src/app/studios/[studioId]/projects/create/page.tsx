import { Metadata } from 'next';
import CreateProjectForm from '@/components/features/project/CreateProjectForm';

export const metadata: Metadata = {
  title: '새 프로젝트 생성 | Studio',
  description: '새 프로젝트를 생성합니다',
};

interface CreateProjectPageProps {
  params: {
    studioId: string;
  };
}

export default function CreateProjectPage({ params }: CreateProjectPageProps) {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">새 프로젝트 생성</h1>
      <CreateProjectForm studioId={params.studioId} />
    </div>
  );
}
