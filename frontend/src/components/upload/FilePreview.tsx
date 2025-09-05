'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { File, X, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  files: File[];
  onRemove?: (index: number) => void;
  className?: string;
}

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const openPreview = (file: File, index: number) => {
    setSelectedFile(file);
    setSelectedIndex(index);
  };

  const closePreview = () => {
    setSelectedFile(null);
    setSelectedIndex(-1);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (selectedIndex === -1) return;
    
    const newIndex = direction === 'next' 
      ? (selectedIndex + 1) % files.length
      : (selectedIndex - 1 + files.length) % files.length;
    
    setSelectedFile(files[newIndex]);
    setSelectedIndex(newIndex);
  };

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <>
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4', className)}>
        {files.map((file, index) => {
          const url = URL.createObjectURL(file);
          const isImg = isImage(file);

          return (
            <div
              key={index}
              className="group relative aspect-square rounded-lg border bg-card overflow-hidden"
            >
              {isImg ? (
                <Image
                  src={url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <File className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* 파일 정보 오버레이 */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="truncate text-xs text-white">{file.name}</p>
                <p className="text-xs text-white/80">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* 액션 버튼 오버레이 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-full items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openPreview(file, index)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onRemove && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 프리뷰 모달 */}
      <Dialog open={!!selectedFile} onOpenChange={() => closePreview()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            {selectedFile && isImage(selectedFile) ? (
              <div className="relative aspect-video">
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <File className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">미리보기를 지원하지 않는 파일입니다</p>
                </div>
              </div>
            )}

            {/* 네비게이션 버튼 */}
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={() => navigatePreview('prev')}
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => navigatePreview('next')}
                >
                  ›
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}</span>
            <span>{selectedIndex + 1} / {files.length}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}