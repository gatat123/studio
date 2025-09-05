'use client';

import React, { useState, useRef } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommentThread } from './CommentThread';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AnnotationPoint {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  hasComments: boolean;
  commentCount: number;
  resolved: boolean;
}

interface AnnotationLayerProps {
  sceneId: string;
  imageUrl: string;
  annotations?: AnnotationPoint[];
  allowCreate?: boolean;
  className?: string;
}

export function AnnotationLayer({
  sceneId,
  imageUrl,
  annotations = [],
  allowCreate = true,
  className,
}: AnnotationLayerProps) {
  const [localAnnotations, setLocalAnnotations] = useState<AnnotationPoint[]>(annotations);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 이미지 클릭으로 새 댓글 위치 생성
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCreating || !allowCreate) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnnotation: AnnotationPoint = {
      id: `temp-${Date.now()}`,
      x,
      y,
      hasComments: false,
      commentCount: 0,
      resolved: false,
    };

    setLocalAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotation(newAnnotation.id);
    setIsCreating(false);
  };

  // 댓글 마커 렌더링
  const renderAnnotationMarker = (annotation: AnnotationPoint) => {
    const isActive = activeAnnotation === annotation.id;
    
    return (
      <Popover
        key={annotation.id}
        open={isActive}
        onOpenChange={(open) => {
          if (!open) setActiveAnnotation(null);
        }}
      >
        <PopoverTrigger asChild>
          <button
            className={cn(
              "absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2",
              "rounded-full border-2 border-white shadow-lg",
              "flex items-center justify-center transition-all",
              "hover:scale-110 focus:outline-none focus:ring-2",
              annotation.resolved 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-blue-500 hover:bg-blue-600",
              isActive && "ring-2 ring-offset-2 ring-blue-500"
            )}
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
            }}
            onClick={() => setActiveAnnotation(annotation.id)}
          >
            {annotation.commentCount > 0 ? (
              <span className="text-white text-xs font-semibold">
                {annotation.commentCount}
              </span>
            ) : (
              <MessageCircle className="w-4 h-4 text-white" />
            )}
          </button>
        </PopoverTrigger>
        
        <PopoverContent
          side="right"
          align="start"
          className="w-96 p-0"
          sideOffset={10}
        >
          <CommentThread
            sceneId={sceneId}
            position={{ x: annotation.x, y: annotation.y }}
            onClose={() => setActiveAnnotation(null)}
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* 이미지 컨테이너 */}
      <div
        className="relative w-full h-full cursor-crosshair"
        onClick={handleImageClick}
        style={{ cursor: isCreating ? 'crosshair' : 'default' }}
      >
        <img
          src={imageUrl}
          alt="Scene"
          className="w-full h-full object-contain"
          draggable={false}
        />
        
        {/* 댓글 마커들 */}
        {localAnnotations.map(renderAnnotationMarker)}
      </div>

      {/* 댓글 추가 버튼 */}
      {allowCreate && (
        <Button
          variant={isCreating ? "destructive" : "default"}
          size="sm"
          className="absolute top-4 right-4 shadow-lg"
          onClick={() => setIsCreating(!isCreating)}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isCreating ? '취소' : '댓글 추가'}
        </Button>
      )}
    </div>
  );
}