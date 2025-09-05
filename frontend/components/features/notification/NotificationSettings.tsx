'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import notificationAPI from '@/lib/api/notifications';
import { NotificationSettings as NotificationSettingsType } from '@/types/notification.types';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Upload, UserPlus, CheckCircle } from 'lucide-react';

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getSettings();
      setSettings(data);
    } catch (error) {
      toast({
        title: '오류',
        description: '알림 설정을 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await notificationAPI.updateSettings(settings);
      toast({
        title: '성공',
        description: '알림 설정이 저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '설정 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (category: keyof NotificationSettingsType, field: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: !settings[category][field],
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>
          알림을 받을 활동을 선택하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            댓글 알림
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-comment">새 댓글</Label>
              <Switch
                id="new-comment"
                checked={settings.comments.new}
                onCheckedChange={() => handleToggle('comments', 'new')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reply-comment">댓글 답글</Label>
              <Switch
                id="reply-comment"
                checked={settings.comments.reply}
                onCheckedChange={() => handleToggle('comments', 'reply')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mention-comment">멘션</Label>
              <Switch
                id="mention-comment"
                checked={settings.comments.mention}
                onCheckedChange={() => handleToggle('comments', 'mention')}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            씬 알림
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="upload-scene">씬 업로드</Label>
              <Switch
                id="upload-scene"
                checked={settings.scenes.upload}
                onCheckedChange={() => handleToggle('scenes', 'upload')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="update-scene">씬 수정</Label>
              <Switch
                id="update-scene"
                checked={settings.scenes.update}
                onCheckedChange={() => handleToggle('scenes', 'update')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="approve-scene">씬 승인</Label>
              <Switch
                id="approve-scene"
                checked={settings.scenes.approve}
                onCheckedChange={() => handleToggle('scenes', 'approve')}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            협업 알림
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="invite">초대</Label>
              <Switch
                id="invite"
                checked={settings.collaboration.invite}
                onCheckedChange={() => handleToggle('collaboration', 'invite')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="join">참가</Label>
              <Switch
                id="join"
                checked={settings.collaboration.join}
                onCheckedChange={() => handleToggle('collaboration', 'join')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leave">나가기</Label>
              <Switch
                id="leave"
                checked={settings.collaboration.leave}
                onCheckedChange={() => handleToggle('collaboration', 'leave')}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            프로젝트 알림
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="status-change">상태 변경</Label>
              <Switch
                id="status-change"
                checked={settings.projects.statusChange}
                onCheckedChange={() => handleToggle('projects', 'statusChange')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline">마감일 임박</Label>
              <Switch
                id="deadline"
                checked={settings.projects.deadline}
                onCheckedChange={() => handleToggle('projects', 'deadline')}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            이메일 알림
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">이메일 알림 받기</Label>
              <Switch
                id="email-enabled"
                checked={settings.email.enabled}
                onCheckedChange={() => handleToggle('email', 'enabled')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-digest">일일 요약 받기</Label>
              <Switch
                id="email-digest"
                checked={settings.email.digest}
                onCheckedChange={() => handleToggle('email', 'digest')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}