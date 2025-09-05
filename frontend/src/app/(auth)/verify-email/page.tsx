'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { authApi } from '@/utils/api/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('resend');
      setMessage('인증 토큰이 없습니다. 이메일을 다시 전송해주세요.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await authApi.verifyEmail(verificationToken);
      
      if (response.success) {
        setStatus('success');
        setMessage('이메일 인증이 완료되었습니다!');
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.message || '이메일 인증에 실패했습니다.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('이메일 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('이메일 주소를 입력해주세요.');
      return;
    }

    setIsResending(true);
    try {
      const response = await authApi.resendVerificationEmail(email);
      
      if (response.success) {
        setMessage('인증 이메일이 전송되었습니다. 메일함을 확인해주세요.');
      } else {
        setMessage(response.message || '이메일 전송에 실패했습니다.');
      }
    } catch (error) {
      setMessage('이메일 전송 중 오류가 발생했습니다.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            이메일 인증
          </CardTitle>
          <CardDescription className="text-center">
            회원가입을 완료하기 위해 이메일을 인증해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'verifying' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                이메일 인증 중입니다...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground text-center">
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => setStatus('resend')}
                variant="outline"
                className="mt-4"
              >
                인증 이메일 다시 받기
              </Button>
            </div>
          )}

          {status === 'resend' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-primary" />
              </div>
              
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  이메일 주소
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  '인증 이메일 다시 보내기'
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  className="text-sm"
                >
                  로그인 페이지로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
