import React, { useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  Columns,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ImageComparisonProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  mode?: 'slider' | 'side-by-side' | 'overlay';
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = '이전',
  afterLabel = '이후',
  className,
  mode: initialMode = 'slider',
}) => {
  const [mode, setMode] = useState(initialMode);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [opacity, setOpacity] = useState(50);

  const handleDownload = useCallback((src: string, label: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = label;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const renderSliderMode = () => (
    <div className="relative w-full h-full overflow-hidden">
      {/* After 이미지 (배경) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-contain"
      />
      
      {/* Before 이미지 (클리핑) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ width: `${100 * (100 / sliderPosition)}%`, maxWidth: 'none' }}
        />
      </div>
      
      {/* 슬라이더 라인 */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full p-2">
          <ArrowLeftRight className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      
      {/* 라벨 */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur rounded px-2 py-1">
        <span className="text-xs font-medium">{beforeLabel}</span>
      </div>
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur rounded px-2 py-1">
        <span className="text-xs font-medium">{afterLabel}</span>
      </div>
    </div>
  );

  const renderSideBySideMode = () => (
    <div className="flex w-full h-full gap-2">
      <div className="flex-1 relative">
        <TransformWrapper>
          <TransformComponent>
            <img
              src={beforeSrc}
              alt={beforeLabel}
              className="w-full h-full object-contain"
            />
          </TransformComponent>
        </TransformWrapper>
        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded px-2 py-1">
          <span className="text-xs font-medium">{beforeLabel}</span>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <TransformWrapper>
          <TransformComponent>
            <img
              src={afterSrc}
              alt={afterLabel}
              className="w-full h-full object-contain"
            />
          </TransformComponent>
        </TransformWrapper>
        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded px-2 py-1">
          <span className="text-xs font-medium">{afterLabel}</span>
        </div>
      </div>
    </div>
  );

  const renderOverlayMode = () => (
    <div className="relative w-full h-full">
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-contain"
      />
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ opacity: opacity / 100 }}
      />
      
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur rounded px-2 py-1">
        <span className="text-xs font-medium">{beforeLabel} ↔ {afterLabel}</span>
      </div>
    </div>
  );

  return (
    <div className={cn('relative w-full h-full bg-background', className)}>
      {/* 컨트롤 바 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur border-b">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'slider' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('slider')}
              title="슬라이더 모드"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              슬라이더
            </Button>
            <Button
              variant={mode === 'side-by-side' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('side-by-side')}
              title="나란히 보기"
            >
              <Columns className="h-4 w-4 mr-1" />
              나란히
            </Button>
            <Button
              variant={mode === 'overlay' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('overlay')}
              title="오버레이 모드"
            >
              <Layers className="h-4 w-4 mr-1" />
              오버레이
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {mode === 'slider' && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-xs text-muted-foreground">위치:</span>
                <Slider
                  value={[sliderPosition]}
                  onValueChange={(value) => setSliderPosition(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {sliderPosition}%
                </span>
              </div>
            )}
            
            {mode === 'overlay' && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-xs text-muted-foreground">투명도:</span>
                <Slider
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {opacity}%
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(beforeSrc, beforeLabel)}
              title={`${beforeLabel} 다운로드`}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(afterSrc, afterLabel)}
              title={`${afterLabel} 다운로드`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 이미지 비교 영역 */}
      <div className="pt-12 h-full">
        {mode === 'slider' && renderSliderMode()}
        {mode === 'side-by-side' && renderSideBySideMode()}
        {mode === 'overlay' && renderOverlayMode()}
      </div>
    </div>
  );
};

export default ImageComparison;
