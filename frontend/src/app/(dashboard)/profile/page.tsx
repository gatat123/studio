'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock, Settings, Camera } from 'lucide-react';
import { authApi } from '@/utils/api/auth';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  
  // Profile tab state
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Password tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;

    setIsUpdatingProfile(true);
    setProfileStatus('idle');
    setProfileMessage('');

    try {
      const response = await authApi.updateProfile(token, {
        nickname,
        avatar,
      });

      if (response.success) {
        setProfileStatus('success');
        setProfileMessage('프로필이 성공적으로 업데이트되었습니다.');
        
        // 사용자 정보 업데이트
        if (response.user) {
          updateUser(response.user);
        }
      } else {
        setProfileStatus('error');
        setProfileMessage(response.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setProfileStatus('error');
      setProfileMessage('서버 오류가 발생했습니다.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const validatePassword = () => {
    const errors: string[] = [];

    if (newPassword.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    if (!/(?=.*[a-z])/.test(newPassword)) {
      errors.push('비밀번호는 최소 하나의 소문자를 포함해야 합니다.');
    }
    if (!/(?=.*[A-Z])/.test(newPassword)) {
      errors.push('비밀번호는 최소 하나의 대문자를 포함해야 합니다.');
    }
    if (!/(?=.*[0-9])/.test(newPassword)) {
      errors.push('비밀번호는 최소 하나의 숫자를 포함해야 합니다.');
    }
    if (!/(?=.*[!@#$%^&*])/.test(newPassword)) {
      errors.push('비밀번호는 최소 하나의 특수문자(!@#$%^&*)를 포함해야 합니다.');
    }
    if (newPassword !== confirmPassword) {
      errors.push('비밀번호가 일치하지 않습니다.');
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;

    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus('idle');
    setPasswordMessage('');

    try {
      const response = await authApi.changePassword(token, currentPassword, newPassword);

      if (response.success) {
        setPasswordStatus('success');
        setPasswordMessage('비밀번호가 성공적으로 변경되었습니다.');
        
        // 폼 초기화
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus('error');
        setPasswordMessage(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      setPasswordStatus('error');
      setPasswordMessage('서버 오류가 발생했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: 실제 파일 업로드 구현
      // 현재는 임시로 로컬 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="text-muted-foreground mt-2">
          계정 정보와 설정을 관리합니다
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            프로필
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" />
            비밀번호
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                다른 사용자에게 보여질 프로필 정보를 수정합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {profileStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      {profileMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {profileStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertDescription>{profileMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatar} alt={nickname} />
                      <AvatarFallback>{getInitials(nickname || 'User')}</AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{nickname}</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="사용자 닉네임"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      이메일은 변경할 수 없습니다
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '변경사항 저장'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                계정 보안을 위해 정기적으로 비밀번호를 변경하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      {passwordMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {passwordStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordMessage}</AlertDescription>
                  </Alert>
                )}

                {passwordErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">현재 비밀번호</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                알림을 받을 항목을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">댓글 알림</p>
                    <p className="text-sm text-muted-foreground">
                      내 씬에 새 댓글이 달렸을 때 알림
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">멘션 알림</p>
                    <p className="text-sm text-muted-foreground">
                      누군가 나를 멘션했을 때 알림
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">프로젝트 업데이트</p>
                    <p className="text-sm text-muted-foreground">
                      프로젝트 상태가 변경되었을 때 알림
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">이메일 알림</p>
                    <p className="text-sm text-muted-foreground">
                      중요한 알림을 이메일로도 받기
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">위험 구역</CardTitle>
              <CardDescription>
                이 작업들은 되돌릴 수 없습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">
                계정 삭제
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
