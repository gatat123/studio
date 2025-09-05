'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Upload,
  Grid,
  List,
  Loader2,
  FileImage,
  Eye,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface Scene {
  id: string;
  order: number;
  title: string;
  description?: string;
  draft?: {
    url: string;
    uploadedAt: string;
    version: number;
  };
  artwork?: {
    url: string;
    uploadedAt: string;
    version: number;
  };
  status: 'empty' | 'draft' | 'review' | 'approved';
  commentCount: number;
  tags: string[];
  updatedAt: string;
}

interface SceneListProps {
  projectId: string;
  studioId: string;
  canEdit: boolean;
}

const statusColors = {
  empty: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
};

const statusLabels = {
  empty: '비어있음',
  draft: '초안',
  review: '검토중',
  approved: '승인됨',
};

export default function SceneList({ projectId, studioId, canEdit }: SceneListProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchScenes();
  }, [projectId]);

  const fetchScenes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes`);
      if (!response.ok) throw new Error('Failed to fetch scenes');
      const data = await response.json();
      setScenes(data);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      toast({
        title: '씬 목록 로드 실패',
        description: '씬 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link href={`/studios/${studioId}/projects/${projectId}/scenes/upload`}>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                씬 업로드
              </Button>
            </Link>
            <Link href={`/studios/${studioId}/projects/${projectId}/scenes/create`}>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                씬 추가
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 씬 목록 */}
      {scenes.length === 0 ? (
        <Card className="p-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileImage className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">씬이 없습니다</h3>
            <p className="text-sm text-gray-600 mb-4">
              첫 번째 씬을 추가하여 프로젝트를 시작하세요.
            </p>
            {canEdit && (
              <Link href={`/studios/${studioId}/projects/${projectId}/scenes/upload`}>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  첫 씬 업로드
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {scenes.map((scene) => (
            <Link
              key={scene.id}
              href={`/studios/${studioId}/projects/${projectId}/scenes/${scene.id}`}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[3/4] relative bg-gray-100">
                  {scene.artwork?.url || scene.draft?.url ? (
                    <Image
                      src={scene.artwork?.url || scene.draft?.url || ''}
                      alt={scene.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileImage className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-white/90 text-gray-800">
                      #{scene.order}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={statusColors[scene.status]}>
                      {statusLabels[scene.status]}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{scene.title}</h3>
                  {scene.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {scene.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {scene.commentCount > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{scene.commentCount}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(scene.updatedAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {scenes.map((scene) => (
            <Link
              key={scene.id}
              href={`/studios/${studioId}/projects/${projectId}/scenes/${scene.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-16 h-20 relative bg-gray-100 rounded">
                    {scene.artwork?.url || scene.draft?.url ? (
                      <Image
                        src={scene.artwork?.url || scene.draft?.url || ''}
                        alt={scene.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileImage className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">#{scene.order}</Badge>
                      <h3 className="font-medium">{scene.title}</h3>
                      <Badge className={statusColors[scene.status]}>
                        {statusLabels[scene.status]}
                      </Badge>
                    </div>
                    {scene.description && (
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {scene.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {scene.commentCount > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{scene.commentCount}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(scene.updatedAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
