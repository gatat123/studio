'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
  FolderOpen, 
  Activity, 
  BarChart3,
  Plus,
  ArrowLeft,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudio } from '@/components/features/studio/hooks/useStudio';
import { StudioMemberList } from '@/components/features/studio/StudioMemberList';
import { formatDate, formatDateTime } from '@/utils/format';

export default function StudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params.studioId as string;
  const { studio, members, loading, error, changeMemberRole, removeMember } = useStudio(studioId);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">스튜디오를 찾을 수 없습니다.</p>
        <Button onClick={() => router.push('/studios')}>
          스튜디오 목록으로
        </Button>
      </div>
    );
  }

  const canManage = studio.role === 'owner' || studio.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/studios" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          스튜디오 목록
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{studio.name}</h1>
              {studio.role && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {studio.role === 'owner' && '소유자'}
                  {studio.role === 'admin' && '관리자'}
                  {studio.role === 'editor' && '편집자'}
                  {studio.role === 'viewer' && '뷰어'}
                </span>
              )}
            </div>
            {studio.description && (
              <p className="text-gray-600">{studio.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(studio.createdAt)} 생성
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDateTime(studio.updatedAt)} 수정
              </span>
            </div>
          </div>
          
          {canManage && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push(`/studios/${studioId}/settings`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                설정
              </Button>
              <Button onClick={() => router.push(`/studios/${studioId}/projects/create`)}>
                <Plus className="w-4 h-4 mr-2" />
                프로젝트 생성
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="projects">프로젝트</TabsTrigger>
          <TabsTrigger value="members">멤버</TabsTrigger>
          <TabsTrigger value="activity">활동</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  총 프로젝트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{studio.projectCount || 0}</span>
                  <FolderOpen className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  팀 멤버
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{members.length || 0}</span>
                  <Users className="w-8 h-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  진행중 작업
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">0</span>
                  <Activity className="w-8 h-8 text-orange-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  완료율
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">0%</span>
                  <BarChart3 className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>스튜디오의 최근 활동 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>아직 활동 내역이 없습니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>프로젝트</CardTitle>
                <CardDescription>스튜디오의 모든 프로젝트</CardDescription>
              </div>
              <Button onClick={() => router.push(`/studios/${studioId}/projects/create`)}>
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>아직 프로젝트가 없습니다.</p>
                <p className="text-sm mt-1">첫 프로젝트를 생성해보세요!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <StudioMemberList
            members={members}
            currentUserRole={studio.role || 'viewer'}
            onRoleChange={changeMemberRole}
            onRemoveMember={removeMember}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>활동 로그</CardTitle>
              <CardDescription>스튜디오 내 모든 활동 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>활동 로그가 없습니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
