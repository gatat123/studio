'use client';

import React, { useState } from 'react';
import { MessageCircle, Download, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AnnotationLayer } from '../comment/AnnotationLayer';
import { CommentThread } from '../comment/CommentThread';
import { useComments } from '../comment/hooks/useComments';

interface Scene {
  id: string;
  title: string;
  description?: string;
  draft?: {
    url: string;
    uploadedAt: string;
    version: number;
  };
  artwork?: {
    url: string;
    uploadedAt: string;
    version: number;
  };
  status: 'empty' | 'draft' | 'review' | 'approved';
}

interface SceneViewerProps {
  scene: Scene;
  projectId: string;
  showComments?: boolean;
  allowAnnotations?: boolean;
  className?: string;
}

export function SceneViewer({
  scene,
  projectId,
  showComments = true,
  allowAnnotations = true,
  className,
}: SceneViewerProps) {
  const [activeView, setActiveView] = useState<'draft' | 'artwork'>('artwork');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  
  const { comments, isLoading } = useComments({
    sceneId: scene.id,
    projectId,
  });

  // 현재 보여줄 이미지 결정
  const currentImage = activeView === 'artwork' && scene.artwork 
    ? scene.artwork 
    : scene.draft;
    
  const imageUrl = currentImage?.url;

  // 위치 기반 댓글 추출
  const annotations = comments
    .filter(c => c.position && !c.parentId)
    .map(c => ({
      id: c.id,
      x: c.position!.x,
      y: c.position!.y,
      hasComments: true,
      commentCount: comments.filter(r => r.parentId === c.id).length + 1,
      resolved: c.resolved,
    }));

  // 일반 댓글 (위치 없음)
  const generalComments = comments.filter(c => !c.position && !c.parentId);

  // 이미지 다운로드
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${scene.title}_${activeView}_v${currentImage?.version}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 상태 배지 색상
  const getStatusColor = (status: Scene['status']) => {
    switch (status) {
      case 'empty': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'review': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <div className={cn("bg-white rounded-lg shadow-sm", className)}>
        {/* 헤더 */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{scene.title}</h3>
              <Badge className={cn("text-white", getStatusColor(scene.status))}>
                {scene.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {showComments && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  댓글 ({comments.length})
                </Button>
              )}
              
              {imageUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {scene.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {scene.description}
            </p>
          )}
        </div>

        {/* 이미지 뷰어 */}
        <div className="p-6">
          {scene.draft || scene.artwork ? (
            <Tabs
              value={activeView}
              onValueChange={(v) => setActiveView(v as 'draft' | 'artwork')}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="draft" disabled={!scene.draft}>
                  초안 {scene.draft && `(v${scene.draft.version})`}
                </TabsTrigger>
                <TabsTrigger value="artwork" disabled={!scene.artwork}>
                  아트워크 {scene.artwork && `(v${scene.artwork.version})`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="draft" className="mt-0">
                {scene.draft && (
                  <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                    {allowAnnotations ? (
                      <AnnotationLayer
                        sceneId={scene.id}
                        imageUrl={scene.draft.url}
                        annotations={activeView === 'draft' ? annotations : []}
                        className="w-full"
                      />
                    ) : (
                      <img
                        src={scene.draft.url}
                        alt={scene.title}
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="artwork" className="mt-0">
                {scene.artwork && (
                  <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                    {allowAnnotations ? (
                      <AnnotationLayer
                        sceneId={scene.id}
                        imageUrl={scene.artwork.url}
                        annotations={activeView === 'artwork' ? annotations : []}
                        className="w-full"
                      />
                    ) : (
                      <img
                        src={scene.artwork.url}
                        alt={scene.title}
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">이미지가 업로드되지 않았습니다.</p>
            </div>
          )}
        </div>

        {/* 댓글 패널 */}
        {showCommentsPanel && (
          <div className="border-t px-6 py-4">
            <h4 className="font-medium mb-4">일반 댓글</h4>
            <CommentThread
              sceneId={scene.id}
              comments={generalComments}
            />
          </div>
        )}
      </div>

      {/* 전체화면 모달 */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{scene.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4 overflow-auto">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={scene.title}
                className="w-full h-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}