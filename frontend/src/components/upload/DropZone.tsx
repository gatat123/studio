'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export function DropZone({
  onDrop,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf']
  },
  maxFiles = 100,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: DropZoneProps) {
  const [rejectedFiles, setRejectedFiles] = useState<Array<{ file: File; error: string }>>([]);

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      // 거부된 파일 처리
      const rejected = fileRejections.map((rejection) => ({
        file: rejection.file,
        error: rejection.errors[0]?.message || '업로드 실패'
      }));
      setRejectedFiles(rejected);

      // 수락된 파일 처리
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }

      // 3초 후 에러 메시지 제거
      if (rejected.length > 0) {
        setTimeout(() => setRejectedFiles([]), 3000);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple: true
  });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed p-8 transition-all',
          'hover:border-primary hover:bg-primary/5',
          isDragActive && !isDragReject && 'border-primary bg-primary/10',
          isDragReject && 'border-destructive bg-destructive/10',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <Upload className={cn(
            'h-12 w-12',
            isDragActive && !isDragReject && 'text-primary',
            isDragReject && 'text-destructive',
            !isDragActive && 'text-muted-foreground'
          )} />
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive && !isDragReject && '파일을 놓으세요'}
              {isDragReject && '지원하지 않는 파일 형식입니다'}
              {!isDragActive && '파일을 드래그하거나 클릭하여 선택'}
            </p>
            <p className="text-xs text-muted-foreground">
              최대 {maxFiles}개 파일, 개당 {Math.round(maxSize / 1024 / 1024)}MB까지
            </p>
            <p className="text-xs text-muted-foreground">
              지원 형식: JPG, PNG, GIF, WEBP, PDF
            </p>
          </div>
        </div>

        {/* 거부된 파일 에러 메시지 */}
        {rejectedFiles.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-destructive/10 p-2">
            {rejectedFiles.map((rejection, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{rejection.file.name}: {rejection.error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}