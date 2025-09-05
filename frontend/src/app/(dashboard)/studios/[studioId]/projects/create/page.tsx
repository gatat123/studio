'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CreateProjectForm {
  title: string;
  description?: string;
  category: 'webtoon' | 'illustration' | 'storyboard' | 'concept';
  deadline?: string;
}

interface PageProps {
  params: { studioId: string };
}

export default function CreateProjectPage({ params }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateProjectForm>({
    defaultValues: {
      category: 'webtoon'
    }
  });

  const onSubmit = async (data: CreateProjectForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/studios/${params.studioId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로젝트 생성에 실패했습니다.');
      }

      const project = await response.json();
      router.push(`/studios/${params.studioId}/projects/${project.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <Link href={`/studios/${params.studioId}/projects`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          프로젝트 목록으로
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>새 프로젝트 생성</CardTitle>
          <CardDescription>
            프로젝트 정보를 입력하여 새로운 프로젝트를 시작하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">프로젝트 이름 *</Label>
              <Input
                id="title"
                {...register('title', { 
                  required: '프로젝트 이름은 필수입니다.' 
                })}
                placeholder="예: 2025년 봄 웹툰 프로젝트"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select 
                defaultValue="webtoon"
                onValueChange={(value) => setValue('category', value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webtoon">웹툰</SelectItem>
                  <SelectItem value="illustration">일러스트</SelectItem>
                  <SelectItem value="storyboard">스토리보드</SelectItem>
                  <SelectItem value="concept">컨셉아트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">마감일</Label>
              <Input
                id="deadline"
                type="date"
                {...register('deadline')}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href={`/studios/${params.studioId}/projects`}>
                <Button type="button" variant="outline" disabled={isLoading}>
                  취소
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '프로젝트 생성'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}