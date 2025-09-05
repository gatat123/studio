// 자동 저장 기능이 통합된 프로젝트 페이지 예시
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToast } from '@/hooks/use-toast';
import { SyncStatusIndicator } from '@/components/features/sync/SyncStatusIndicator';
import { ConflictResolutionDialog } from '@/components/features/sync/ConflictResolutionDialog';
import { apiClient } from '@/lib/api/client';
import { indexedDBManager } from '@/lib/db/indexedDB';
import { Project, Scene } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function ProjectEditPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // 자동 저장 훅 사용
  const {
    syncStatus,
    lastSyncTime,
    syncProject,
    resolveConflict
  } = useAutoSave({
    projectId: params.projectId as string,
    studioId: params.studioId as string,
    autoSaveInterval: 30000, // 30초마다 자동 저장
    onConflict: (conflictData) => {
      setConflicts(conflictData);
      setShowConflictDialog(true);
    },
    onSyncComplete: () => {
      toast({
        title: '동기화 완료',
        description: '프로젝트가 성공적으로 저장되었습니다.',
      });
    },
    onSyncError: (error) => {
      toast({
        title: '동기화 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 프로젝트 데이터 로드
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        
        // 먼저 IndexedDB에서 로드 시도
        const cachedProject = await indexedDBManager.getProject(
          params.studioId as string,
          params.projectId as string
        );
        
        if (cachedProject) {
          setProject(cachedProject);
          setScenes(cachedProject.scenes || []);
        }
        
        // 서버에서 최신 데이터 가져오기
        const response = await apiClient.get(`/projects/${params.projectId}`);
        setProject(response.data);
        setScenes(response.data.scenes || []);
        
        // IndexedDB 업데이트
        await indexedDBManager.saveProject(
          params.studioId as string,
          response.data
        );
      } catch (error) {
        console.error('Failed to load project:', error);
        toast({
          title: '프로젝트 로드 실패',
          description: '프로젝트를 불러올 수 없습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params.projectId, params.studioId, toast]);

  // 프로젝트 업데이트 핸들러
  const handleProjectUpdate = useCallback((field: keyof Project, value: any) => {
    if (!project) return;
    
    const updatedProject = {
      ...project,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    
    setProject(updatedProject);
    
    // 자동 저장 트리거
    syncProject({
      ...updatedProject,
      scenes,
    });
  }, [project, scenes, syncProject]);

  // 수동 저장
  const handleManualSave = async () => {
    if (!project) return;
    
    try {
      await syncProject({
        ...project,
        scenes,
      });
      
      toast({
        title: '저장 완료',
        description: '프로젝트가 저장되었습니다.',
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      toast({
        title: '저장 실패',
        description: '프로젝트를 저장할 수 없습니다.',
        variant: 'destructive',
      });
    }
  };

  // 충돌 해결 핸들러
  const handleConflictResolution = async (resolution: 'local' | 'server' | 'merge', mergedData?: any) => {
    try {
      await resolveConflict(resolution, mergedData);
      setShowConflictDialog(false);
      setConflicts([]);
      
      toast({
        title: '충돌 해결',
        description: '충돌이 성공적으로 해결되었습니다.',
      });
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      toast({
        title: '충돌 해결 실패',
        description: '충돌을 해결할 수 없습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* 동기화 상태 표시 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">프로젝트 편집</h1>
        <div className="flex items-center gap-4">
          <SyncStatusIndicator status={syncStatus} lastSyncTime={lastSyncTime} />
          <Button onClick={handleManualSave} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            수동 저장
          </Button>
        </div>
      </div>

      {/* 프로젝트 정보 편집 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">프로젝트 제목</label>
            <Input
              value={project.title || ''}
              onChange={(e) => handleProjectUpdate('title', e.target.value)}
              placeholder="프로젝트 제목을 입력하세요"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">설명</label>
            <Textarea
              value={project.description || ''}
              onChange={(e) => handleProjectUpdate('description', e.target.value)}
              placeholder="프로젝트 설명을 입력하세요"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">카테고리</label>
              <Input
                value={project.category || ''}
                onChange={(e) => handleProjectUpdate('category', e.target.value)}
                placeholder="카테고리"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">상태</label>
              <Input
                value={project.status || ''}
                onChange={(e) => handleProjectUpdate('status', e.target.value)}
                placeholder="상태"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 충돌 해결 다이얼로그 */}
      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        conflicts={conflicts}
        onResolve={handleConflictResolution}
      />
    </div>
  );
}