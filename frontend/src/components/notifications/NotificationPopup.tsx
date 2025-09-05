'use client';

import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AppNotification, NotificationPriority } from '@/types/notification.types';
import { useRouter } from 'next/navigation';

interface NotificationPopup extends AppNotification {
  isVisible: boolean;
}

const priorityIcons = {
  [NotificationPriority.LOW]: Info,
  [NotificationPriority.MEDIUM]: Bell,
  [NotificationPriority.HIGH]: AlertCircle,
  [NotificationPriority.URGENT]: AlertCircle,
};

const priorityColors = {
  [NotificationPriority.LOW]: 'bg-blue-500',
  [NotificationPriority.MEDIUM]: 'bg-yellow-500',
  [NotificationPriority.HIGH]: 'bg-orange-500',
  [NotificationPriority.URGENT]: 'bg-red-500',
};

export function NotificationPopup() {
  const [notifications, setNotifications] = useState<NotificationPopup[]>([]);
  const { socket } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', handleNewNotification);
      
      return () => {
        socket.off('notification:new');
      };
    }
  }, [socket]);

  const handleNewNotification = (notification: AppNotification) => {
    // 인앱 알림이 활성화된 경우에만 팝업 표시
    const popupNotification: NotificationPopup = {
      ...notification,
      isVisible: true,
    };
    
    setNotifications(prev => [...prev, popupNotification]);

    // 5초 후 자동으로 팝업 제거
    setTimeout(() => {
      handleDismiss(notification.id);
    }, 5000);
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isVisible: false } : n))
    );
    
    // 애니메이션 완료 후 목록에서 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  const handleClick = (notification: NotificationPopup) => {
    handleDismiss(notification.id);
    
    // Navigate to relevant page
    if (notification.metadata?.projectId) {
      if (notification.metadata?.sceneId) {
        router.push(`/studios/${notification.metadata.studioId}/projects/${notification.metadata.projectId}/scenes/${notification.metadata.sceneId}`);
      } else {
        router.push(`/studios/${notification.metadata.studioId}/projects/${notification.metadata.projectId}`);
      }
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.filter(n => n.isVisible).map((notification) => {
          const Icon = priorityIcons[notification.priority];
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="pointer-events-auto"
            >
              <div
                className={cn(
                  'bg-white rounded-lg shadow-lg border p-4 w-80 cursor-pointer',
                  'hover:shadow-xl transition-shadow'
                )}
                onClick={() => handleClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-full text-white', priorityColors[notification.priority])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(notification.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {notification.priority === NotificationPriority.URGENT && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs font-semibold text-red-600">긴급 알림</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
