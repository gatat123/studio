// CommentList.tsx - Comment list with filtering
import React, { useState } from 'react';
import { Comment, CommentFilter } from '@/types/comment.types';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Filter, 
  MessageCircle, 
  Pin, 
  Check,
  Search,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CommentListProps {
  comments: Comment[];
  onCommentClick?: (comment: Comment) => void;
  onReply?: (commentId: string) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  onResolve?: (commentId: string) => void;
  onPin?: (commentId: string) => void;  currentUserId?: string;
  className?: string;
  showFilters?: boolean;
}

export function CommentList({
  comments,
  onCommentClick,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onPin,
  currentUserId,
  className,
  showFilters = true,
}: CommentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CommentFilter>({});
  
  // Filter comments
  const filteredComments = comments.filter(comment => {
    // Search filter
    if (searchTerm && !comment.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filters
    if (filter.resolved !== undefined && comment.resolved !== filter.resolved) {
      return false;
    }
    if (filter.pinned !== undefined && comment.pinned !== filter.pinned) {      return false;
    }
    if (filter.hasPosition !== undefined) {
      const hasPos = !!comment.position;
      if (filter.hasPosition !== hasPos) return false;
    }
    if (filter.userId && comment.userId !== filter.userId) {
      return false;
    }
    if (filter.parentId !== undefined) {
      if (filter.parentId === null && comment.parentId) return false;
      if (filter.parentId && comment.parentId !== filter.parentId) return false;
    }
    
    return true;
  });

  // Group comments by thread
  const threadedComments = filteredComments.filter(c => !c.parentId);
  
  const getReplyCount = (commentId: string): number => {
    return comments.filter(c => c.parentId === commentId).length;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {/* Search */}          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filter.pinned ? "default" : "outline"}
              onClick={() => setFilter(prev => ({
                ...prev,
                pinned: prev.pinned === true ? undefined : true
              }))}
            >
              <Pin className="w-3 h-3 mr-1" />
              Pinned
            </Button>
            
            <Button
              size="sm"
              variant={filter.resolved === false ? "default" : "outline"}
              onClick={() => setFilter(prev => ({
                ...prev,
                resolved: prev.resolved === false ? undefined : false
              }))}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Unresolved
            </Button>
            
            <Button
              size="sm"
              variant={filter.resolved === true ? "default" : "outline"}
              onClick={() => setFilter(prev => ({
                ...prev,
                resolved: prev.resolved === true ? undefined : true
              }))}
            >
              <Check className="w-3 h-3 mr-1" />
              Resolved
            </Button>
            
            <Button
              size="sm"
              variant={filter.hasPosition ? "default" : "outline"}
              onClick={() => setFilter(prev => ({
                ...prev,
                hasPosition: prev.hasPosition ? undefined : true
              }))}
            >
              <MapPin className="w-3 h-3 mr-1" />
              With Position
            </Button>
            
            <Button
              size="sm"
              variant={filter.parentId === null ? "default" : "outline"}
              onClick={() => setFilter(prev => ({
                ...prev,
                parentId: prev.parentId === null ? undefined : null
              }))}
            >
              Top Level
            </Button>
            
            {Object.keys(filter).length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFilter({})}
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filteredComments.length} of {comments.length} comments
          </div>
        </div>
      )}
      {/* Comment List */}
      <div className="space-y-2">
        {threadedComments.length > 0 ? (
          threadedComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comments.filter(c => c.parentId === comment.id)}
              onCommentClick={onCommentClick}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onResolve={onResolve}
              onPin={onPin}
              currentUserId={currentUserId}
              replyCount={getReplyCount(comment.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || Object.keys(filter).length > 0 
              ? 'No comments match your filters'
              : 'No comments yet'}
          </div>
        )}
      </div>
    </div>
  );
}