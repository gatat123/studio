'use client';

import { useEffect, useState } from 'react';
import { getProjectActivity } from '@/lib/api/projects';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  FileImage, 
  MessageSquare, 
  Upload, 
  Edit, 
  Trash2, 
  UserPlus,
  Settings
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';

interface Activity {
  id: string;
  type: 'scene_created' | 'scene_updated' | 'comment_added' | 'member_added' | 'status_changed' | 'settings_updated';
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  details: string;
  metadata?: any;
  createdAt: string;
}

interface ProjectActivityProps {
  projectId: string;
}

const activityConfig = {
  scene_created: { icon: FileImage, color: 'text-green-600' },
  scene_updated: { icon: Edit, color: 'text-blue-600' },
  comment_added: { icon: MessageSquare, color: 'text-purple-600' },
  member_added: { icon: UserPlus, color: 'text-orange-600' },
  status_changed: { icon: Settings, color: 'text-yellow-600' },
  settings_updated: { icon: Settings, color: 'text-gray-600' },
};

export default function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [projectId]);

  const loadActivity = async () => {
    try {
      const data = await getProjectActivity(projectId);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        활동 내역을 불러오는 중...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        아직 활동 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => {
        const config = activityConfig[activity.type];
        const Icon = config?.icon || FileImage;
        
        return (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback>
                {activity.user.nickname?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                <p className="text-sm">
                  <span className="font-medium">{activity.user.nickname}</span>
                  <span className="text-muted-foreground"> {activity.details}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
