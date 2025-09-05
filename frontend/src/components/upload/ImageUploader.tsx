'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadApi } from '@/utils/api/upload';
import Image from 'next/image';

interface UploadedFile {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  size: number;
}

interface ImageUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUploader({ 
  onUploadComplete, 
  multiple = false,
  maxFiles = 10 
}: ImageUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'pending' | 'uploading' | 'success' | 'error' }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // 파일 업로드 상태 초기화
    const initialProgress: { [key: string]: number } = {};
    const initialStatus: { [key: string]: 'pending' | 'uploading' | 'success' | 'error' } = {};
    
    acceptedFiles.forEach((file) => {
      initialProgress[file.name] = 0;
      initialStatus[file.name] = 'pending';
    });
    
    setUploadProgress(initialProgress);
    setUploadStatus(initialStatus);
    setErrors({});

    // 파일 업로드 처리
    const uploadedResults: UploadedFile[] = [];
    
    for (const file of acceptedFiles) {
      try {
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'uploading' }));
        
        const formData = new FormData();
        formData.append('file', file);
        
        // 진행률 시뮬레이션 (실제로는 axios onUploadProgress 사용)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[file.name] || 0;
            if (current < 90) {
              return { ...prev, [file.name]: current + 10 };
            }
            return prev;
          });
        }, 200);
        
        const result = await uploadApi.uploadImage(formData);
        
        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }));
        
        uploadedResults.push(result);
      } catch (error: any) {
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }));
        setErrors((prev) => ({ 
          ...prev, 
          [file.name]: error.response?.data?.message || '업로드 실패' 
        }));
      }
    }
    
    setUploadedFiles((prev) => [...prev, ...uploadedResults]);
    
    if (onUploadComplete) {
      onUploadComplete(uploadedResults);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    multiple,
    maxFiles,
  });

  const removeFile = async (fileId: string) => {
    try {
      await uploadApi.deleteFile(fileId);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('파일 삭제 실패:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? (
            '파일을 놓아주세요'
          ) : (
            <>
              클릭하거나 파일을 드래그하여 업로드
              <br />
              <span className="text-xs text-gray-500">
                JPG, PNG, WEBP, GIF (최대 10MB)
              </span>
            </>
          )}
        </p>
      </div>

      {/* 업로드 진행 상태 */}
      {Object.entries(uploadStatus).map(([filename, status]) => (
        <div key={filename} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate flex-1">{filename}</span>
            {status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
          
          {status === 'uploading' && (
            <Progress value={uploadProgress[filename] || 0} className="h-2" />
          )}
          
          {status === 'error' && errors[filename] && (
            <p className="text-xs text-red-500 mt-1">{errors[filename]}</p>
          )}
        </div>
      ))}

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={file.thumbnailUrl}
                  alt={file.originalName}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(file.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="text-xs text-gray-600 mt-1 truncate">{file.originalName}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
