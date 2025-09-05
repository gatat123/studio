'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Bell,
  MessageCircle,
  AtSign,
  UserPlus,
  FileEdit,
  CheckCircle,
  Users,
  UserMinus,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  AppNotification,
  NotificationType,
  NotificationPriority,
} from '@/types/notification.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string, read: boolean) => void;
  onDelete: (id: string) => void;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  [NotificationType.COMMENT]: MessageCircle,
  [NotificationType.MENTION]: AtSign,
  [NotificationType.INVITE]: UserPlus,
  [NotificationType.PROJECT_UPDATE]: FileEdit,
  [NotificationType.SCENE_UPDATE]: FileEdit,
  [NotificationType.PROJECT_COMPLETED]: CheckCircle,
  [NotificationType.MEMBER_JOINED]: Users,
  [NotificationType.MEMBER_LEFT]: UserMinus,
  [NotificationType.TASK_ASSIGNED]: Clock,
  [NotificationType.DEADLINE_REMINDER]: AlertCircle,
};

const priorityColors: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: 'text-gray-400',
  [NotificationPriority.MEDIUM]: 'text-blue-500',
  [NotificationPriority.HIGH]: 'text-orange-500',
  [NotificationPriority.URGENT]: 'text-red-500',
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const router = useRouter();
  const Icon = notificationIcons[notification.type] || Bell;

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id, true);
    }

    // Navigate based on notification metadata
    if (notification.metadata?.projectId) {
      if (notification.metadata?.sceneId) {
        router.push(`/studios/${notification.metadata.studioId}/projects/${notification.metadata.projectId}/scenes/${notification.metadata.sceneId}`);
      } else {
        router.push(`/studios/${notification.metadata.studioId}/projects/${notification.metadata.projectId}`);
      }
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors',
        !notification.read && 'bg-blue-50 hover:bg-blue-100'
      )}
      onClick={handleClick}
    >
      <div className={cn('mt-1', priorityColors[notification.priority])}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium text-gray-900',
              !notification.read && 'font-semibold'
            )}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {notification.priority === NotificationPriority.URGENT && (
              <Badge variant="destructive" className="text-xs">
                긴급
              </Badge>
            )}
            {!notification.read && (
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
