'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Grid3x3, 
  List, 
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Scene {
  id: string;
  title: string;
  description?: string;
  order: number;
  thumbnailUrl?: string;
  status: 'empty' | 'draft' | 'review' | 'approved';
  hasDraft: boolean;
  hasArtwork: boolean;
  updatedAt: string;
}

export default function ScenesPage() {
  const params = useParams();
  const router = useRouter();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScenes();
  }, [params.projectId]);

  const loadScenes = async () => {
    try {
      setIsLoading(true);
      // 실제 구현에서는 API 호출
      const mockScenes: Scene[] = Array.from({ length: 12 }, (_, i) => ({
        id: `scene-${i + 1}`,
        title: `씬 ${i + 1}`,
        description: `씬 ${i + 1}의 설명`,
        order: i + 1,
        thumbnailUrl: '/api/placeholder/200/300',
        status: ['empty', 'draft', 'review', 'approved'][Math.floor(Math.random() * 4)] as any,
        hasDraft: Math.random() > 0.3,
        hasArtwork: Math.random() > 0.5,
        updatedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));
      setScenes(mockScenes);
    } catch (error) {
      console.error('씬 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '씬 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScene = () => {
    // 씬 생성 모달 열기 또는 페이지 이동
    toast({
      title: '씬 생성',
      description: '새 씬 생성 기능 구현 예정'
    });
  };

  const handleBulkUpload = () => {
    // 일괄 업로드 모달 열기
    toast({
      title: '일괄 업로드',
      description: '다중 씬 업로드 기능 구현 예정'
    });
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('정말 이 씬을 삭제하시겠습니까?')) return;

    try {
      // API 호출
      setScenes(scenes.filter(s => s.id !== sceneId));
      toast({
        title: '성공',
        description: '씬이 삭제되었습니다.'
      });
    } catch (error) {
      console.error('씬 삭제 실패:', error);
      toast({
        title: '오류',
        description: '씬 삭제에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-gray-500';
      case 'draft': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'empty': return '비어있음';
      case 'draft': return '초안';
      case 'review': return '검토중';
      case 'approved': return '승인됨';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">씬 관리</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleBulkUpload} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            일괄 업로드
          </Button>
          <Button onClick={handleCreateScene}>
            <Plus className="h-4 w-4 mr-2" />
            새 씬
          </Button>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 씬 목록 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {scenes.map((scene) => (
            <Card 
              key={scene.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/studios/${params.studioId}/projects/${params.projectId}/scenes/${scene.id}`)}
            >
              <div className="relative aspect-[2/3] bg-gray-100">
                {scene.thumbnailUrl ? (
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="h-12 w-12" />
                  </div>
                )}
                <Badge 
                  className={`absolute top-2 left-2 ${getStatusColor(scene.status)} text-white`}
                >
                  {getStatusLabel(scene.status)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScene(scene.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm">{scene.title}</h3>
                {scene.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{scene.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {scene.hasDraft && (
                    <Badge variant="outline" className="text-xs">초안</Badge>
                  )}
                  {scene.hasArtwork && (
                    <Badge variant="outline" className="text-xs">아트워크</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {scenes.map((scene) => (
            <Card 
              key={scene.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/studios/${params.studioId}/projects/${params.projectId}/scenes/${scene.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {scene.thumbnailUrl ? (
                    <img
                      src={scene.thumbnailUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{scene.title}</h3>
                    <Badge className={`${getStatusColor(scene.status)} text-white`}>
                      {getStatusLabel(scene.status)}
                    </Badge>
                    {scene.hasDraft && (
                      <Badge variant="outline">초안</Badge>
                    )}
                    {scene.hasArtwork && (
                      <Badge variant="outline">아트워크</Badge>
                    )}
                  </div>
                  {scene.description && (
                    <p className="text-sm text-gray-500 mt-1">{scene.description}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScene(scene.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {scenes.length === 0 && (
        <div className="text-center py-12">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">씬이 없습니다</h2>
          <p className="text-gray-500 mb-4">첫 번째 씬을 추가해보세요</p>
          <Button onClick={handleCreateScene}>
            <Plus className="h-4 w-4 mr-2" />
            첫 씬 추가
          </Button>
        </div>
      )}
    </div>
  );
}
