'use client';

import { ReactNode } from 'react';
import { StudioHeader } from '@/components/features/studio/StudioHeader';
import { StudioSidebar } from '@/components/features/studio/StudioSidebar';

export default function StudioLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { studioId: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudioHeader studioId={params.studioId} />
      <div className="flex">
        <StudioSidebar studioId={params.studioId} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}