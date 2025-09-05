'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Activity, Clock, MessageSquare, Upload, Edit, Trash } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'comment' | 'upload' | 'edit' | 'delete' | 'status_change';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  details?: any;
}

interface ProjectActivityProps {
  activities?: ActivityItem[];
  className?: string;
}

const activityIcons = {
  comment: MessageSquare,
  upload: Upload,
  edit: Edit,
  delete: Trash,
  status_change: Clock,
};

export const ProjectActivity: React.FC<ProjectActivityProps> = ({
  activities = [],
  className = '',
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    const Icon = activityIcons[type] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    const colors = {
      comment: 'text-blue-500',
      upload: 'text-green-500',
      edit: 'text-yellow-500',
      delete: 'text-red-500',
      status_change: 'text-purple-500',
    };
    return colors[type] || 'text-gray-500';
  };

  if (activities.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>아직 활동 내역이 없습니다</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        최근 활동
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`mt-1 ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{activity.user.name}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activity.action}
                {activity.target && (
                  <span className="font-medium"> "{activity.target}"</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProjectActivity;
