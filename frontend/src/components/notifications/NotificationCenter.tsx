'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Settings, Trash2, CheckCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { NotificationSettings } from './NotificationSettings';
import notificationAPI from '@/lib/api/notifications';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Notification } from '@/types/notification.types';
import { useToast } from '@/hooks/use-toast';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { socket } = useWebSocket();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', handleNewNotification);
      
      return () => {
        socket.off('notification:new');
      };
    }
  }, [socket]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({ limit: 20 });
      setNotifications(response.notifications);
    } catch (error) {
      toast({
        title: '오류',
        description: '알림을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // 브라우저 알림 표시
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
      });
    }
  };

  const handleMarkAsRead = async (id: string, read: boolean) => {
    try {
      await notificationAPI.markAsRead(id, read);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read } : n))
      );
      if (read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '알림 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({
        title: '완료',
        description: '모든 알림을 읽음으로 표시했습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '알림 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({
        title: '완료',
        description: '알림이 삭제되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '알림 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationAPI.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast({
        title: '완료',
        description: '모든 알림이 삭제되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '알림 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="notifications" className="flex-1">
              알림
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="m-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-sm font-semibold">알림</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-gray-500">로딩중...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <Bell className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
