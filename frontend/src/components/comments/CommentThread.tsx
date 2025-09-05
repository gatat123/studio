'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Pin, 
  Check,
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  AtSign,
  Paperclip,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  positionX?: number;
  positionY?: number;
  page?: number;
  parentId?: string;
  resolved: boolean;
  pinned: boolean;
  mentions?: string[];
  attachments?: Attachment[];
  author: {
    id: string;
    email: string;
    nickname?: string;
    avatar?: string;
  };
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CommentThreadProps {
  sceneId: string;
  position?: { x: number; y: number };
  onClose?: () => void;
  className?: string;
}

export function CommentThread({
  sceneId,
  position,
  onClose,
  className,
}: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filter, setFilter] = useState<{
    resolved?: boolean;
    pinned?: boolean;
    hasPosition?: boolean;
  }>({});

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter.resolved !== undefined) {
        queryParams.append('resolved', filter.resolved.toString());
      }
      if (filter.pinned !== undefined) {
        queryParams.append('pinned', filter.pinned.toString());
      }
      if (position) {
        queryParams.append('hasPosition', 'true');
      }

      const response = await fetch(
        `/api/scenes/${sceneId}/comments?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('댓글을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 작성
  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? newComment : newComment;
    if (!content.trim() && attachedFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (position) {
        formData.append('positionX', position.x.toString());
        formData.append('positionY', position.y.toString());
      }
      
      if (parentId) {
        formData.append('parentId', parentId);
      }

      // 파일 첨부
      attachedFiles.forEach(file => {
        formData.append('files', file);
      });

      const endpoint = attachedFiles.length > 0
        ? `/api/scenes/${sceneId}/comments/with-files`
        : `/api/scenes/${sceneId}/comments`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: attachedFiles.length > 0 ? {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        } : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: attachedFiles.length > 0 ? formData : JSON.stringify({
          content,
          positionX: position?.x,
          positionY: position?.y,
          parentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create comment');

      setNewComment('');
      setReplyTo(null);
      setAttachedFiles([]);
      await fetchComments();
      toast.success('댓글이 작성되었습니다');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('댓글 작성에 실패했습니다');
    }
  };

  // 댓글 수정
  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error('Failed to update comment');

      setEditingId(null);
      setEditContent('');
      await fetchComments();
      toast.success('댓글이 수정되었습니다');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('댓글 수정에 실패했습니다');
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      await fetchComments();
      toast.success('댓글이 삭제되었습니다');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('댓글 삭제에 실패했습니다');
    }
  };

  // 해결 토글
  const toggleResolved = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle resolved');

      await fetchComments();
      toast.success('상태가 변경되었습니다');
    } catch (error) {
      console.error('Error toggling resolved:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  // 고정 토글
  const togglePinned = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/pin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to toggle pinned');

      await fetchComments();
      toast.success('고정 상태가 변경되었습니다');
    } catch (error) {
      console.error('Error toggling pinned:', error);
      toast.error('고정 상태 변경에 실패했습니다');
    }
  };

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  // 파일 제거
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchComments();
  }, [sceneId, filter]);

  // 댓글 렌더링
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={cn(
        'group relative',
        isReply && 'ml-12',
        comment.resolved && 'opacity-60'
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.nickname?.[0] || comment.author.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.author.nickname || comment.author.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.createdAt), 'PPp')}
            </span>
            {comment.pinned && (
              <Badge variant="secondary" className="h-5">
                <Pin className="h-3 w-3" />
              </Badge>
            )}
            {comment.resolved && (
              <Badge variant="secondary" className="h-5">
                <Check className="h-3 w-3" />
              </Badge>
            )}
          </div>

          {editingId === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpdate(comment.id)}
                >
                  저장
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setEditContent('');
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              
              {/* 첨부 파일 */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {comment.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                    >
                      <Paperclip className="h-3 w-3" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => setReplyTo(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  답글
                </Button>
                
                {user?.id === comment.author.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 ml-auto"
                  onClick={() => toggleResolved(comment.id)}
                >
                  {comment.resolved ? '미해결로 변경' : '해결됨'}
                </Button>
              </div>
            </>
          )}

          {/* 답글 입력 */}
          {replyTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(comment.id)}
                >
                  답글 작성
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* 답글 목록 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('bg-background rounded-lg shadow-lg', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          댓글
          {position && (
            <Badge variant="secondary">
              위치: {position.x.toFixed(0)}, {position.y.toFixed(0)}
            </Badge>
          )}
        </h3>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 필터 */}
      <div className="flex gap-2 p-4 border-b">
        <Button
          size="sm"
          variant={filter.pinned ? 'default' : 'outline'}
          onClick={() => setFilter(prev => ({
            ...prev,
            pinned: !prev.pinned
          }))}
        >
          <Pin className="h-3 w-3 mr-1" />
          고정됨
        </Button>
        <Button
          size="sm"
          variant={filter.resolved === false ? 'default' : 'outline'}
          onClick={() => setFilter(prev => ({
            ...prev,
            resolved: prev.resolved === false ? undefined : false
          }))}
        >
          미해결
        </Button>
        <Button
          size="sm"
          variant={filter.hasPosition ? 'default' : 'outline'}
          onClick={() => setFilter(prev => ({
            ...prev,
            hasPosition: !prev.hasPosition
          }))}
        >
          위치 댓글
        </Button>
      </div>

      {/* 댓글 목록 */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            댓글을 불러오는 중...
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            아직 댓글이 없습니다
          </div>
        )}
      </div>

      {/* 새 댓글 입력 */}
      <div className="border-t p-4 space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요... (@으로 멘션 가능)"
          className="min-h-[80px]"
        />
        
        {/* 첨부 파일 */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
              >
                <Paperclip className="h-3 w-3" />
                {file.name}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex gap-2">
            <input
              type="file"
              id="file-attach"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => document.getElementById('file-attach')?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!newComment.trim() && attachedFiles.length === 0}
          >
            <Send className="h-4 w-4 mr-1" />
            댓글 작성
          </Button>
        </div>
      </div>
    </div>
  );
}
