import { 
  getUnsyncedData, 
  getOfflineQueue, 
  markAsSynced, 
  removeFromQueue,
  incrementRetries,
  addToOfflineQueue,
  saveOfflineData
} from './db';

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30초

class OfflineSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;

  constructor() {
    this.setupEventListeners();
    this.startSync();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 페이지 가시성 변경 시 동기화
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncNow();
      }
    });
  }

  // 주기적 동기화 시작
  private startSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncNow();
      }
    }, SYNC_INTERVAL);
  }

  // 즉시 동기화
  async syncNow() {
    if (!this.isOnline) return;

    try {
      // 큐에 있는 작업들 처리
      await this.processQueue();
      
      // 동기화되지 않은 데이터 업로드
      await this.uploadUnsyncedData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // 오프라인 큐 처리
  private async processQueue() {
    const queue = await getOfflineQueue();
    
    for (const item of queue) {
      if (item.retries >= MAX_RETRIES) {
        await removeFromQueue(item.id);
        continue;
      }

      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        if (response.ok) {
          await removeFromQueue(item.id);
        } else {
          await incrementRetries(item.id);
        }
      } catch (error) {
        await incrementRetries(item.id);
      }
    }
  }

  // 동기화되지 않은 데이터 업로드
  private async uploadUnsyncedData() {
    const unsyncedData = await getUnsyncedData();
    
    for (const data of unsyncedData) {
      try {
        const endpoint = this.getEndpoint(data.type, data.id);
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data.data),
        });

        if (response.ok) {
          await markAsSynced(data.id);
        }
      } catch (error) {
        console.error(`Failed to sync ${data.type} ${data.id}:`, error);
      }
    }
  }

  // 타입별 엔드포인트 결정
  private getEndpoint(type: string, id: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    switch (type) {
      case 'project':
        return `${baseUrl}/api/projects/${id}`;
      case 'scene':
        return `${baseUrl}/api/scenes/${id}`;
      case 'comment':
        return `${baseUrl}/api/comments/${id}`;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }

  // 서비스 정리
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// 싱글톤 인스턴스
let syncServiceInstance: OfflineSyncService | null = null;

export function initOfflineSync() {
  if (!syncServiceInstance) {
    syncServiceInstance = new OfflineSyncService();
  }
  return syncServiceInstance;
}

export function destroyOfflineSync() {
  if (syncServiceInstance) {
    syncServiceInstance.destroy();
    syncServiceInstance = null;
  }
}

// 오프라인 저장 헬퍼 함수
export async function saveDataOffline(type: 'project' | 'scene' | 'comment', id: string, data: any) {
  await saveOfflineData({
    id,
    type,
    data,
    timestamp: new Date(),
  });
}

// 오프라인 작업 큐에 추가
export async function queueOfflineAction(method: 'POST' | 'PUT' | 'DELETE', url: string, body?: any) {
  await addToOfflineQueue({
    method,
    url,
    body,
  });
}