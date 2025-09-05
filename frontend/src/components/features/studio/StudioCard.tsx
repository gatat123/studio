'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Users, FolderOpen, Calendar } from 'lucide-react';
import { Studio } from '@/types/studio';
import { formatDate } from '@/utils/format';

interface StudioCardProps {
  studio: Studio;
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <Link href={`/studios/${studio.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {studio.logo ? (
              <img
                src={studio.logo}
                alt={studio.name}
                className="w-12 h-12 rounded-lg mr-3 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                <Building className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{studio.name}</h3>
              <p className="text-sm text-gray-500">
                {studio.role === 'owner' && '소유자'}
                {studio.role === 'admin' && '관리자'}
                {studio.role === 'editor' && '편집자'}
                {studio.role === 'viewer' && '뷰어'}
              </p>
            </div>
          </div>
        </div>

        {studio.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{studio.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{studio.memberCount || 0} 멤버</span>
            </div>
            <div className="flex items-center">
              <FolderOpen className="w-4 h-4 mr-1" />
              <span>{studio.projectCount || 0} 프로젝트</span>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(studio.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
