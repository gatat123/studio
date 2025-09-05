'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface UploadProgressProps {
  files: UploadFile[];
  onCancel?: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
}

export function UploadProgress({
  files,
  onCancel,
  onRetry,
  onRemove
}: UploadProgressProps) {
  if (files.length === 0) return null;

  const totalProgress = files.reduce((acc, file) => acc + file.progress, 0) / files.length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* 전체 진행 상태 */}
      <div className="rounded-lg border bg-card p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">전체 업로드 진행률</span>
            <span className="text-muted-foreground">
              {Math.round(totalProgress)}%
            </span>
          </div>
          <Progress value={totalProgress} className="h-2" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>업로드 중: {uploadingCount}</span>
            <span className="text-green-600">완료: {successCount}</span>
            {errorCount > 0 && (
              <span className="text-destructive">실패: {errorCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* 개별 파일 진행 상태 */}
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              'rounded-lg border p-3 transition-all',
              file.status === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950',
              file.status === 'error' && 'border-destructive bg-destructive/10'
            )}
          >
            <div className="space-y-2">
              {/* 파일 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {file.status === 'pending' && (
                    <div className="h-4 w-4 text-muted-foreground" />
                  )}
                  {file.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1">
                  {file.status === 'uploading' && onCancel && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onCancel(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {file.status === 'error' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(file.id)}
                    >
                      재시도
                    </Button>
                  )}
                  {(file.status === 'success' || file.status === 'error') && onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemove(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* 진행률 바 */}
              {file.status === 'uploading' && (
                <div className="space-y-1">
                  <Progress value={file.progress} className="h-1" />
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(file.progress)}%
                  </p>
                </div>
              )}

              {/* 에러 메시지 */}
              {file.status === 'error' && file.error && (
                <p className="text-xs text-destructive">{file.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}