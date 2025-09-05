'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Reply,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Pin,
  PinOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  position?: { x: number; y: number };
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  updatedAt?: string;
  resolved: boolean;
  pinned: boolean;
  replies: Comment[];
}

interface SceneCommentsProps {
  sceneId: string;
  projectId: string;
}

export default function SceneComments({ sceneId, projectId }: SceneCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadComments();
  }, [sceneId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      // 실제 구현에서는 API 호출
      const mockComments: Comment[] = [
        {
          id: '1',
          content: '이 부분의 색감이 너무 어두운 것 같아요. 조금 더 밝게 수정해주실 수 있을까요?',
          author: {
            id: '1',
            name: '김디렉터',
            avatar: '/api/placeholder/40/40',
            role: 'Director'
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          resolved: false,
          pinned: true,
          replies: [
            {
              id: '1-1',
              content: '네, 확인했습니다. 수정하겠습니다!',
              author: {
                id: '2',
                name: '이작가',
                avatar: '/api/placeholder/40/40',
                role: 'Artist'
              },
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              resolved: false,
              pinned: false,
              replies: []
            }
          ]
        },
        {
          id: '2',
          content: '캐릭터 표정이 정말 잘 표현되었네요! 👍',
          author: {
            id: '3',
            name: '박매니저',
            avatar: '/api/placeholder/40/40',
            role: 'Manager'
          },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          resolved: true,
          pinned: false,
          replies: []
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      toast({
        title: '오류',
        description: '댓글을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          id: 'current-user',
          name: '현재 사용자',
          avatar: '/api/placeholder/40/40',
          role: 'Member'
        },
        createdAt: new Date().toISOString(),
        resolved: false,
        pinned: false,
        replies: []
      };

      setComments([comment, ...comments]);
      setNewComment('');
      
      toast({
        title: '성공',
        description: '댓글이 작성되었습니다.'
      });
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      toast({
        title: '오류',
        description: '댓글 작성에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const reply: Comment = {
        id: `${commentId}-${Date.now()}`,
        content: replyContent,
        author: {
          id: 'current-user',
          name: '현재 사용자',
          avatar: '/api/placeholder/40/40',
          role: 'Member'
        },
        createdAt: new Date().toISOString(),
        resolved: false,
        pinned: false,
        replies: []
      };

      setComments(comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, reply] };
        }
        return c;
      }));

      setReplyTo(null);
      setReplyContent('');
      
      toast({
        title: '성공',
        description: '답글이 작성되었습니다.'
      });
    } catch (error) {
      console.error('답글 작성 실패:', error);
      toast({
        title: '오류',
        description: '답글 작성에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const toggleResolved = async (commentId: string) => {
    try {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return { ...c, resolved: !c.resolved };
        }
        return c;
      }));
      
      toast({
        title: '성공',
        description: '댓글 상태가 변경되었습니다.'
      });
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const togglePinned = async (commentId: string) => {
    try {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return { ...c, pinned: !c.pinned };
        }
        return c;
      }));
      
      toast({
        title: '성공',
        description: '고정 상태가 변경되었습니다.'
      });
    } catch (error) {
      console.error('고정 상태 변경 실패:', error);
      toast({
        title: '오류',
        description: '고정 상태 변경에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      setComments(comments.filter(c => c.id !== commentId));
      
      toast({
        title: '성공',
        description: '댓글이 삭제되었습니다.'
      });
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      toast({
        title: '오류',
        description: '댓글 삭제에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const filteredComments = showResolved 
    ? comments 
    : comments.filter(c => !c.resolved);

  const pinnedComments = filteredComments.filter(c => c.pinned);
  const unpinnedComments = filteredComments.filter(c => !c.pinned);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 댓글 작성 폼 */}
      <Card className="p-4">
        <div className="space-y-4">
          <Textarea
            placeholder="댓글을 작성하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              댓글 작성
            </Button>
          </div>
        </div>
      </Card>

      {/* 필터 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          댓글 {comments.length}개
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? '미해결만 보기' : '모든 댓글 보기'}
        </Button>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {/* 고정된 댓글 */}
        {pinnedComments.map(comment => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onReply={() => setReplyTo(comment.id)}
            onToggleResolved={toggleResolved}
            onTogglePinned={togglePinned}
            onDelete={deleteComment}
            isReplying={replyTo === comment.id}
            replyContent={replyContent}
            onReplyContentChange={setReplyContent}
            onSubmitReply={() => handleReply(comment.id)}
            onCancelReply={() => {
              setReplyTo(null);
              setReplyContent('');
            }}
          />
        ))}

        {/* 일반 댓글 */}
        {unpinnedComments.map(comment => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onReply={() => setReplyTo(comment.id)}
            onToggleResolved={toggleResolved}
            onTogglePinned={togglePinned}
            onDelete={deleteComment}
            isReplying={replyTo === comment.id}
            replyContent={replyContent}
            onReplyContentChange={setReplyContent}
            onSubmitReply={() => handleReply(comment.id)}
            onCancelReply={() => {
              setReplyTo(null);
              setReplyContent('');
            }}
          />
        ))}

        {filteredComments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {showResolved ? '댓글이 없습니다.' : '미해결 댓글이 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
}

// 댓글 카드 컴포넌트
function CommentCard({ 
  comment, 
  onReply, 
  onToggleResolved, 
  onTogglePinned,
  onDelete,
  isReplying,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply
}: any) {
  return (
    <Card className={`p-4 ${comment.resolved ? 'opacity-60' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar>
              <img src={comment.author.avatar} alt={comment.author.name} />
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.author.name}</span>
                <Badge variant="outline" className="text-xs">
                  {comment.author.role}
                </Badge>
                {comment.pinned && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Pin className="h-3 w-3 mr-1" />
                    고정됨
                  </Badge>
                )}
                {comment.resolved && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    해결됨
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { 
                    addSuffix: true,
                    locale: ko 
                  })}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  답글
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleResolved(comment.id)}
                >
                  {comment.resolved ? '미해결로 변경' : '해결됨으로 표시'}
                </Button>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTogglePinned(comment.id)}>
                {comment.pinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    고정 해제
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    고정
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 답글 작성 폼 */}
        {isReplying && (
          <div className="ml-12 space-y-2">
            <Textarea
              placeholder="답글을 작성하세요..."
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelReply}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={onSubmitReply}
                disabled={!replyContent.trim()}
              >
                답글 작성
              </Button>
            </div>
          </div>
        )}

        {/* 답글 목록 */}
        {comment.replies.length > 0 && (
          <div className="ml-12 space-y-3">
            {comment.replies.map((reply: Comment) => (
              <div key={reply.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <img src={reply.author.avatar} alt={reply.author.name} />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{reply.author.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), { 
                        addSuffix: true,
                        locale: ko 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
