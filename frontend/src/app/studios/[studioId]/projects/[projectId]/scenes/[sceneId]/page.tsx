'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, MessageSquare, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CommentThread } from '@/components/features/comment/CommentThread';
import { ImageUploader } from '@/components/features/upload/ImageUploader';
import { useScene } from '@/lib/hooks/useScene';
import { useComments } from '@/lib/hooks/useComments';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function SceneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const sceneId = params.sceneId as string;
  const projectId = params.projectId as string;
  const studioId = params.studioId as string;
  
  const [activeTab, setActiveTab] = useState('draft');
  const [showUploader, setShowUploader] = useState(false);
  const [uploadType, setUploadType] = useState<'draft' | 'artwork'>('draft');
  
  const { scene, loading, error, updateScene } = useScene(sceneId);
  const {
    comments,
    loading: commentsLoading,
    createComment,
    updateComment,
    deleteComment,
    toggleResolved,
    togglePinned,
  } = useComments(sceneId);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('type', uploadType);
    
    try {
      await updateScene(sceneId, formData);
      setShowUploader(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleCreateComment = async (content: string, parentId?: string) => {
    await createComment({
      content,
      parentId,
    });
  };

  const handleEditComment = async (commentId: string, content: string) => {
    await updateComment(commentId, { content });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      await deleteComment(commentId);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">로딩중...</div>;
  }

  if (error || !scene) {
    return <div className="flex items-center justify-center h-screen">씬을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              씬 #{scene.order}: {scene.title || '제목 없음'}
            </h1>
            {scene.description && (
              <p className="text-muted-foreground">{scene.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={scene.status === 'approved' ? 'success' : 'secondary'}>
            {scene.status === 'empty' && '비어있음'}
            {scene.status === 'draft' && '초안'}
            {scene.status === 'review' && '검토중'}
            {scene.status === 'approved' && '승인됨'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Viewer */}
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="draft" disabled={!scene.draft}>
                    초안
                  </TabsTrigger>
                  <TabsTrigger value="artwork" disabled={!scene.artwork}>
                    아트워크
                  </TabsTrigger>
                </TabsList>
                
                <Button
                  size="sm"
                  onClick={() => {
                    setUploadType(activeTab as 'draft' | 'artwork');
                    setShowUploader(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  업로드
                </Button>
              </div>

              <TabsContent value="draft" className="mt-0">
                {scene.draft ? (
                  <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={scene.draft.url}
                      alt="Draft"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                      v{scene.draft.version} · {formatDistanceToNow(new Date(scene.draft.uploadedAt), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-[16/9] bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">초안이 없습니다</p>
                      <Button
                        onClick={() => {
                          setUploadType('draft');
                          setShowUploader(true);
                        }}
                      >
                        초안 업로드
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="artwork" className="mt-0">
                {scene.artwork ? (
                  <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={scene.artwork.url}
                      alt="Artwork"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                      v{scene.artwork.version} · {formatDistanceToNow(new Date(scene.artwork.uploadedAt), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-[16/9] bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">아트워크가 없습니다</p>
                      <Button
                        onClick={() => {
                          setUploadType('artwork');
                          setShowUploader(true);
                        }}
                      >
                        아트워크 업로드
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Version History */}
          {scene.history && scene.history.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                버전 히스토리
              </h3>
              <div className="space-y-2">
                {scene.history.map((version: any) => (
                  <div key={version.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">v{version.version}</Badge>
                      <span className="text-sm">{version.type === 'draft' ? '초안' : '아트워크'}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(version.uploadedAt), { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      보기
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Comments */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              댓글 ({comments.length})
            </h3>
            <CommentThread
              comments={comments}
              loading={commentsLoading}
              currentUserId={user?.id}
              isOwner={false} // TODO: Check if user is project owner
              onCreate={handleCreateComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onToggleResolved={toggleResolved}
              onTogglePinned={togglePinned}
            />
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6">
            <h2 className="text-lg font-semibold mb-4">
              {uploadType === 'draft' ? '초안' : '아트워크'} 업로드
            </h2>
            <ImageUploader
              onUpload={handleUpload}
              accept="image/*"
              maxFiles={1}
            />
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowUploader(false)}
            >
              취소
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}