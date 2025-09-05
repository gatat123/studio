import axiosInstance from '@/lib/axios';
import { 
  Notification, 
  NotificationSettings 
} from '@/types/notification.types';

export interface GetNotificationsQuery {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
  page?: number;
  filter?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  hasMore?: boolean;
}

class NotificationAPI {
  async getNotifications(query?: GetNotificationsQuery): Promise<NotificationResponse> {
    const { data } = await axiosInstance.get('/notifications', { params: query });
    return data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const { data } = await axiosInstance.get('/notifications/unread-count');
    return data;
  }

  async markAsRead(notificationId: string, read = true): Promise<Notification> {
    const { data } = await axiosInstance.put(`/notifications/${notificationId}/read`, { read });
    return data;
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.post('/notifications/mark-all-read');
    return data;
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete(`/notifications/${notificationId}`);
    return data;
  }

  async deleteAllNotifications(): Promise<{ success: boolean }> {
    const { data } = await axiosInstance.delete('/notifications/all');
    return data;
  }

  async getSettings(): Promise<NotificationSettings> {
    const { data } = await axiosInstance.get('/notifications/settings');
    return data;
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data } = await axiosInstance.put('/notifications/settings', settings);
    return data;
  }
}

export default new NotificationAPI();
