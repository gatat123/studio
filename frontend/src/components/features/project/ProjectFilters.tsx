'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { useState, useCallback } from 'react';

const statusOptions = [
  { value: '', label: '모든 상태' },
  { value: 'planning', label: '기획' },
  { value: 'in_progress', label: '진행중' },
  { value: 'review', label: '검토중' },
  { value: 'completed', label: '완료' },
  { value: 'archived', label: '보관' },
];

const categoryOptions = [
  { value: '', label: '모든 카테고리' },
  { value: 'webtoon', label: '웹툰' },
  { value: 'illustration', label: '일러스트' },
  { value: 'storyboard', label: '스토리보드' },
  { value: 'concept', label: '컨셉아트' },
];

const sortOptions = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'name', label: '이름순' },
];

export default function ProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentStatus = searchParams.get('status') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  
  const [showFilters, setShowFilters] = useState(false);
  
  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);
  
  const resetFilters = () => {
    router.push(pathname);
  };
  
  const hasFilters = currentStatus || currentCategory || currentSort !== 'newest';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
        
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
          >
            <X className="mr-2 h-4 w-4" />
            필터 초기화
          </Button>
        )}
      </div>
      
      {(showFilters || hasFilters) && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <Select
            value={currentStatus}
            onValueChange={(value) => updateParams('status', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={currentCategory}
            onValueChange={(value) => updateParams('category', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={currentSort}
            onValueChange={(value) => updateParams('sort', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {currentStatus && (
            <Badge variant="secondary">
              상태: {statusOptions.find(o => o.value === currentStatus)?.label}
            </Badge>
          )}
          {currentCategory && (
            <Badge variant="secondary">
              카테고리: {categoryOptions.find(o => o.value === currentCategory)?.label}
            </Badge>
          )}
          {currentSort !== 'newest' && (
            <Badge variant="secondary">
              정렬: {sortOptions.find(o => o.value === currentSort)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
