'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/utils/api/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('비밀번호 재설정 토큰이 없습니다. 이메일의 링크를 다시 확인해주세요.');
    }
  }, [token]);

  const validatePassword = () => {
    const validationErrors: string[] = [];

    if (password.length < 8) {
      validationErrors.push('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      validationErrors.push('비밀번호는 최소 하나의 소문자를 포함해야 합니다.');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      validationErrors.push('비밀번호는 최소 하나의 대문자를 포함해야 합니다.');
    }
    if (!/(?=.*[0-9])/.test(password)) {
      validationErrors.push('비밀번호는 최소 하나의 숫자를 포함해야 합니다.');
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      validationErrors.push('비밀번호는 최소 하나의 특수문자(!@#$%^&*)를 포함해야 합니다.');
    }
    if (password !== confirmPassword) {
      validationErrors.push('비밀번호가 일치하지 않습니다.');
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await authApi.resetPassword(token, password);

      if (response.success) {
        setStatus('success');
        setMessage('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container max-w-lg mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/forgot-password')}
              className="w-full mt-4"
              variant="outline"
            >
              비밀번호 재설정 요청하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            새 비밀번호 설정
          </CardTitle>
          <CardDescription className="text-center">
            계정의 새로운 비밀번호를 입력해주세요
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || status === 'success'}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || status === 'success'}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>비밀번호는 다음 조건을 만족해야 합니다:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>최소 8자 이상</li>
                <li>대문자 포함</li>
                <li>소문자 포함</li>
                <li>숫자 포함</li>
                <li>특수문자(!@#$%^&*) 포함</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || status === 'success'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                '비밀번호 변경'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
