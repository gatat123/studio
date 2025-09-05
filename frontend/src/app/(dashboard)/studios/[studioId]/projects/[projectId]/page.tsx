import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  User, 
  Settings, 
  FileImage, 
  Users,
  Activity,
  ArrowLeft,
  FolderOpen,
  Palette,
  Layers,
  FileText,
  Clock,
  MessageSquare,
  Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ProjectStatusDropdown from '@/components/projects/ProjectStatusDropdown';
import SceneList from '@/components/scenes/SceneList';
import ProjectMembers from '@/components/projects/ProjectMembers';
import ProjectActivity from '@/components/projects/ProjectActivity';

interface PageProps {
  params: { studioId: string; projectId: string };
}

const categoryIcons = {
  webtoon: FolderOpen,
  illustration: Palette,
  storyboard: Layers,
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

async function getProject(studioId: string, projectId: string) {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token');
  
  if (!token) {
    redirect('/login');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/projects/${projectId}`,
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
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch project');
  }

  return response.json();
}

async function getProjectStats(projectId: string) {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token');
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/projects/${projectId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch project stats:', error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { studioId, projectId } = params;
  const [project, stats] = await Promise.all([
    getProject(studioId, projectId),
    getProjectStats(projectId)
  ]);
  
  const CategoryIcon = categoryIcons[project.category];

  return (
    <div className="container mx-auto py-6 px-4">
      {/* 네비게이션 */}
      <Link href={`/studios/${studioId}/projects`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          프로젝트 목록
        </Button>
      </Link>

      {/* 프로젝트 헤더 */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <ProjectStatusDropdown 
                projectId={projectId}
                currentStatus={project.status}
                canEdit={project.role === 'owner' || project.role === 'admin'}
              />
            </div>
            {project.description && (
              <p className="text-gray-600 max-w-3xl">{project.description}</p>
            )}
          </div>
          <Link href={`/studios/${studioId}/projects/${projectId}/settings`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              설정
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <CategoryIcon className="h-4 w-4" />
            <span>{categoryLabels[project.category]}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              생성: {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
          {project.deadline && (
            <div className="flex items-center gap-1 text-red-600">
              <Clock className="h-4 w-4" />
              <span>
                마감: {format(new Date(project.deadline), 'yyyy년 MM월 dd일')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 통계 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 씬</CardTitle>
              <FileImage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScenes || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedScenes || 0} 완료
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">참여자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeMembers || 0} 활성
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">댓글</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unresolvedComments || 0} 미해결
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">진행률</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.progress ? `${Math.round(stats.progress)}%` : '0%'}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.progress || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 탭 인터페이스 */}
      <Tabs defaultValue="scenes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenes" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            씬
            {stats?.totalScenes > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.totalScenes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            멤버
            {stats?.totalMembers > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.totalMembers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            활동 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenes" className="space-y-4">
          <SceneList 
            projectId={projectId}
            studioId={studioId}
            canEdit={project.role === 'owner' || project.role === 'admin' || project.role === 'editor'}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <ProjectMembers 
            projectId={projectId}
            studioId={studioId}
            canManage={project.role === 'owner' || project.role === 'admin'}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ProjectActivity 
            projectId={projectId}
            studioId={studioId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
