import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import api from '@/lib/api/client';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  sceneId: string;
  projectId: string;
  parentId?: string;
  position?: {
    x: number;
    y: number;
    page?: number;
  };
  resolved: boolean;
  pinned: boolean;
  mentions?: string[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  replies?: Comment[];
  user: {
    id: string;
    email: string;
    nickname: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseCommentsOptions {
  sceneId?: string;
  projectId?: string;
  autoFetch?: boolean;
}

export function useComments({ 
  sceneId, 
  projectId,
  autoFetch = true 
}: UseCommentsOptions = {}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useWebSocket();

  // 댓글 목록 가져오기
  const fetchComments = useCallback(async () => {
    if (!sceneId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      
      const response = await api.get(`/scenes/${sceneId}/comments?${params}`);
      setComments(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load comments');
      toast.error('댓글을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [sceneId, projectId]);

  // 댓글 생성
  const createComment = useCallback(async (data: {
    content: string;
    position?: { x: number; y: number };
    parentId?: string;
    mentions?: string[];
    attachments?: File[];
  }) => {
    if (!sceneId) return null;

    try {
      let commentData = { ...data, sceneId };
      
      // 파일 첨부가 있는 경우
      if (data.attachments && data.attachments.length > 0) {
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('sceneId', sceneId);
        
        if (data.position) {
          formData.append('position', JSON.stringify(data.position));
        }
        if (data.parentId) {
          formData.append('parentId', data.parentId);
        }
        if (data.mentions) {
          formData.append('mentions', JSON.stringify(data.mentions));
        }
        
        data.attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        const response = await api.post('/comments/with-attachments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // 낙관적 업데이트
        setComments(prev => [...prev, response.data]);
        toast.success('댓글이 작성되었습니다.');
        return response.data;
      } else {
        const response = await api.post(`/scenes/${sceneId}/comments`, commentData);
        setComments(prev => [...prev, response.data]);
        toast.success('댓글이 작성되었습니다.');
        return response.data;
      }
    } catch (err: any) {
      toast.error('댓글 작성에 실패했습니다.');
      throw err;
    }
  }, [sceneId]);

  // 댓글 수정
  const updateComment = useCallback(async (
    commentId: string, 
    updates: Partial<Comment>
  ) => {
    try {
      const response = await api.patch(`/comments/${commentId}`, updates);
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? response.data : comment
      ));
      
      toast.success('댓글이 수정되었습니다.');
      return response.data;
    } catch (err: any) {
      toast.error('댓글 수정에 실패했습니다.');
      throw err;
    }
  }, []);

  // 댓글 삭제
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('댓글이 삭제되었습니다.');
    } catch (err: any) {
      toast.error('댓글 삭제에 실패했습니다.');
      throw err;
    }
  }, []);

  // 댓글 해결 표시
  const resolveComment = useCallback(async (commentId: string, resolved: boolean) => {
    try {
      const response = await api.put(`/comments/${commentId}/resolve`, { resolved });
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, resolved } : comment
      ));
      
      toast.success(resolved ? '댓글이 해결되었습니다.' : '댓글을 다시 열었습니다.');
      return response.data;
    } catch (err: any) {
      toast.error('상태 변경에 실패했습니다.');
      throw err;
    }
  }, []);

  // 댓글 고정
  const pinComment = useCallback(async (commentId: string, pinned: boolean) => {
    try {
      const response = await api.post(`/comments/${commentId}/pin`, { pinned });
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, pinned } : comment
      ));
      
      toast.success(pinned ? '댓글이 고정되었습니다.' : '고정이 해제되었습니다.');
      return response.data;
    } catch (err: any) {
      toast.error('고정 상태 변경에 실패했습니다.');
      throw err;
    }
  }, []);

  // WebSocket 이벤트 리스너
  useEffect(() => {
    if (!socket || !isConnected || !sceneId) return;

    const handleCommentCreate = (data: Comment) => {
      if (data.sceneId === sceneId) {
        setComments(prev => {
          // 중복 방지
          if (prev.some(c => c.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    };

    const handleCommentUpdate = (data: Comment) => {
      if (data.sceneId === sceneId) {
        setComments(prev => prev.map(comment => 
          comment.id === data.id ? data : comment
        ));
      }
    };

    const handleCommentDelete = (data: { id: string; sceneId: string }) => {
      if (data.sceneId === sceneId) {
        setComments(prev => prev.filter(comment => comment.id !== data.id));
      }
    };

    const handleCommentResolve = (data: { id: string; resolved: boolean; sceneId: string }) => {
      if (data.sceneId === sceneId) {
        setComments(prev => prev.map(comment => 
          comment.id === data.id ? { ...comment, resolved: data.resolved } : comment
        ));
      }
    };

    socket.on('comment:create', handleCommentCreate);
    socket.on('comment:update', handleCommentUpdate);
    socket.on('comment:delete', handleCommentDelete);
    socket.on('comment:resolve', handleCommentResolve);

    return () => {
      socket.off('comment:create', handleCommentCreate);
      socket.off('comment:update', handleCommentUpdate);
      socket.off('comment:delete', handleCommentDelete);
      socket.off('comment:resolve', handleCommentResolve);
    };
  }, [socket, isConnected, sceneId]);

  // 자동 fetch
  useEffect(() => {
    if (autoFetch && sceneId) {
      fetchComments();
    }
  }, [sceneId, autoFetch]);

  // 프로젝트 룸 참가
  useEffect(() => {
    if (socket && isConnected && projectId) {
      socket.emit('project:join', projectId);
      
      return () => {
        socket.emit('project:leave', projectId);
      };
    }
  }, [socket, isConnected, projectId]);

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    pinComment,
    refetch: fetchComments,
  };
}