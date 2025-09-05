'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ImagePreviewModal } from './ImagePreviewModal';

interface Scene {
  id: string;
  title: string;
  order: number;
  status: 'empty' | 'draft' | 'review' | 'approved';
  draft?: {
    url: string;
    uploadedAt: Date;
  };
  artwork?: {
    url: string;
    uploadedAt: Date;
  };
  comments: any[];
}

interface SceneGridViewProps {
  scenes: Scene[];
  viewMode: 'grid' | 'list';
  selectionMode?: boolean;
  selectedScenes?: Set<string>;
  onSceneSelect?: (sceneId: string) => void;
  onSceneEdit?: (scene: Scene) => void;
  onSceneDelete?: (sceneId: string) => void;
  onBulkAction?: (action: string, sceneIds: string[]) => void;
}

export function SceneGridView({
  scenes,
  viewMode = 'grid',
  selectionMode = false,
  selectedScenes = new Set(),
  onSceneSelect,
  onSceneEdit,
  onSceneDelete,
  onBulkAction,
}: SceneGridViewProps) {
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    images: any[];
    initialIndex: number;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  const handleImageClick = (scene: Scene, type: 'draft' | 'artwork') => {
    const images = [];
    
    if (scene.draft?.url) {
      images.push({
        id: `${scene.id}-draft`,
        url: scene.draft.url,
        title: `${scene.title} - 초안`,
        type: 'draft',
      });
    }
    
    if (scene.artwork?.url) {
      images.push({
        id: `${scene.id}-artwork`,
        url: scene.artwork.url,
        title: `${scene.title} - 아트워크`,
        type: 'artwork',
      });
    }

    const initialIndex = type === 'draft' ? 0 : (scene.draft ? 1 : 0);

    setPreviewModal({
      isOpen: true,
      images,
      initialIndex,
    });
  };

  const handleSelectAll = () => {
    if (selectedScenes.size === scenes.length) {
      // Deselect all
      if (onBulkAction) {
        onBulkAction('deselect-all', []);
      }
    } else {
      // Select all
      const allIds = scenes.map(s => s.id);
      if (onBulkAction) {
        onBulkAction('select-all', allIds);
      }
    }
  };

  const getStatusColor = (status: Scene['status']) => {
    switch (status) {
      case 'empty': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'review': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Scene['status']) => {
    switch (status) {
      case 'empty': return '비어있음';
      case 'draft': return '초안';
      case 'review': return '검토중';
      case 'approved': return '승인됨';
      default: return status;
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="space-y-2">
          {/* List header with select all */}
          {selectionMode && (
            <div className="flex items-center p-4 bg-muted/50 rounded-lg">
              <Checkbox
                checked={selectedScenes.size === scenes.length && scenes.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="ml-2 text-sm">
                {selectedScenes.size > 0 
                  ? `${selectedScenes.size}개 선택됨` 
                  : '모두 선택'}
              </span>
              {selectedScenes.size > 0 && (
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBulkAction?.('delete', Array.from(selectedScenes))}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* List items */}
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className={cn(
                "flex items-center gap-4 p-4 bg-card rounded-lg border transition-colors",
                selectedScenes.has(scene.id) && "bg-accent"
              )}
            >
              {selectionMode && (
                <Checkbox
                  checked={selectedScenes.has(scene.id)}
                  onCheckedChange={() => onSceneSelect?.(scene.id)}
                />
              )}

              <div className="flex-shrink-0 text-lg font-semibold text-muted-foreground">
                #{scene.order}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {scene.draft?.url && (
                  <div 
                    className="relative w-16 h-16 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                    onClick={() => handleImageClick(scene, 'draft')}
                  >
                    <Image
                      src={scene.draft.url}
                      alt="Draft"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center">
                      초안
                    </div>
                  </div>
                )}
                {scene.artwork?.url && (
                  <div 
                    className="relative w-16 h-16 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                    onClick={() => handleImageClick(scene, 'artwork')}
                  >
                    <Image
                      src={scene.artwork.url}
                      alt="Artwork"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center">
                      아트워크
                    </div>
                  </div>
                )}
                {!scene.draft?.url && !scene.artwork?.url && (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold">{scene.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={cn(getStatusColor(scene.status), 'text-white')}>
                    {getStatusLabel(scene.status)}
                  </Badge>
                  {scene.comments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {scene.comments.length}
                    </span>
                  )}
                </div>
              </div>

              {!selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSceneEdit?.(scene)}>
                      <Edit className="h-4 w-4 mr-2" />
                      편집
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onSceneDelete?.(scene.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        <ImagePreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
          images={previewModal.images}
          initialIndex={previewModal.initialIndex}
        />
      </>
    );
  }

  // Grid view
  return (
    <>
      {/* Selection header */}
      {selectionMode && (
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                checked={selectedScenes.size === scenes.length && scenes.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="ml-2 text-sm">
                {selectedScenes.size > 0 
                  ? `${selectedScenes.size}개 선택됨` 
                  : '모두 선택'}
              </span>
            </div>
            {selectedScenes.size > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkAction?.('delete', Array.from(selectedScenes))}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {scenes.map((scene) => (
          <Card 
            key={scene.id} 
            className={cn(
              "group relative overflow-hidden transition-all hover:shadow-lg",
              selectedScenes.has(scene.id) && "ring-2 ring-primary"
            )}
          >
            {/* Selection checkbox */}
            {selectionMode && (
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedScenes.has(scene.id)}
                  onCheckedChange={() => onSceneSelect?.(scene.id)}
                  className="bg-white"
                />
              </div>
            )}

            {/* Dropdown menu */}
            {!selectionMode && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSceneEdit?.(scene)}>
                      <Edit className="h-4 w-4 mr-2" />
                      편집
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onSceneDelete?.(scene.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <CardContent className="p-0">
              {/* Image */}
              <div className="relative aspect-[4/3] bg-muted">
                {scene.artwork?.url ? (
                  <div 
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => handleImageClick(scene, 'artwork')}
                  >
                    <Image
                      src={scene.artwork.url}
                      alt={scene.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </div>
                ) : scene.draft?.url ? (
                  <div 
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => handleImageClick(scene, 'draft')}
                  >
                    <Image
                      src={scene.draft.url}
                      alt={scene.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Scene number badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-semibold">
                  #{scene.order}
                </div>

                {/* Type indicators */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {scene.draft?.url && (
                    <div className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs">
                      초안
                    </div>
                  )}
                  {scene.artwork?.url && (
                    <div className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                      아트워크
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm mb-1 truncate">{scene.title}</h3>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={cn(getStatusColor(scene.status), 'text-white text-xs')}
                  >
                    {getStatusLabel(scene.status)}
                  </Badge>
                  {scene.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {scene.comments.length}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
        images={previewModal.images}
        initialIndex={previewModal.initialIndex}
      />
    </>
  );
}
