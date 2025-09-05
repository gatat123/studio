// 동기화 상태 표시 컴포넌트
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Cloud, 
  CloudOff, 
  CloudUpload, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Info,
  WifiOff,
  Wifi
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  errors: Error[];
  onSync?: () => void;
  className?: string;
}

export function SyncStatusIndicator({
  isOnline,
  isSyncing,
  pendingChanges,
  lastSyncTime,
  errors,
  onSync,
  className
}: SyncStatusIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    if (!isOnline) return <CloudOff className="h-4 w-4" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (errors.length > 0) return <AlertCircle className="h-4 w-4" />;
    if (pendingChanges > 0) return <CloudUpload className="h-4 w-4" />;
    return <Cloud className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (errors.length > 0) return 'destructive';
    if (pendingChanges > 0) return 'default';
    return 'secondary';
  };

  const getStatusText = () => {
    if (!isOnline) return '오프라인';
    if (isSyncing) return '동기화 중...';
    if (errors.length > 0) return '동기화 오류';
    if (pendingChanges > 0) return `${pendingChanges}개 대기중`;
    return '동기화됨';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-9 px-3", className)}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusColor()} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">동기화 상태</h4>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? (
                <><Wifi className="h-3 w-3 mr-1" /> 온라인</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" /> 오프라인</>
              )}
            </Badge>
          </div>

          {/* 동기화 진행 상태 */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>동기화 진행중...</span>
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <Progress value={66} className="h-1" />
            </div>
          )}

          {/* 대기 중인 변경사항 */}
          {pendingChanges > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CloudUpload className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">대기 중인 변경사항</p>
                  <p className="text-muted-foreground">{pendingChanges}개 항목</p>
                </div>
              </div>
              {isOnline && onSync && (
                <Button size="sm" variant="outline" onClick={onSync}>
                  동기화
                </Button>
              )}
            </div>
          )}

          {/* 마지막 동기화 시간 */}
          {lastSyncTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>
                마지막 동기화: {format(lastSyncTime, 'pp', { locale: ko })}
              </span>
            </div>
          )}

          {/* 오류 목록 */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>동기화 오류 ({errors.length})</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-xs text-muted-foreground p-1 bg-destructive/10 rounded">
                    {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 오프라인 모드 안내 */}
          {!isOnline && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  <p className="font-medium mb-1">오프라인 모드로 작동 중</p>
                  <p>모든 변경사항은 로컬에 저장되며, 인터넷 연결이 복구되면 자동으로 동기화됩니다.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
