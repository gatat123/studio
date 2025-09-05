'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Archive, Trash2, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: 'soft' | 'immediate' | 'archive', createBackup: boolean) => Promise<void>;
  projectName: string;
}

export function ProjectDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}: ProjectDeleteModalProps) {
  const [deleteType, setDeleteType] = useState<'soft' | 'immediate' | 'archive'>('soft');
  const [confirmText, setConfirmText] = useState('');
  const [createBackup, setCreateBackup] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== projectName) {
      alert('프로젝트 이름이 일치하지 않습니다.');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm(deleteType, createBackup);
      onClose();
      setConfirmText('');
      setDeleteType('soft');
      setCreateBackup(true);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            프로젝트 삭제
          </DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없을 수 있습니다. 신중하게 진행해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              "{projectName}" 프로젝트와 모든 관련 데이터가 삭제됩니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>삭제 방식</Label>
            <RadioGroup value={deleteType} onValueChange={(value: any) => setDeleteType(value)}>
              <div className="flex items-start space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="soft" id="soft" className="mt-1" />
                <label htmlFor="soft" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">소프트 삭제 (권장)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    30일 동안 보관 후 완전 삭제됩니다. 복구 가능합니다.
                  </p>
                </label>
              </div>

              <div className="flex items-start space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="archive" id="archive" className="mt-1" />
                <label htmlFor="archive" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">보관</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    프로젝트를 비활성화하고 보관합니다. 언제든지 복구 가능합니다.
                  </p>
                </label>
              </div>

              <div className="flex items-start space-x-2 p-3 border border-red-200 rounded-lg bg-red-50">
                <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                <label htmlFor="immediate" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                    <span className="font-medium text-red-700">즉시 삭제</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    즉시 영구 삭제됩니다. 복구 불가능합니다.
                  </p>
                </label>
              </div>
            </RadioGroup>
          </div>

          {deleteType === 'immediate' && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="backup"
                checked={createBackup}
                onCheckedChange={(checked) => setCreateBackup(checked as boolean)}
              />
              <label htmlFor="backup" className="text-sm cursor-pointer">
                삭제 전 백업 생성 (권장)
              </label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              확인을 위해 프로젝트 이름을 입력하세요: <strong>{projectName}</strong>
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={projectName}
              className={confirmText && confirmText !== projectName ? 'border-red-500' : ''}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== projectName || isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteType === 'soft' && '소프트 삭제'}
                {deleteType === 'immediate' && '즉시 삭제'}
                {deleteType === 'archive' && '보관'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}