'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Layers,
  SplitSquareHorizontal,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SceneVersion {
  id: string;
  version: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
  type: 'draft' | 'artwork';
  comment?: string;
}

interface SceneVersionCompareProps {
  isOpen: boolean;
  onClose: () => void;
  version1: SceneVersion;
  version2: SceneVersion;
}

type CompareMode = 'side-by-side' | 'slider' | 'overlay' | 'difference';

export function SceneVersionCompare({
  isOpen,
  onClose,
  version1,
  version2,
}: SceneVersionCompareProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [swapped, setSwapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swap versions for comparison
  const leftVersion = swapped ? version2 : version1;
  const rightVersion = swapped ? version1 : version2;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const handleSwap = () => {
    setSwapped(!swapped);
  };

  const handleDownload = (version: SceneVersion) => {
    const link = document.createElement('a');
    link.href = version.url;
    link.download = `version_${version.version}.jpg`;
    link.click();
  };

  const renderCompareView = () => {
    switch (compareMode) {
      case 'side-by-side':
        return (
          <div className="flex gap-4 h-full">
            <div className="flex-1 relative">
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="bg-black/60 text-white">
                  v{leftVersion.version}
                </Badge>
              </div>
              <div 
                className="relative h-full overflow-auto"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                }}
              >
                <Image
                  src={leftVersion.url}
                  alt={`Version ${leftVersion.version}`}
                  width={800}
                  height={600}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary" className="bg-black/60 text-white">
                  v{rightVersion.version}
                </Badge>
              </div>
              <div 
                className="relative h-full overflow-auto"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                }}
              >
                <Image
                  src={rightVersion.url}
                  alt={`Version ${rightVersion.version}`}
                  width={800}
                  height={600}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="relative h-full overflow-hidden">
            {/* Base image (right) */}
            <div 
              className="absolute inset-0"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              <Image
                src={rightVersion.url}
                alt={`Version ${rightVersion.version}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Overlay image (left) with clip */}
            <div 
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              <Image
                src={leftVersion.url}
                alt={`Version ${leftVersion.version}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Slider line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-2">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
            </div>

            {/* Version labels */}
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="bg-black/60 text-white">
                v{leftVersion.version}
              </Badge>
            </div>
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-black/60 text-white">
                v{rightVersion.version}
              </Badge>
            </div>

            {/* Slider control */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
              <Slider
                value={[sliderPosition]}
                onValueChange={([value]) => setSliderPosition(value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'overlay':
        return (
          <div className="relative h-full">
            {/* Base image */}
            <div 
              className="absolute inset-0"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              <Image
                src={rightVersion.url}
                alt={`Version ${rightVersion.version}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Overlay image with opacity */}
            <div 
              className="absolute inset-0"
              style={{
                opacity: overlayOpacity / 100,
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              <Image
                src={leftVersion.url}
                alt={`Version ${leftVersion.version}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Version labels */}
            <div className="absolute top-2 left-2 z-10 space-y-2">
              <Badge variant="secondary" className="bg-black/60 text-white">
                v{leftVersion.version} (위)
              </Badge>
              <Badge variant="secondary" className="bg-black/60 text-white">
                v{rightVersion.version} (아래)
              </Badge>
            </div>

            {/* Opacity control */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-black/60 p-3 rounded-lg">
              <div className="text-white text-sm text-center mb-2">
                투명도: {overlayOpacity}%
              </div>
              <Slider
                value={[overlayOpacity]}
                onValueChange={([value]) => setOverlayOpacity(value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'difference':
        return (
          <div className="relative h-full">
            <div 
              className="absolute inset-0"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              {/* Base image */}
              <Image
                src={rightVersion.url}
                alt={`Version ${rightVersion.version}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
              {/* Overlay with difference blend mode */}
              <div className="absolute inset-0 mix-blend-difference">
                <Image
                  src={leftVersion.url}
                  alt={`Version ${leftVersion.version}`}
                  width={1200}
                  height={800}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>

            {/* Info */}
            <div className="absolute top-2 left-2 z-10 bg-black/60 text-white p-2 rounded">
              <p className="text-sm">차이점 표시 모드</p>
              <p className="text-xs opacity-80">변경된 부분이 밝게 표시됩니다</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>버전 비교</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Compare mode selector */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                size="sm"
                variant={compareMode === 'side-by-side' ? 'default' : 'ghost'}
                onClick={() => setCompareMode('side-by-side')}
                className="h-8"
              >
                <SplitSquareHorizontal className="h-4 w-4 mr-1" />
                나란히
              </Button>
              <Button
                size="sm"
                variant={compareMode === 'slider' ? 'default' : 'ghost'}
                onClick={() => setCompareMode('slider')}
                className="h-8"
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                슬라이더
              </Button>
              <Button
                size="sm"
                variant={compareMode === 'overlay' ? 'default' : 'ghost'}
                onClick={() => setCompareMode('overlay')}
                className="h-8"
              >
                <Layers className="h-4 w-4 mr-1" />
                오버레이
              </Button>
              <Button
                size="sm"
                variant={compareMode === 'difference' ? 'default' : 'ghost'}
                onClick={() => setCompareMode('difference')}
                className="h-8"
              >
                차이점
              </Button>
            </div>

            {/* Swap button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleSwap}
              className="h-8"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              순서 바꾸기
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomOut}
                className="h-8 w-8"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomReset}
                className="px-2 h-8"
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomIn}
                className="h-8 w-8"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Download buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(leftVersion)}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                v{leftVersion.version}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(rightVersion)}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                v{rightVersion.version}
              </Button>
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="px-4 py-2 border-b grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">버전 {leftVersion.version}</span>
            <span className="text-muted-foreground">
              {format(new Date(leftVersion.uploadedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
              {' · '}
              {leftVersion.uploadedBy.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">버전 {rightVersion.version}</span>
            <span className="text-muted-foreground">
              {format(new Date(rightVersion.uploadedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
              {' · '}
              {rightVersion.uploadedBy.name}
            </span>
          </div>
        </div>

        {/* Compare view */}
        <div ref={containerRef} className="h-[60vh] bg-black/5">
          {renderCompareView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
