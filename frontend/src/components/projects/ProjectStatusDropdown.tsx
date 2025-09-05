'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProjectStatusDropdownProps {
  projectId: string;
  currentStatus: string;
  canEdit: boolean;
}

const statusColors = {
  planning: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  review: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  completed: 'bg-green-100 text-green-800 hover:bg-green-200',
  archived: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
};

const statusLabels = {
  planning: '기획중',
  in_progress: '진행중',
  review: '검토중',
  completed: '완료',
  archived: '보관됨',
};

const statusOptions = [
  { value: 'planning', label: '기획중' },
  { value: 'in_progress', label: '진행중' },
  { value: 'review', label: '검토중' },
  { value: 'completed', label: '완료' },
  { value: 'archived', label: '보관됨' },
];

export default function ProjectStatusDropdown({
  projectId,
  currentStatus,
  canEdit,
}: ProjectStatusDropdownProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status || !canEdit) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
      router.refresh();
      
      toast({
        title: '상태 변경 완료',
        description: `프로젝트 상태가 "${statusLabels[newStatus]}"로 변경되었습니다.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: '상태 변경 실패',
        description: '프로젝트 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <Badge className={statusColors[status]} variant="secondary">
        {statusLabels[status]}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${statusColors[status]} border-0`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <>
              {statusLabels[status]}
              <ChevronDown className="ml-2 h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={option.value === status}
            className={option.value === status ? 'opacity-50' : ''}
          >
            <Badge
              className={`${statusColors[option.value]} mr-2`}
              variant="secondary"
            >
              {option.label}
            </Badge>
            {option.value === status && '(현재)'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
