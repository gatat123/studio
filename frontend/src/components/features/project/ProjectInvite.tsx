'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Calendar, 
  Users,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '@/utils/api';

interface InviteInfo {
  valid: boolean;
  project: {
    id: string;
    title: string;
    description: string;
    studio?: {
      name: string;
    };
  };
  role: 'viewer' | 'editor' | 'admin';
  expiresAt?: Date;
  error?: string;
}

export default function ProjectInvite() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.code as string;
  
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inviteCode) {
      validateInviteCode();
    }
  }, [inviteCode]);

  const validateInviteCode = async () => {
    try {
      const response = await api.get(`/api/projects/validate-invite/${inviteCode}`);
      setInviteInfo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '유효하지 않은 초대 코드입니다.');
      setInviteInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const response = await api.post(`/api/projects/join/${inviteCode}`);
      const project = response.data;
      
      // 프로젝트 페이지로 리다이렉트
      router.push(`/studios/${project.studioId}/projects/${project.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '프로젝트 참여에 실패했습니다.');
      setJoining(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      viewer: '열람자',
      editor: '편집자',
      admin: '관리자',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      viewer: '프로젝트를 읽고 댓글을 작성할 수 있습니다.',
      editor: '씬을 업로드하고 편집할 수 있습니다.',
      admin: '프로젝트를 완전히 관리할 수 있습니다.',
    };
    return descriptions[role as keyof typeof descriptions] || '';
  };

  const getRoleIcon = (role: string) => {
    const colors = {
      viewer: 'text-gray-500',
      editor: 'text-blue-500',
      admin: 'text-purple-500',
    };
    return colors[role as keyof typeof colors] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">초대 코드 확인 중...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteInfo?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-center">초대 코드 오류</CardTitle>
            <CardDescription className="text-center">
              {error || '유효하지 않은 초대 코드입니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/studios')} 
              className="w-full"
              variant="outline"
            >
              스튜디오로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-center">프로젝트 초대</CardTitle>
          <CardDescription className="text-center">
            다음 프로젝트에 초대되었습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Project Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">{inviteInfo.project.title}</h3>
            {inviteInfo.project.description && (
              <p className="text-sm text-gray-600">{inviteInfo.project.description}</p>
            )}
            {inviteInfo.project.studio && (
              <p className="text-sm text-gray-500">
                스튜디오: {inviteInfo.project.studio.name}
              </p>
            )}
          </div>

          {/* Role Info */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Shield className={`w-5 h-5 mt-0.5 ${getRoleIcon(inviteInfo.role)}`} />
              <div className="flex-1">
                <p className="font-medium">부여될 권한: {getRoleLabel(inviteInfo.role)}</p>
                <p className="text-sm text-gray-600">{getRoleDescription(inviteInfo.role)}</p>
              </div>
            </div>

            {inviteInfo.expiresAt && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 mt-0.5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium">만료일</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(inviteInfo.expiresAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              프로젝트에 참여하면 프로젝트의 콘텐츠에 접근할 수 있게 됩니다.
              권한에 따라 수정 및 관리 기능이 제한될 수 있습니다.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push('/studios')}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="flex-1"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  참여 중...
                </>
              ) : (
                <>
                  프로젝트 참여
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}