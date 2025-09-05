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