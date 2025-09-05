'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Monitor, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import notificationAPI from '@/lib/api/notifications';
import { NotificationType } from '@/types/notification.types';

interface NotificationSettings {
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  browser: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
}

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.COMMENT]: '댓글',
  [NotificationType.MENTION]: '멘션',
  [NotificationType.INVITE]: '초대',
  [NotificationType.PROJECT_UPDATE]: '프로젝트 업데이트',
  [NotificationType.SCENE_UPDATE]: '씬 업데이트',
  [NotificationType.PROJECT_COMPLETED]: '프로젝트 완료',
  [NotificationType.MEMBER_JOINED]: '멤버 참가',
  [NotificationType.MEMBER_LEFT]: '멤버 탈퇴',
  [NotificationType.TASK_ASSIGNED]: '작업 할당',
  [NotificationType.DEADLINE_REMINDER]: '마감일 알림',
};

export function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      types: Object.values(NotificationType),
    },
    browser: {
      enabled: false,
      types: Object.values(NotificationType),
    },
    inApp: {
      enabled: true,
      types: Object.values(NotificationType),
    },
  });
  const [loading, setLoading] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadSettings();
    checkBrowserPermission();
  }, []);

  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await notificationAPI.getSettings();
      setSettings(response);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await notificationAPI.updateSettings(settings);
      toast({
        title: '설정 저장 완료',
        description: '알림 설정이 저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '설정 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrowserPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);
        
        if (permission === 'granted') {
          setSettings(prev => ({
            ...prev,
            browser: { ...prev.browser, enabled: true }
          }));
          toast({
            title: '브라우저 알림 활성화',
            description: '브라우저 알림이 활성화되었습니다.',
          });
        } else {
          toast({
            title: '브라우저 알림 거부',
            description: '브라우저 설정에서 권한을 변경할 수 있습니다.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: '오류',
          description: '브라우저 알림 권한 요청에 실패했습니다.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleChannel = (channel: 'email' | 'browser' | 'inApp') => {
    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: !prev[channel].enabled,
      },
    }));
  };

  const handleToggleType = (channel: 'email' | 'browser' | 'inApp', type: NotificationType) => {
    setSettings(prev => {
      const types = prev[channel].types;
      const updatedTypes = types.includes(type)
        ? types.filter(t => t !== type)
        : [...types, type];
      
      return {
        ...prev,
        [channel]: {
          ...prev[channel],
          types: updatedTypes,
        },
      };
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">
        {/* 이메일 알림 설정 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email-notifications">이메일 알림</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email.enabled}
                onCheckedChange={() => handleToggleChannel('email')}
              />
            </div>
            {settings.email.enabled && (
              <div className="space-y-2 pl-6">
                {Object.values(NotificationType).map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <Label htmlFor={`email-${type}`} className="text-sm text-gray-600">
                      {notificationTypeLabels[type]}
                    </Label>
                    <Switch
                      id={`email-${type}`}
                      checked={settings.email.types.includes(type)}
                      onCheckedChange={() => handleToggleType('email', type)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 브라우저 알림 설정 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <Label htmlFor="browser-notifications">브라우저 알림</Label>
              </div>
              <div className="flex items-center gap-2">
                {browserPermission !== 'granted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBrowserPermission}
                  >
                    권한 요청
                  </Button>
                )}
                <Switch
                  id="browser-notifications"
                  checked={settings.browser.enabled}
                  disabled={browserPermission !== 'granted'}
                  onCheckedChange={() => handleToggleChannel('browser')}
                />
              </div>
            </div>
            {settings.browser.enabled && browserPermission === 'granted' && (
              <div className="space-y-2 pl-6">
                {Object.values(NotificationType).map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <Label htmlFor={`browser-${type}`} className="text-sm text-gray-600">
                      {notificationTypeLabels[type]}
                    </Label>
                    <Switch
                      id={`browser-${type}`}
                      checked={settings.browser.types.includes(type)}
                      onCheckedChange={() => handleToggleType('browser', type)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 인앱 알림 설정 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="inapp-notifications">인앱 알림</Label>
              </div>
              <Switch
                id="inapp-notifications"
                checked={settings.inApp.enabled}
                onCheckedChange={() => handleToggleChannel('inApp')}
              />
            </div>
            {settings.inApp.enabled && (
              <div className="space-y-2 pl-6">
                {Object.values(NotificationType).map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <Label htmlFor={`inapp-${type}`} className="text-sm text-gray-600">
                      {notificationTypeLabels[type]}
                    </Label>
                    <Switch
                      id={`inapp-${type}`}
                      checked={settings.inApp.types.includes(type)}
                      onCheckedChange={() => handleToggleType('inApp', type)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  );
}
