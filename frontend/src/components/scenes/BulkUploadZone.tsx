'use client';

import React, { useState, useCallback } from 'react';
import { DropZone } from '@/components/upload/DropZone';
import { FilePreview } from '@/components/upload/FilePreview';
import { UploadProgress, UploadFile } from '@/components/upload/UploadProgress';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export type UploadType = 'draft' | 'artwork' | 'both';

interface BulkUploadZoneProps {
  projectId: string;
  onUploadComplete?: (uploadedFiles: any[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

export function BulkUploadZone({
  projectId,
  onUploadComplete,
  maxFiles = 100,
  maxSize = 10 * 1024 * 1024 // 10MB
}: BulkUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<UploadType>('both');
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = selectedFiles.length + acceptedFiles.length;
    
    if (totalFiles > maxFiles) {
      toast({
        title: '파일 개수 초과',
        description: `최대 ${maxFiles}개까지 업로드 가능합니다.`,
        variant: 'destructive'
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, [selectedFiles, maxFiles, toast]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const cancelUpload = (fileId: string) => {
    // TODO: 실제 업로드 취소 로직 구현
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, status: 'error', error: '취소됨' } : f)
    );
  };

  const retryUpload = async (fileId: string) => {
    const file = uploadingFiles.find(f => f.id === fileId);
    if (!file) return;

    setUploadingFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, status: 'uploading', progress: 0, error: undefined } : f)
    );

    // 개별 파일 재업로드
    await uploadSingleFile(file.file, fileId);
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadSingleFile = async (file: File, fileId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    formData.append('projectId', projectId);

    try {
      const response = await axios.post('/api/upload/scene', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? (progressEvent.loaded / progressEvent.total) * 100
            : 0;
          
          setUploadingFiles(prev =>
            prev.map(f => f.id === fileId ? { ...f, progress } : f)
          );
        }
      });

      setUploadingFiles(prev =>
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'success', progress: 100, url: response.data.url }
            : f
        )
      );

      return response.data;
    } catch (error: any) {
      setUploadingFiles(prev =>
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: error.message || '업로드 실패' }
            : f
        )
      );
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: '파일을 선택해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    // 업로드 파일 목록 초기화
    const filesToUpload: UploadFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setUploadingFiles(filesToUpload);

    // 병렬 업로드 (최대 3개씩)
    const uploadPromises = [];
    const batchSize = 3;
    
    for (let i = 0; i < filesToUpload.length; i += batchSize) {
      const batch = filesToUpload.slice(i, i + batchSize);
      const batchPromises = batch.map(async (uploadFile) => {
        setUploadingFiles(prev =>
          prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
        );
        return uploadSingleFile(uploadFile.file, uploadFile.id);
      });
      
      await Promise.allSettled(batchPromises);
    }

    setIsUploading(false);

    // 성공한 파일들 처리
    const successfulFiles = uploadingFiles.filter(f => f.status === 'success');
    if (successfulFiles.length > 0) {
      toast({
        title: '업로드 완료',
        description: `${successfulFiles.length}개 파일이 업로드되었습니다.`
      });
      
      if (onUploadComplete) {
        onUploadComplete(successfulFiles);
      }
      
      // 선택된 파일 목록 초기화
      setSelectedFiles([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 업로드 타입 선택 */}
      <div className="space-y-2">
        <Label>업로드 타입</Label>
        <RadioGroup value={uploadType} onValueChange={(value) => setUploadType(value as UploadType)}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="draft" id="draft" />
              <Label htmlFor="draft">초안만</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="artwork" id="artwork" />
              <Label htmlFor="artwork">아트워크만</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">초안 + 아트워크</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* 드롭존 */}
      {!isUploading && (
        <DropZone
          onDrop={handleDrop}
          maxFiles={maxFiles - selectedFiles.length}
          maxSize={maxSize}
          disabled={isUploading}
        />
      )}

      {/* 선택된 파일 미리보기 */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              선택된 파일 ({selectedFiles.length}개)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFiles([])}
            >
              전체 삭제
            </Button>
          </div>
          <FilePreview 
            files={selectedFiles} 
            onRemove={removeFile}
          />
        </div>
      )}

      {/* 업로드 진행 상태 */}
      {uploadingFiles.length > 0 && (
        <UploadProgress
          files={uploadingFiles}
          onCancel={cancelUpload}
          onRetry={retryUpload}
          onRemove={removeUploadedFile}
        />
      )}

      {/* 업로드 버튼 */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="flex justify-end">
          <Button 
            onClick={handleUpload}
            disabled={isUploading}
            size="lg"
          >
            <Upload className="mr-2 h-4 w-4" />
            {selectedFiles.length}개 파일 업로드
          </Button>
        </div>
      )}

      {/* 안내 메시지 */}
      {uploadType === 'both' && selectedFiles.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            파일명으로 자동 매칭됩니다. 초안과 아트워크 파일명이 같은 경우 자동으로 연결됩니다.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}