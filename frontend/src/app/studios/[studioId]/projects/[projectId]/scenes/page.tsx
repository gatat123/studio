'use client';

import React from 'react';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BulkUploadZone } from '@/components/scenes/BulkUploadZone';
import DraggableSceneList from '@/components/scenes/DraggableSceneList';
import { SceneGridView } from '@/components/scenes/SceneGridView';
import { SceneVersionHistory } from '@/components/scenes/SceneVersionHistory';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Grid3x3, 
  List, 
  Upload, 
  Settings, 
  GripVertical, 
  CheckSquare,
  History,
  Trash2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Scene } from '@/types/scene.types';

// Mock data for development
const mockScenes: Scene[] = [
  {
    id: '1',
    projectId: '1',
    title: '씬 1 - 오프닝',
    description: '웹툰 오프닝 장면',
    order: 1,
    status: 'approved',
    draft: {
      url: '/placeholder-150x150.png',
      uploadedAt: new Date('2024-01-01'),
      uploadedBy: { id: '1', name: 'Artist' },
      version: 1
    },
    artwork: {
      url: '/placeholder-150x150.png',
      uploadedAt: new Date('2024-01-02'),
      uploadedBy: { id: '1', name: 'Artist' },
      version: 2
    },
    comments: [{}, {}],
    history: [],
    annotations: [],
    tags: [],
    metadata: {}
  },
  {
    id: '2',
    projectId: '1',
    title: '씬 2 - 전개',
    description: '스토리 전개',
    order: 2,
    status: 'review',
    draft: {
      url: '/placeholder-150x150.png',
      uploadedAt: new Date('2024-01-01'),
      uploadedBy: { id: '1', name: 'Artist' },
      version: 1
    },
    comments: [{}],
    history: [],
    annotations: [],
    tags: [],
    metadata: {}
  },
  {
    id: '3',
    projectId: '1',
    title: '씬 3 - 클라이맥스',
    description: '클라이맥스 장면',
    order: 3,
    status: 'draft',
    draft: {
      url: '/placeholder-150x150.png',
      uploadedAt: new Date('2024-01-01'),
      uploadedBy: { id: '1', name: 'Artist' },
      version: 1
    },
    comments: [],
    history: [],
    annotations: [],
    tags: [],
    metadata: {}
  },
  {
    id: '4',
    projectId: '1',
    title: '씬 4 - 엔딩',
    description: '엔딩 장면',
    order: 4,
    status: 'empty',
    comments: [],
    history: [],
    annotations: [],
    tags: [],
    metadata: {}
  }
];

// Mock version history
const mockVersionHistory = [
  {
    id: 'v1',
    version: 1,
    url: '/placeholder-150x150.png',
    uploadedAt: new Date('2024-01-01'),
    uploadedBy: { id: '1', name: 'Artist' },
    type: 'draft' as const,
    comment: '초기 스케치',
    fileSize: 1024000
  },
  {
    id: 'v2',
    version: 2,
    url: '/placeholder-150x150.png',
    uploadedAt: new Date('2024-01-02'),
    uploadedBy: { id: '1', name: 'Artist' },
    type: 'draft' as const,
    comment: '캐릭터 수정',
    fileSize: 1124000
  },
  {
    id: 'v3',
    version: 3,
    url: '/placeholder-150x150.png',
    uploadedAt: new Date('2024-01-03'),
    uploadedBy: { id: '2', name: 'Senior Artist' },
    type: 'artwork' as const,
    comment: '최종 아트워크',
    fileSize: 2048000
  }
];

