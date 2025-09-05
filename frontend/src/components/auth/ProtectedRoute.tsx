'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩이 완료되고 인증되지 않았을 때
    if (!isLoading && !isAuthenticated) {
      // 공개 라우트가 아니면 로그인 페이지로 리다이렉트
      if (!PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 인증되지 않았고 공개 라우트가 아닌 경우
  if (!isAuthenticated && !PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
}
