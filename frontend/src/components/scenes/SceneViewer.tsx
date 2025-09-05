'use client';

import React, { useState } from 'react';
import { 
  Eye,
  Columns,
  FileImage,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImageViewer, ImageComparison, PDFViewer } from '@/components/viewers';

interface SceneViewerProps {
  scene: any;
  viewMode: 'draft' | 'artwork' | 'compare';
}

export default function SceneViewer({ scene, viewMode }: SceneViewerProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerType, setViewerType] = useState<'image' | 'pdf' | 'compare'>('image');
  const [selectedImage, setSelectedImage] = useState<string>('');

  const handleOpenViewer = (type: 'image' | 'pdf' | 'compare', imageSrc?: string) => {
    setViewerType(type);
    if (imageSrc) setSelectedImage(imageSrc);
    setIsViewerOpen(true);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileType = (url: string): 'image' | 'pdf' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    return 'image';
  };

  const renderContent = () => {
    if (viewMode === 'compare') {
      // 비교 모드
      return (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">버전 비교</h3>
              <Button
                onClick={() => handleOpenViewer('compare')}
                size="sm"
              >
                <Columns className="h-4 w-4 mr-2" />
                비교 뷰어 열기
              </Button>
            </div>
            
            {scene.draft?.url && scene.artwork?.url ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">초안</div>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={scene.draft.url}
                      alt="초안"
                      className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition"
                      onClick={() => handleOpenViewer('image', scene.draft.url)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">아트워크</div>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={scene.artwork.url}
                      alt="아트워크"
                      className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition"
                      onClick={() => handleOpenViewer('image', scene.artwork.url)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                비교할 이미지가 없습니다
              </div>
            )}
          </div>
        </Card>
      );
    }

    // 단일 뷰 모드
    const imageUrl = viewMode === 'draft' ? scene.draft?.url : scene.artwork?.url;
    const fileType = imageUrl ? getFileType(imageUrl) : null;

    if (!imageUrl) {
      return (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{viewMode === 'draft' ? '초안이' : '아트워크가'} 없습니다</p>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {fileType === 'pdf' ? (
                <FileText className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FileImage className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {viewMode === 'draft' ? '초안' : '아트워크'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleOpenViewer(fileType, imageUrl)}
                size="sm"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                뷰어 열기
              </Button>
              
              <Button
                onClick={() => handleDownload(imageUrl, `scene-${scene.id}-${viewMode}`)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {fileType === 'pdf' ? (
              <div className="flex items-center justify-center h-full cursor-pointer hover:bg-muted/80 transition"
                   onClick={() => handleOpenViewer('pdf', imageUrl)}>
                <FileText className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">PDF 문서</span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={viewMode === 'draft' ? '초안' : '아트워크'}
                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition"
                onClick={() => handleOpenViewer('image', imageUrl)}
              />
            )}
          </div>

          {/* 버전 정보 */}
          {(viewMode === 'draft' ? scene.draft : scene.artwork) && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                업로드: {new Date((viewMode === 'draft' ? scene.draft : scene.artwork).uploadedAt).toLocaleDateString('ko-KR')}
              </span>
              <span>
                버전: {(viewMode === 'draft' ? scene.draft : scene.artwork).version || 1}
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      {renderContent()}

      {/* 뷰어 다이얼로그 */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0">
          {viewerType === 'compare' && scene.draft?.url && scene.artwork?.url && (
            <ImageComparison
              beforeSrc={scene.draft.url}
              afterSrc={scene.artwork.url}
              beforeLabel="초안"
              afterLabel="아트워크"
              className="w-full h-full"
            />
          )}
          
          {viewerType === 'image' && selectedImage && (
            <ImageViewer
              src={selectedImage}
              alt={`Scene ${scene.id}`}
              className="w-full h-full"
              onClose={() => setIsViewerOpen(false)}
            />
          )}
          
          {viewerType === 'pdf' && selectedImage && (
            <PDFViewer
              src={selectedImage}
              className="w-full h-full"
              onClose={() => setIsViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}