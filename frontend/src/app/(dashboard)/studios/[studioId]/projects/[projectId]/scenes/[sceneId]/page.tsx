'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Maximize2, 
  MessageSquare,
  History,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Upload
} from 'lucide-react';
import SceneViewer from '@/components/scenes/SceneViewer';
import SceneComments from '@/components/scenes/SceneComments';
import SceneVersionHistory from '@/components/scenes/SceneVersionHistory';
import SceneUploadModal from '@/components/scenes/SceneUploadModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface SceneData {
  id: string;
  title: string;
  description?: string;
  order: number;
  draft?: {
    url: string;
    uploadedAt: string;
    uploadedBy: {
      id: string;
      name: string;
      avatar?: string;
    };
    version: number;
  };
  artwork?: {
    url: string;
    uploadedAt: string;
    uploadedBy: {
      id: string;
      name: string;
      avatar?: string;
    };
    version: number;
  };
  status: 'empty' | 'draft' | 'review' | 'approved';
  comments: number;
  project: {
    id: string;
    title: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SceneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scene, setScene] = useState<SceneData | null>(null);
  const [activeTab, setActiveTab] = useState('viewer');
  const [viewMode, setViewMode] = useState<'draft' | 'artwork' | 'compare'>('draft');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'draft' | 'artwork'>('draft');

  useEffect(() => {
    loadScene();
  }, [params.sceneId]);

  const loadScene = async () => {
    try {
      setIsLoading(true);
      // 실제 구현에서는 API 호출
      const mockScene: SceneData = {
        id: params.sceneId as string,
        title: `씬 ${params.sceneId}`,
        description: '캐릭터 첫 등장 씬',
        order: 1,
        draft: {
          url: '/api/placeholder/800/1200',
          uploadedAt: '2024-12-26T10:00:00',
          uploadedBy: {
            id: '1',
            name: '김작가',
            avatar: '/api/placeholder/40/40'
          },
          version: 2
        },
        artwork: {
          url: '/api/placeholder/800/1200',
          uploadedAt: '2024-12-26T14:00:00',
          uploadedBy: {
            id: '1',
            name: '김작가',
            avatar: '/api/placeholder/40/40'
          },
          version: 1
        },
        status: 'review',
        comments: 5,
        project: {
          id: params.projectId as string,
          title: '프로젝트 제목',
          status: 'in_progress'
        },
        createdAt: '2024-12-25T09:00:00',
        updatedAt: '2024-12-26T14:00:00'
      };
      setScene(mockScene);
    } catch (error) {
      console.error('씬 로드 실패:', error);
      toast({
        title: '오류',
        description: '씬을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File, type: 'draft' | 'artwork') => {
    try {
      // 실제 구현에서는 API 호출
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: '성공',
        description: `${type === 'draft' ? '초안' : '아트워크'}이 업로드되었습니다.`
      });

      setShowUploadModal(false);
      loadScene(); // 씬 데이터 다시 로드
    } catch (error) {
      console.error('업로드 실패:', error);
      toast({
        title: '오류',
        description: '파일 업로드에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 씬을 삭제하시겠습니까?')) return;

    try {
      // API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '성공',
        description: '씬이 삭제되었습니다.'
      });
      
      router.push(`/studios/${params.studioId}/projects/${params.projectId}`);
    } catch (error) {
      console.error('삭제 실패:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">씬을 찾을 수 없습니다</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{scene.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{scene.description}</p>
              </div>
              <Badge className={`${getStatusColor(scene.status)} text-white`}>
                {scene.status === 'empty' && '비어있음'}
                {scene.status === 'draft' && '초안'}
                {scene.status === 'review' && '검토중'}
                {scene.status === 'approved' && '승인됨'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadType('draft');
                  setShowUploadModal(true);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                초안 업로드
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadType('artwork');
                  setShowUploadModal(true);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                아트워크 업로드
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    정보 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    공유
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 뷰 모드 선택 */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={viewMode === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('draft')}
              disabled={!scene.draft}
            >
              초안
            </Button>
            <Button
              variant={viewMode === 'artwork' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('artwork')}
              disabled={!scene.artwork}
            >
              아트워크
            </Button>
            <Button
              variant={viewMode === 'compare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compare')}
              disabled={!scene.draft || !scene.artwork}
            >
              비교
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="viewer">뷰어</TabsTrigger>
            <TabsTrigger value="comments">
              댓글 {scene.comments > 0 && `(${scene.comments})`}
            </TabsTrigger>
            <TabsTrigger value="history">버전 히스토리</TabsTrigger>
          </TabsList>

          <TabsContent value="viewer" className="mt-6">
            <SceneViewer
              scene={scene}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <SceneComments
              sceneId={scene.id}
              projectId={params.projectId as string}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <SceneVersionHistory
              sceneId={scene.id}
              currentDraftVersion={scene.draft?.version}
              currentArtworkVersion={scene.artwork?.version}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 업로드 모달 */}
      {showUploadModal && (
        <SceneUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={(file) => handleUpload(file, uploadType)}
          uploadType={uploadType}
        />
      )}
    </div>
  );
}
