import React, { useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  X,
  RefreshCw,
  Move,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  onClose?: () => void;
  onDownload?: () => void;
  showControls?: boolean;
  initialRotation?: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = 'Image',
  className,
  onClose,
  onDownload,
  showControls = true,
  initialRotation = 0,
}) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setRotation(0);
  }, []);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      // 기본 다운로드 로직
      const link = document.createElement('a');
      link.href = src;
      link.download = alt || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [src, alt, onDownload]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const element = document.getElementById('image-viewer-container');
      if (element?.requestFullscreen) {
        element.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div
      id="image-viewer-container"
      className={cn(
        'relative w-full h-full bg-background flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 bg-black',
        className
      )}
    >
      {/* 컨트롤 바 */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur border-b">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground px-2">
                {alt}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <TransformWrapper>
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => zoomIn()}
                      title="확대"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => zoomOut()}
                      title="축소"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetTransform()}
                      title="초기화"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </TransformWrapper>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                title="회전"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="원래대로"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="다운로드"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title="전체 화면"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              
              {onClose && (
                <>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    title="닫기"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 이미지 뷰어 영역 */}
      <div className="flex-1 overflow-hidden relative">
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.5}
          maxScale={5}
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: 'reset' }}
          panning={{ disabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={src}
                alt={alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                }}
                draggable={false}
              />
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      {/* 모바일 터치 힌트 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none md:hidden">
        <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 flex items-center gap-2">
          <Move className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            핀치하여 확대/축소, 드래그하여 이동
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
