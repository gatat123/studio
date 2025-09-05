'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Scene } from '@/types/scene.types';

interface DraggableSceneItemProps {
  scene: Scene;
  isDragging?: boolean;
}

const DraggableSceneItem: React.FC<DraggableSceneItemProps> = ({ scene, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
    cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all ${
        isCurrentlyDragging ? 'z-50 shadow-lg scale-105' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab hover:bg-gray-100 p-1 rounded"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* 씬 썸네일 */}
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {scene.thumbnail ? (
            <Image
              src={scene.thumbnail}
              alt={scene.title}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : scene.draft ? (
            <Image
              src={scene.draft.url}
              alt={scene.title}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : scene.artwork ? (
            <Image
              src={scene.artwork.url}
              alt={scene.title}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <ImageIcon className="w-10 h-10 text-gray-400" />
          )}
        </div>

        {/* 씬 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">#{scene.order}</span>
            <h3 className="font-semibold">{scene.title}</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                scene.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : scene.status === 'review'
                  ? 'bg-yellow-100 text-yellow-700'
                  : scene.status === 'draft'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {scene.status}
            </span>
          </div>
          
          {scene.description && (
            <p className="text-sm text-gray-600 mb-2">{scene.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {scene.draft && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>초안</span>
              </div>
            )}
            {scene.artwork && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span>아트워크</span>
              </div>
            )}
            {scene.comments && scene.comments.length > 0 && (
              <span>{scene.comments.length} 댓글</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DraggableSceneListProps {
  scenes: Scene[];
  projectId: string;
  onOrderChange?: (reorderedScenes: Scene[]) => void;
}

export default function DraggableSceneList({ 
  scenes: initialScenes, 
  projectId,
  onOrderChange 
}: DraggableSceneListProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setScenes(initialScenes);
  }, [initialScenes]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = scenes.findIndex((scene) => scene.id === active.id);
      const newIndex = scenes.findIndex((scene) => scene.id === over?.id);

      const reorderedScenes = arrayMove(scenes, oldIndex, newIndex).map(
        (scene, index) => ({
          ...scene,
          order: index + 1,
        })
      );

      setScenes(reorderedScenes);
      
      if (onOrderChange) {
        onOrderChange(reorderedScenes);
      }

      // 서버에 순서 변경 저장
      try {
        setIsUpdating(true);
        const response = await fetch(`/api/scenes/bulk-update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            scenes: reorderedScenes.map((scene) => ({
              id: scene.id,
              order: scene.order,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update scene order');
        }
      } catch (error) {
        console.error('Error updating scene order:', error);
        // 실패 시 원래 순서로 롤백
        setScenes(initialScenes);
        alert('씬 순서 변경에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsUpdating(false);
      }
    }

    setActiveId(null);
  };

  const activeScene = activeId ? scenes.find((s) => s.id === activeId) : null;

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>순서 변경 중...</span>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {scenes.map((scene) => (
              <DraggableSceneItem key={scene.id} scene={scene} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeScene ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-xl opacity-90">
              <DraggableSceneItem scene={activeScene} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {scenes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">아직 씬이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            씬을 추가하여 프로젝트를 시작하세요.
          </p>
        </div>
      )}
    </div>
  );
}