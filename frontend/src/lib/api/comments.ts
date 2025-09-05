import { apiClient } from './client';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../types/comment.types';

// Comment API functions
export const commentApi = {
  // Create a comment
  create: async (sceneId: string, data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post(`/scenes/${sceneId}/comments`, data);
    return response.data;
  },

  // Get all comments for a scene
  getAll: async (sceneId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/scenes/${sceneId}/comments`);
    return response.data;
  },

  // Get a single comment
  getOne: async (commentId: string): Promise<Comment> => {
    const response = await apiClient.get(`/comments/${commentId}`);
    return response.data;
  },

  // Update a comment
  update: async (commentId: string, data: UpdateCommentDto): Promise<Comment> => {
    const response = await apiClient.patch(`/comments/${commentId}`, data);
    return response.data;
  },

  // Delete a comment
  delete: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // Reply to a comment
  reply: async (commentId: string, data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post(`/comments/${commentId}/reply`, data);
    return response.data;
  },

  // Toggle resolved status
  toggleResolved: async (commentId: string): Promise<Comment> => {
    const response = await apiClient.patch(`/comments/${commentId}/resolve`);
    return response.data;
  },

  // Toggle pinned status
  togglePinned: async (commentId: string): Promise<Comment> => {
    const response = await apiClient.post(`/comments/${commentId}/pin`);
    return response.data;
  },
};