// 동적 로딩을 위한 유틸리티 함수
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// 로딩 컴포넌트
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// 페이지 로딩 컴포넌트
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

// 에러 바운더리 컴포넌트
export const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">문제가 발생했습니다</h2>
      <p className="text-gray-600 mb-4">{error?.message || '페이지를 불러올 수 없습니다.'}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        페이지 새로고침
      </button>
    </div>
  </div>
);

// 동적 import 래퍼 함수
export function lazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || LoadingSpinner,
    ssr: options?.ssr ?? true,
  });
}

// 무거운 컴포넌트를 위한 동적 import
export const DynamicImageViewer = lazyImport(
  () => import('@/components/features/scene/ImageViewer'),
  { loading: PageLoader, ssr: false }
);

export const DynamicPDFViewer = lazyImport(
  () => import('@/components/features/scene/PDFViewer'),
  { loading: PageLoader, ssr: false }
);

export const DynamicSceneUploader = lazyImport(
  () => import('@/components/features/scene/SceneUploader'),
  { loading: LoadingSpinner, ssr: false }
);

export const DynamicBulkUploadZone = lazyImport(
  () => import('@/components/features/scene/BulkUploadZone'),
  { loading: LoadingSpinner, ssr: false }
);

export const DynamicCommentThread = lazyImport(
  () => import('@/components/features/comment/CommentThread'),
  { loading: LoadingSpinner }
);

export const DynamicVersionHistory = lazyImport(
  () => import('@/components/features/scene/SceneVersionHistory'),
  { loading: LoadingSpinner }
);
