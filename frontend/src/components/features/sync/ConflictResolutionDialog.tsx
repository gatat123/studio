'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  Globe, 
  Laptop,
  CheckCircle2,
  Merge
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
interface ConflictData {
  field: string;
  local: any;
  remote: any;
  localUpdatedAt?: Date;
  remoteUpdatedAt?: Date;
}

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictData[];
  onResolve: (resolutions: Record<string, 'local' | 'remote' | 'merge'>, mergedData?: any) => void;
  entityType: 'project' | 'scene' | 'comment';
  entityName?: string;
}
export function ConflictResolutionDialog({
  isOpen,
  onClose,
  conflicts,
  onResolve,
  entityType,
  entityName
}: ConflictResolutionDialogProps) {
  const [resolutions, setResolutions] = useState<Record<string, 'local' | 'remote' | 'merge'>>({});
  const [mergedData, setMergedData] = useState<Record<string, any>>({});
  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoResolveStrategy, setAutoResolveStrategy] = useState<'local' | 'remote' | 'newest' | 'manual'>('manual');

  useEffect(() => {
    const initialResolutions: Record<string, 'local' | 'remote' | 'merge'> = {};
    const initialMerged: Record<string, any> = {};
    
    conflicts.forEach(conflict => {
      if (autoResolveStrategy === 'local') {
        initialResolutions[conflict.field] = 'local';
      } else if (autoResolveStrategy === 'remote') {
        initialResolutions[conflict.field] = 'remote';
      } else if (autoResolveStrategy === 'newest') {
        if (conflict.localUpdatedAt && conflict.remoteUpdatedAt) {
          initialResolutions[conflict.field] = 
            new Date(conflict.localUpdatedAt) > new Date(conflict.remoteUpdatedAt) ? 'local' : 'remote';
        } else {
          initialResolutions[conflict.field] = 'remote';
        }
      } else {
        initialResolutions[conflict.field] = 'local';
      }      
      if (typeof conflict.local === 'string' && typeof conflict.remote === 'string') {
        initialMerged[conflict.field] = conflict.local;
      } else if (Array.isArray(conflict.local) && Array.isArray(conflict.remote)) {
        initialMerged[conflict.field] = [...new Set([...conflict.local, ...conflict.remote])];
      } else {
        initialMerged[conflict.field] = conflict.local;
      }
    });
    
    setResolutions(initialResolutions);
    setMergedData(initialMerged);
  }, [conflicts, autoResolveStrategy]);

  const handleResolutionChange = (field: string, value: 'local' | 'remote' | 'merge') => {
    setResolutions(prev => ({ ...prev, [field]: value }));
  };

  const handleMergedDataChange = (field: string, value: any) => {
    setMergedData(prev => ({ ...prev, [field]: value }));
  };

  const handleResolve = () => {
    onResolve(resolutions, mergedData);
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      title: '제목',
      description: '설명',
      content: '내용',
      status: '상태',
      order: '순서',
      tags: '태그',
      metadata: '메타데이터',
    };
    return labels[field] || field;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>충돌 해결</DialogTitle>
          <DialogDescription>
            {conflicts.length}개의 충돌이 발견되었습니다. 각 항목에 대해 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {conflicts.map((conflict) => (
            <Card key={conflict.field} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {getFieldLabel(conflict.field)}
                  </h3>
                  <Select
                    value={resolutions[conflict.field]}
                    onValueChange={(value: 'local' | 'remote' | 'merge') =>
                      handleResolutionChange(conflict.field, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">로컬</SelectItem>
                      <SelectItem value="remote">서버</SelectItem>
                      <SelectItem value="merge">병합</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>로컬 값</Label>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      {JSON.stringify(conflict.local, null, 2)}
                    </div>
                  </div>
                  <div>
                    <Label>서버 값</Label>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      {JSON.stringify(conflict.remote, null, 2)}
                    </div>
                  </div>
                </div>

                {resolutions[conflict.field] === 'merge' && (
                  <div>
                    <Label>병합된 값</Label>
                    <Textarea
                      value={JSON.stringify(mergedData[conflict.field], null, 2)}
                      onChange={(e) => {
                        try {
                          const value = JSON.parse(e.target.value);
                          handleMergedDataChange(conflict.field, value);
                        } catch (error) {
                          // JSON 파싱 에러 무시
                        }
                      }}
                      className="font-mono text-sm"
                      rows={5}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleResolve}>충돌 해결</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};