'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  MoreHorizontal,
  Reply,
  Pin,
  CheckCircle,
  Edit,
  Trash,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: any;
  currentUserId?: string;
  isOwner?: boolean;
  onReply: (commentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onToggleResolved: (commentId: string) => void;
  onTogglePinned: (commentId: string) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  currentUserId,
  isOwner = false,
  onReply,
  onEdit,
  onDelete,
  onToggleResolved,
  onTogglePinned,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const isAuthor = currentUserId === comment.author?.id;

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3',
        depth > 0 && 'ml-12',
        comment.resolved && 'opacity-60'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author?.avatar} />
        <AvatarFallback>
          {comment.author?.nickname?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.author?.nickname || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            {comment.pinned && (
              <Badge variant="secondary" className="h-5 text-xs">
                <Pin className="h-3 w-3 mr-1" />
                고정됨
              </Badge>
            )}
            {comment.resolved && (
              <Badge variant="outline" className="h-5 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                해결됨
              </Badge>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!comment.parentId && (
                <>
                  <DropdownMenuItem onClick={() => onToggleResolved(comment.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {comment.resolved ? '미해결로 표시' : '해결됨으로 표시'}
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem onClick={() => onTogglePinned(comment.id)}>
                      <Pin className="mr-2 h-4 w-4" />
                      {comment.pinned ? '고정 해제' : '고정'}
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {isAuthor && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit}>
                <Check className="h-4 w-4 mr-1" />
                저장
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            
            {/* Reply button */}
            {!comment.parentId && depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                답글
              </Button>
            )}
          </>
        )}

        {/* Reply form */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력하세요..."
              className="min-h-[60px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply}>
                답글 작성
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
              >
                취소
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply: any) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                isOwner={isOwner}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleResolved={onToggleResolved}
                onTogglePinned={onTogglePinned}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}