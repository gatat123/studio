'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Filter, CheckCheck, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import notificationAPI from '@/lib/api/notifications';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Notification, NotificationType } from '@/types/notification.types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { socket } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, [filter, typeFilter]);

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', handleNewNotification);
      
      return () => {
        socket.off('notification:new');
      };
    }
  }, [socket]);

  const loadNotifications = async (reset = true) => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({
        page: reset ? 1 : page,
        limit: 20,
        filter: filter === 'all' ? undefined : filter === 'unread',
        type: typeFilter === 'all' ? undefined : typeFilter,
      });
      
      if (reset) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(response.hasMore);
      setPage(reset ? 2 : page + 1);
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

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleMarkAsRead = async (id: string, read: boolean) => {
    try {
      await notificationAPI.markAsRead(id, read);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read } : n))
      );
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
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return;
    
    try {
      await notificationAPI.deleteAllNotifications();
      setNotifications([]);
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

  const filteredNotifications = notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8" />
          <h1 className="text-3xl font-bold">알림</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}개 읽지 않음</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="notifications">알림 목록</TabsTrigger>
          <TabsTrigger value="settings">알림 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>알림 목록</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="unread">읽지 않음</SelectItem>
                      <SelectItem value="read">읽음</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="알림 타입" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 타입</SelectItem>
                      <SelectItem value={NotificationType.COMMENT}>댓글</SelectItem>
                      <SelectItem value={NotificationType.MENTION}>멘션</SelectItem>
                      <SelectItem value={NotificationType.INVITE}>초대</SelectItem>
                      <SelectItem value={NotificationType.PROJECT_UPDATE}>프로젝트 업데이트</SelectItem>
                      <SelectItem value={NotificationType.SCENE_UPDATE}>씬 업데이트</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDeleteAll}
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500">로딩중...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32">
                    <Bell className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">알림이 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                    
                    {hasMore && (
                      <div className="py-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => loadNotifications(false)}
                          disabled={loading}
                        >
                          더 보기
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
