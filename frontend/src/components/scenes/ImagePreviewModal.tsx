'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: {
    id: string;
    url: string;
    title: string;
    type?: 'draft' | 'artwork';
  }[];
  initialIndex?: number;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex].url;
    link.download = `${images[currentIndex].title}.jpg`;
    link.click();
  };

  if (!images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{currentImage.title}</h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} / {images.length}
              {currentImage.type && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                  {currentImage.type === 'draft' ? '초안' : '아트워크'}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-black/50 rounded-lg p-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/20 h-8 w-8"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomReset}
                className="text-white hover:bg-white/20 px-2 h-8"
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/20 h-8 w-8"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDownload}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative flex items-center justify-center h-[85vh]">
          {/* Previous button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrevious}
            className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
            disabled={images.length <= 1}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Image container */}
          <div 
            className="relative overflow-auto max-w-full max-h-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease',
            }}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.title}
              width={1200}
              height={800}
              className="object-contain"
              priority
            />
          </div>

          {/* Next button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
            disabled={images.length <= 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Thumbnail strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
          <div className="flex gap-2 overflow-x-auto py-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                className={cn(
                  "relative flex-shrink-0 rounded overflow-hidden transition-all",
                  "hover:ring-2 hover:ring-white/50",
                  index === currentIndex && "ring-2 ring-primary"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.title}
                  width={80}
                  height={60}
                  className="object-cover"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
