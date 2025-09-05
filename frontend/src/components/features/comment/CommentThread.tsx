'use client';

import React, { useState, useRef } from 'react';
import { Comment } from '@/lib/types/comment.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Pin,
  CheckCircle,
  MoreHorizontal,
  Trash,
  Edit,
  Reply,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CommentThreadProps {
  comment: Comment;
  onUpdate: (commentId: string, data: any) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (commentId: string, data: any) => Promise<void>;
  onToggleResolved: (commentId: string) => Promise<void>;
  onTogglePinned: (commentId: string) => Promise<void>;
  currentUserId?: string;
  isOwner?: boolean;
}
export function CommentThread({
  comment,
  onUpdate,
  onDelete,
  onReply,
  onToggleResolved,
  onTogglePinned,
  currentUserId,
  isOwner,
}: CommentThreadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    await onUpdate(comment.id, { content: editContent });
    setIsEditing(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    await onReply(comment.id, { content: replyContent });
    setReplyContent('');
    setIsReplying(false);
  };

  const isAuthor = currentUserId === comment.userId;

  return (
    <Card className={cn(
      'p-4',
      comment.resolved && 'opacity-60',
      comment.pinned && 'border-primary'
    )}>
      <div className="space-y-3">
        {/* Comment Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author?.avatar} />
              <AvatarFallback>
                {comment.author?.nickname?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {comment.author?.nickname || 'Unknown'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
                {comment.pinned && (
                  <Pin className="h-3 w-3 text-primary" />
                )}
                {comment.resolved && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
            </div>
          </div>