'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AppNotification } from '@/types/notification.types';
import { useToast } from '@/hooks/use-toast';

interface BrowserNotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  showBrowserNotification: (notification: AppNotification) => void;
}

const BrowserNotificationContext = createContext<BrowserNotificationContextType | undefined>(undefined);

export function BrowserNotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { socket } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    // Check initial permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Request permission if not already granted or denied
      if (Notification.permission === 'default') {
        requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', handleNewNotification);
      
      return () => {
        socket.off('notification:new');
      };
    }
  }, [socket, permission]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: '알림 권한 승인',
          description: '브라우저 알림을 받을 수 있습니다.',
        });
      } else if (result === 'denied') {
        toast({
          title: '알림 권한 거부',
          description: '브라우저 설정에서 알림 권한을 변경할 수 있습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const showBrowserNotification = (notification: AppNotification) => {
    if (permission !== 'granted') return;

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low',
      });

      browserNotification.onclick = () => {
        window.focus();
        // Navigate to relevant page
        if (notification.metadata?.projectId) {
          const url = notification.metadata?.sceneId
            ? `/studios/${notification.metadata.studioId}/projects/${notification.metadata.projectId}/scenes/${notification.metadata.sceneId}`
            : `/studios/${notification.metadata.studioId}/projects/${notification.metadata.projectId}`;
          window.location.href = url;
        }
        browserNotification.close();
      };
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  };

  const handleNewNotification = (notification: AppNotification) => {
    // Check if browser notifications are enabled in user settings
    // and if the tab is not in focus
    if (!document.hasFocus()) {
      showBrowserNotification(notification);
    }
  };

  return (
    <BrowserNotificationContext.Provider value={{ permission, requestPermission, showBrowserNotification }}>
      {children}
    </BrowserNotificationContext.Provider>
  );
}

export const useBrowserNotification = () => {
  const context = useContext(BrowserNotificationContext);
  if (context === undefined) {
    throw new Error('useBrowserNotification must be used within a BrowserNotificationProvider');
  }
  return context;
};
