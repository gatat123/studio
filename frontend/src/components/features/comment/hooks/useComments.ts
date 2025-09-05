'use client';

import { useState, useEffect } from 'react';
import { commentApi } from '@/lib/api/comments';
import { Comment, CreateCommentDto, UpdateCommentDto } from '@/lib/types/comment.types';
import { toast } from 'sonner';

export function useComments(sceneId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentApi.getAll(sceneId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Create comment
  const createComment = async (data: CreateCommentDto) => {
    try {
      const newComment = await commentApi.create(sceneId, data);
      setComments(prev => [...prev, newComment]);
      toast.success('댓글이 작성되었습니다.');
      return newComment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('댓글 작성에 실패했습니다.');
      throw error;
    }
  };
  // Update comment
  const updateComment = async (commentId: string, data: UpdateCommentDto) => {
    try {
      const updatedComment = await commentApi.update(commentId, data);
      setComments(prev => prev.map(c => 
        c.id === commentId ? updatedComment : c
      ));
      toast.success('댓글이 수정되었습니다.');
      return updatedComment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('댓글 수정에 실패했습니다.');
      throw error;
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      await commentApi.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('댓글 삭제에 실패했습니다.');
      throw error;
    }
  };

  // Reply to comment
  const replyToComment = async (commentId: string, data: CreateCommentDto) => {
    try {
      const reply = await commentApi.reply(commentId, data);
      // Update parent comment's replies
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), reply]
          };
        }
        return c;
      }));
      toast.success('답글이 작성되었습니다.');
      return reply;
    } catch (error) {
      console.error('Failed to reply to comment:', error);
      toast.error('답글 작성에 실패했습니다.');
      throw error;
    }
  };

  // Toggle resolved
  const toggleResolved = async (commentId: string) => {
    try {
      const updated = await commentApi.toggleResolved(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? updated : c
      ));
      toast.success(updated.resolved ? '해결됨으로 표시했습니다.' : '해결 표시를 취소했습니다.');
      return updated;
    } catch (error) {
      console.error('Failed to toggle resolved:', error);
      toast.error('상태 변경에 실패했습니다.');
      throw error;
    }
  };

  // Toggle pinned
  const togglePinned = async (commentId: string) => {
    try {
      const updated = await commentApi.togglePinned(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? updated : c
      ));
      toast.success(updated.pinned ? '고정되었습니다.' : '고정이 해제되었습니다.');
      return updated;
    } catch (error) {
      console.error('Failed to toggle pinned:', error);
      toast.error('고정 상태 변경에 실패했습니다.');
      throw error;
    }
  };

  useEffect(() => {
    if (sceneId) {
      fetchComments();
    }
  }, [sceneId]);

  return {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    replyToComment,
    toggleResolved,
    togglePinned,
    refetch: fetchComments,
  };
}