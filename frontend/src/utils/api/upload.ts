import { apiClient } from './client';

export const uploadApi = {
  uploadImage: async (formData: FormData) => {
    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadMultipleImages: async (formData: FormData) => {
    const response = await apiClient.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (fileId: string) => {
    const response = await apiClient.delete(`/upload/${fileId}`);
    return response.data;
  },
};
