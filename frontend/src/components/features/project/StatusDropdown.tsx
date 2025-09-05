'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Loader2 } from 'lucide-react';
import { updateProjectStatus } from '@/lib/api/projects';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StatusDropdownProps {
  projectId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: 'planning', label: '기획', color: 'bg-gray-500' },
  { value: 'in_progress', label: '진행중', color: 'bg-blue-500' },
  { value: 'review', label: '검토중', color: 'bg-yellow-500' },
  { value: 'completed', label: '완료', color: 'bg-green-500' },
  { value: 'archived', label: '보관', color: 'bg-purple-500' },
];

export default function StatusDropdown({ projectId, currentStatus }: StatusDropdownProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  const current = statusOptions.find(s => s.value === status)!;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setIsLoading(true);
    try {
      await updateProjectStatus(projectId, newStatus);
      setStatus(newStatus);
      
      toast({
        title: '상태 변경 완료',
        description: '프로젝트 상태가 변경되었습니다.',
      });
    } catch (error) {
      toast({
        title: '상태 변경 실패',
        description: '상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <Badge 
                className={cn(current.color, 'text-white mr-2')}
                variant="default"
              >
                {current.label}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={status === option.value ? 'bg-muted' : ''}
          >
            <Badge 
              className={cn(option.color, 'text-white mr-2')}
              variant="default"
            >
              {option.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