export default function ScenesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('scenes');
  
  // Scene management states
  const [scenes, setScenes] = useState<Scene[]>(mockScenes);
  const [enableDragDrop, setEnableDragDrop] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  
  // Version history states
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const studioId = params.studioId as string;
  const projectId = params.projectId as string;

  const handleUploadComplete = (uploadedFiles: any[]) => {
    toast({
      title: '업로드 완료',
      description: `${uploadedFiles.length}개의 씬이 추가되었습니다.`
    });
    fetchScenes();
  };

  const fetchScenes = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes`);
      if (response.ok) {
        const data = await response.json();
        setScenes(data.scenes || mockScenes);
      }
    } catch (error) {
      console.error('씬 목록 불러오기 실패:', error);
      setScenes(mockScenes);
    }
  };

  const handleSceneSelect = (sceneId: string) => {
    const newSelected = new Set(selectedScenes);
    if (newSelected.has(sceneId)) {
      newSelected.delete(sceneId);
    } else {
      newSelected.add(sceneId);
    }
    setSelectedScenes(newSelected);
  };

  const handleBulkAction = (action: string, sceneIds: string[]) => {
    switch (action) {
      case 'select-all':
        setSelectedScenes(new Set(sceneIds));
        break;
      case 'deselect-all':
        setSelectedScenes(new Set());
        break;
      case 'delete':
        handleBulkDelete(sceneIds);
        break;
    }
  };

  const handleBulkDelete = async (sceneIds: string[]) => {
    if (!confirm(`정말 ${sceneIds.length}개의 씬을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // API call would go here
      setScenes(scenes.filter(s => !sceneIds.includes(s.id)));
      setSelectedScenes(new Set());
      toast({
        title: '삭제 완료',
        description: `${sceneIds.length}개의 씬이 삭제되었습니다.`
      });
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: '씬 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleSceneEdit = (scene: Scene) => {
    router.push(`/studios/${studioId}/projects/${projectId}/scenes/${scene.id}/edit`);
  };

  const handleSceneDelete = async (sceneId: string) => {
    if (!confirm('정말 이 씬을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // API call would go here
      setScenes(scenes.filter(s => s.id !== sceneId));
      toast({
        title: '삭제 완료',
        description: '씬이 삭제되었습니다.'
      });
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: '씬 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleShowVersionHistory = (scene: Scene) => {
    setSelectedScene(scene);
    setShowVersionHistory(true);
  };

  const handleVersionRollback = async (versionId: string) => {
    try {
      toast({
        title: '버전 롤백 완료',
        description: '선택한 버전으로 롤백되었습니다.'
      });
      setShowVersionHistory(false);
    } catch (error) {
      toast({
        title: '롤백 실패',
        description: '버전 롤백 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleVersionComment = async (versionId: string, comment: string) => {
    try {
      toast({
        title: '주석 저장 완료',
        description: '버전 주석이 저장되었습니다.'
      });
    } catch (error) {
      toast({
        title: '저장 실패',
        description: '주석 저장 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  React.useEffect(() => {
    fetchScenes();
  }, [projectId]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">씬 관리</h1>
          <p className="text-muted-foreground">
            프로젝트의 씬을 업로드하고 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 일괄 선택 모드 */}
          {activeTab === 'scenes' && !enableDragDrop && (
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedScenes(new Set());
              }}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectionMode ? '선택 모드' : '일괄 선택'}
            </Button>
          )}
          
          {/* 드래그 모드 */}
          {activeTab === 'scenes' && !selectionMode && (
            <Button
              variant={enableDragDrop ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEnableDragDrop(!enableDragDrop)}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {enableDragDrop ? '순서 변경 중' : '순서 변경'}
            </Button>
          )}
          
          {/* 뷰 모드 전환 */}
          {activeTab === 'scenes' && !enableDragDrop && (
            <>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upload">업로드</TabsTrigger>
          <TabsTrigger value="scenes">씬 목록</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        {/* 업로드 탭 */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>씬 업로드</CardTitle>
              <CardDescription>
                이미지 파일을 드래그하거나 클릭하여 업로드하세요. 
                최대 100개까지 한 번에 업로드 가능합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkUploadZone
                projectId={projectId}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 씬 목록 탭 */}
        <TabsContent value="scenes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>씬 목록</CardTitle>
              <CardDescription>
                {enableDragDrop 
                  ? '드래그앤드롭으로 씬 순서를 변경할 수 있습니다'
                  : selectionMode
                  ? '여러 씬을 선택하여 일괄 작업을 수행할 수 있습니다'
                  : '프로젝트의 모든 씬을 확인하고 관리합니다'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">씬이 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    업로드 탭에서 씬을 추가해주세요
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    씬 업로드하기
                  </Button>
                </div>
              ) : enableDragDrop ? (
                <DraggableSceneList 
                  scenes={scenes} 
                  projectId={projectId}
                  onOrderChange={(reorderedScenes) => setScenes(reorderedScenes)}
                />
              ) : (
                <SceneGridView
                  scenes={scenes}
                  viewMode={viewMode}
                  selectionMode={selectionMode}
                  selectedScenes={selectedScenes}
                  onSceneSelect={handleSceneSelect}
                  onSceneEdit={handleSceneEdit}
                  onSceneDelete={handleSceneDelete}
                  onBulkAction={handleBulkAction}
                />
              )}

              {/* 버전 히스토리 버튼 (예시) */}
              {scenes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowVersionHistory(scenes[0])}
                  >
                    <History className="h-4 w-4 mr-2" />
                    버전 히스토리 보기 (예시)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>씬 설정</CardTitle>
              <CardDescription>
                씬 관리 관련 설정을 변경합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">자동 매칭</label>
                  <p className="text-sm text-muted-foreground">
                    파일명으로 초안과 아트워크를 자동 매칭합니다
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">썸네일 크기</label>
                  <p className="text-sm text-muted-foreground">
                    목록에서 표시되는 썸네일 크기를 조정합니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 버전 히스토리 시트 */}
      <Sheet open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedScene?.title} - 버전 히스토리</SheetTitle>
            <SheetDescription>
              씬의 모든 버전을 확인하고 관리합니다
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedScene && (
              <SceneVersionHistory
                sceneId={selectedScene.id}
                sceneName={selectedScene.title}
                versions={mockVersionHistory}
                currentVersion={3}
                onRollback={handleVersionRollback}
                onAddComment={handleVersionComment}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}