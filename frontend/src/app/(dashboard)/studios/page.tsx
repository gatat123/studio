'use client';

import { useState } from 'react';
import { Plus, Building } from 'lucide-react';
import { StudioCard } from '@/components/features/studio/StudioCard';
import { StudioCreateModal } from '@/components/features/studio/StudioCreateModal';
import { useStudio } from '@/components/features/studio/hooks/useStudio';
import { Button } from '@/components/ui/button';

export default function StudiosPage() {
  const { studios, loading, error } = useStudio();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">오류가 발생했습니다: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 스튜디오</h1>
          <p className="text-gray-600 mt-2">
            프로젝트를 관리할 스튜디오를 선택하거나 생성하세요
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          새 스튜디오
        </Button>
      </div>

      {/* Studios Grid */}
      {studios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">아직 스튜디오가 없습니다</p>
          <p className="text-sm text-gray-400 mb-6">
            첫 번째 스튜디오를 생성해보세요!
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            스튜디오 생성
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <StudioCreateModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
