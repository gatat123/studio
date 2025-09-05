// CommentItem.tsx - Individual comment item component
import React, { useState } from 'react';
import { Comment } from '@/types/comment.types';
import { CommentEditor } from './CommentEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2, 
  Check, 
  Pin,
  MessageCircle,
  MapPin,
  Paperclip,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];  onCommentClick?: (comment: Comment) => void;
  onReply?: (commentId: string) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  onResolve?: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  currentUserId?: string;
  replyCount?: number;
  isReply?: boolean;
  className?: string;
}

export function CommentItem({
  comment,
  replies = [],
  onCommentClick,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onPin,
  currentUserId,
  replyCount = 0,
  isReply = false,
  className,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isOwner = currentUserId === comment.userId;
  const hasReplies = replies.length > 0 || replyCount > 0;

  const handleReplySubmit = (data: any) => {
    onReply?.(comment.id);
    setIsReplying(false);
  };

  const handleEditSubmit = (data: any) => {
    onEdit?.({ ...comment, content: data.content });
    setIsEditing(false);
  };

  return (
    <div className={cn(
      "group",
      isReply && "ml-12",
      comment.resolved && "opacity-60",
      className
    )}>
      <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.user?.profileImage} />
          <AvatarFallback>
            {comment.user?.nickname?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        {/* Content */}
        <div className="flex-1 space-y-1">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.user?.nickname || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
            </span>
            
            {/* Badges */}
            {comment.pinned && (
              <Badge variant="secondary" className="h-5">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            {comment.resolved && (
              <Badge variant="secondary" className="h-5 bg-green-100">
                <Check className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            )}
            {comment.position && (
              <Badge variant="secondary" className="h-5">
                <MapPin className="h-3 w-3 mr-1" />
                {Math.round(comment.position.x)}, {Math.round(comment.position.y)}
              </Badge>
            )}          </div>

          {/* Comment content or editor */}
          {isEditing ? (
            <CommentEditor
              sceneId={comment.sceneId}
              initialContent={comment.content}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              submitButtonText="Save"
              className="mt-2"
            />
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">
                {comment.content}
              </p>
              
              {/* Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {comment.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                    >
                      <Paperclip className="h-3 w-3" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {/* Reply button */}
            {!isReply && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {/* Show replies toggle */}
            {hasReplies && !isReply && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                {replyCount || replies.length} {(replyCount || replies.length) === 1 ? 'reply' : 'replies'}
              </Button>
            )}
            
            {/* Action menu */}
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.position && (
                    <DropdownMenuItem onClick={() => onCommentClick?.(comment)}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Go to Position
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onResolve?.(comment.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    {comment.resolved ? 'Unresolve' : 'Resolve'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPin?.(comment.id)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {comment.pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Reply editor */}
          {isReplying && (
            <div className="mt-3">
              <CommentEditor
                sceneId={comment.sceneId}
                parentId={comment.id}
                onSubmit={handleReplySubmit}
                onCancel={() => setIsReplying(false)}
                submitButtonText="Reply"
                placeholder="Write a reply..."
                className="mt-2"
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResolve={onResolve}
                  currentUserId={currentUserId}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}