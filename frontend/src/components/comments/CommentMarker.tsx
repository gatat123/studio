// CommentMarker.tsx - Display comment markers on images
import React, { useState } from 'react';
import { Comment, CommentMarker as CommentMarkerType } from '@/types/comment.types';
import { MessageCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommentMarkerProps {
  marker: CommentMarkerType;
  isActive?: boolean;
  onClick?: (commentId: string) => void;
  onHover?: (commentId: string | null) => void;
  showPreview?: boolean;
}

export function CommentMarker({
  marker,
  isActive = false,
  onClick,
  onHover,
  showPreview = true,
}: CommentMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(marker.commentId);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(marker.commentId);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  return (
    <TooltipProvider>
      <Tooltip open={showPreview && isHovered}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200",
              "w-8 h-8 rounded-full flex items-center justify-center",
              marker.resolved 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-blue-500 hover:bg-blue-600",
              isActive && "ring-2 ring-white ring-offset-2 ring-offset-blue-600",
              isHovered && "scale-110 z-10"
            )}
            style={{
              left: `${marker.position.x}%`,
              top: `${marker.position.y}%`,
            }}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {marker.resolved ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <MessageCircle className="w-4 h-4 text-white" />
            )}
            {marker.hasReplies && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </div>
        </TooltipTrigger>
        {showPreview && (
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              {marker.user && (
                <div className="flex items-center gap-2">
                  {marker.user.profileImage ? (
                    <img
                      src={marker.user.profileImage}
                      alt={marker.user.nickname}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white">
                      {marker.user.nickname[0]}
                    </div>
                  )}
                  <span className="font-semibold text-sm">
                    {marker.user.nickname}
                  </span>
                </div>
              )}
              {marker.resolved && (
                <div className="text-xs text-green-600">✓ Resolved</div>
              )}
              <div className="text-xs text-gray-500">
                Click to view {marker.hasReplies ? 'thread' : 'comment'}
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
