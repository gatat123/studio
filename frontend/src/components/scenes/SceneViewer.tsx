'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2,
  Download,
  Grid3x3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface SceneViewerProps {
  scene: any;
  viewMode: 'draft' | 'artwork' | 'compare';
}

export default function SceneViewer({ scene, viewMode }: SceneViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = (type: 'draft' | 'artwork') => {
    const url = type === 'draft' ? scene.draft?.url : scene.artwork?.url;
    if (url) {
      // 실제 구현에서는 파일 다운로드 처리
      window.open(url, '_blank');
    }
  };

  const handleFullscreen = () => {
    // 전체화면 모드 구현
    const element = document.getElementById('scene-viewer');
    if (element?.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="w-32">
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={50}
                  max={200}
                  step={10}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500 ml-2">{zoom}%</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              회전
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              그리드
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'draft' && scene.draft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('draft')}
              >
                <Download className="h-4 w-4 mr-2" />
                초안 다운로드
              </Button>
            )}
            {viewMode === 'artwork' && scene.artwork && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('artwork')}
              >
                <Download className="h-4 w-4 mr-2" />
                아트워크 다운로드
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              전체화면
            </Button>
          </div>
        </div>
      </Card>

      {/* 뷰어 영역 */}
      <div id="scene-viewer" className="bg-gray-100 rounded-lg overflow-auto" style={{ height: '600px' }}>
        <div className="relative min-h-full flex items-center justify-center p-8">
          {viewMode === 'compare' ? (
            <div className="flex gap-4">
              {/* 초안 */}
              <div className="relative">
                <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  초안
                </div>
                {scene.draft ? (
                  <div
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <img
                      src={scene.draft.url}
                      alt="초안"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px)',
                        backgroundSize: '50px 50px'
                      }} />
                    )}
                  </div>
                ) : (
                  <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded">
                    <p className="text-gray-500">초안 없음</p>
                  </div>
                )}
              </div>

              {/* 아트워크 */}
              <div className="relative">
                <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  아트워크
                </div>
                {scene.artwork ? (
                  <div
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <img
                      src={scene.artwork.url}
                      alt="아트워크"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px)',
                        backgroundSize: '50px 50px'
                      }} />
                    )}
                  </div>
                ) : (
                  <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded">
                    <p className="text-gray-500">아트워크 없음</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              {viewMode === 'draft' && scene.draft ? (
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <img
                    src={scene.draft.url}
                    alt="초안"
                    className="max-w-full h-auto"
                    style={{ maxHeight: '500px' }}
                  />
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px)',
                      backgroundSize: '50px 50px'
                    }} />
                  )}
                </div>
              ) : viewMode === 'artwork' && scene.artwork ? (
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <img
                    src={scene.artwork.url}
                    alt="아트워크"
                    className="max-w-full h-auto"
                    style={{ maxHeight: '500px' }}
                  />
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.1) 49px, rgba(0,0,0,0.1) 50px)',
                      backgroundSize: '50px 50px'
                    }} />
                  )}
                </div>
              ) : (
                <div className="w-96 h-96 bg-gray-200 flex items-center justify-center rounded">
                  <p className="text-gray-500">이미지 없음</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
