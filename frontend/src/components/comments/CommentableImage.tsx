// CommentableImage.tsx - Image viewer with comment markers
import React, { useState, useRef, useEffect } from 'react';
import { Comment, CommentMarker as CommentMarkerType } from '@/types/comment.types';
import { CommentMarker } from './CommentMarker';
import { CommentEditor } from './CommentEditor';
import { CommentThread } from './CommentThread';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CommentableImageProps {
  src: string;
  alt?: string;
  sceneId: string;
  comments?: Comment[];
  onCommentCreate?: (comment: CreateCommentDto) => void;
  onCommentClick?: (commentId: string) => void;
  className?: string;
  allowNewComments?: boolean;
  users?: Array<{
    id: string;
    nickname: string;
    email: string;
    profileImage?: string;
  }>;
}

export function CommentableImage({  src,
  alt = '',
  sceneId,
  comments = [],
  onCommentCreate,
  onCommentClick,
  className,
  allowNewComments = true,
  users = [],
}: CommentableImageProps) {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentPosition, setNewCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Convert comments to markers
  const markers: CommentMarkerType[] = comments
    .filter(comment => comment.position && !comment.parentId)
    .map(comment => ({
      commentId: comment.id,
      position: comment.position!,
      resolved: comment.resolved,
      hasReplies: (comment.replies?.length || 0) > 0,
      user: comment.user ? {
        nickname: comment.user.nickname,
        profileImage: comment.user.profileImage,
      } : undefined,
    }));

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {    if (!allowNewComments) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if clicking on existing marker
    const clickedMarker = markers.find(marker => {
      const dx = Math.abs(marker.position.x - x);
      const dy = Math.abs(marker.position.y - y);
      return dx < 3 && dy < 3; // 3% tolerance
    });
    
    if (clickedMarker) {
      setSelectedCommentId(clickedMarker.commentId);
      onCommentClick?.(clickedMarker.commentId);
    } else {
      setNewCommentPosition({ x, y });
      setIsAddingComment(true);
    }
  };

  const handleCommentSubmit = (data: CreateCommentDto) => {
    if (newCommentPosition) {
      onCommentCreate?.({
        ...data,
        position: newCommentPosition,
      });
    }
    setIsAddingComment(false);
    setNewCommentPosition(null);
  };
  const handleMarkerClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    onCommentClick?.(commentId);
  };

  return (
    <div className={cn("relative group", className)}>
      <div
        ref={imageContainerRef}
        className="relative w-full cursor-crosshair"
        onClick={handleImageClick}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto select-none"
          draggable={false}
        />
        
        {/* Comment Markers */}
        {markers.map(marker => (
          <CommentMarker
            key={marker.commentId}
            marker={marker}
            isActive={selectedCommentId === marker.commentId}
            onClick={handleMarkerClick}
            onHover={setHoveredCommentId}
            showPreview={true}
          />
        ))}
        
        {/* New Comment Position Marker */}
        {isAddingComment && newCommentPosition && (
          <Popover open={isAddingComment} onOpenChange={setIsAddingComment}>
            <PopoverTrigger asChild>
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse"
                style={{
                  left: `${newCommentPosition.x}%`,
                  top: `${newCommentPosition.y}%`,
                }}
              >
                <Plus className="w-4 h-4 text-white" />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              side="right" 
              className="w-96 p-0"
              align="start"
            >
              <div className="p-4">
                <h4 className="font-medium mb-3">Add Comment</h4>
                <CommentEditor
                  sceneId={sceneId}
                  position={newCommentPosition}
                  onSubmit={handleCommentSubmit}
                  onCancel={() => {
                    setIsAddingComment(false);
                    setNewCommentPosition(null);
                  }}
                  users={users}
                  autoFocus={true}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Hover Instruction */}
      {allowNewComments && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-2 py-1 rounded text-xs pointer-events-none">
          Click anywhere on the image to add a comment
        </div>
      )}

      {/* Selected Comment Thread */}
      {selectedCommentId && (
        <Popover open={!!selectedCommentId} onOpenChange={(open) => !open && setSelectedCommentId(null)}>
          <PopoverTrigger asChild>
            <div className="absolute top-0 left-0 w-0 h-0" />
          </PopoverTrigger>
          <PopoverContent 
            side="right" 
            className="w-96 p-0 max-h-[600px] overflow-auto"
            align="start"
          >
            <CommentThread
              sceneId={sceneId}
              position={comments.find(c => c.id === selectedCommentId)?.position}
              onClose={() => setSelectedCommentId(null)}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}