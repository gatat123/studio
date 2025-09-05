// 자동 저장 훅
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { indexedDBManager, OfflineChange } from '@/lib/db/indexedDB';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  interval?: number; // 저장 간격 (ms)
  debounce?: number; // 디바운스 시간 (ms)
  enableOffline?: boolean; // 오프라인 지원 여부
  onSave?: () => void;
  onError?: (error: Error) => void;
  onConflict?: (local: any, remote: any) => Promise<any>;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  errors: Error[];
}

export function useAutoSave<T extends { id: string; updatedAt?: Date }>(
  data: T | null,
  saveFunction: (data: T) => Promise<T>,
  storeName: string,
  options: AutoSaveOptions = {}
) {
  const {
    interval = 30000, // 30초 기본값
    debounce = 2000, // 2초 디바운스
    enableOffline = true,
    onSave,
    onError,
    onConflict
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
    errors: []
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: '온라인 상태',
        description: '서버와 연결되었습니다. 변경사항을 동기화합니다.',
      });
      syncOfflineChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '오프라인 상태',
        description: '인터넷 연결이 끊겼습니다. 오프라인 모드로 작업이 저장됩니다.',
        variant: 'destructive'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // 오프라인 변경사항 동기화
  const syncOfflineChanges = useCallback(async () => {
    if (!isOnline || isSavingRef.current) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const changes = await indexedDBManager.getUnsyncedChanges();
      setSyncStatus(prev => ({ ...prev, pendingChanges: changes.length }));

      for (const change of changes) {
        try {
          if (change.retryCount >= 3) {
            console.error('Max retry count reached for change:', change);
            continue;
          }

          // API 호출을 통한 동기화
          let result;
          switch (change.type) {
            case 'create':
              result = await apiClient.post(`/api/${change.entity}`, change.data);
              break;
            case 'update':
              result = await apiClient.put(`/api/${change.entity}/${change.entityId}`, change.data);
              break;
            case 'delete':
              result = await apiClient.delete(`/api/${change.entity}/${change.entityId}`);
              break;
          }

          await indexedDBManager.markChangeSynced(change.id);
          setSyncStatus(prev => ({ 
            ...prev, 
            pendingChanges: Math.max(0, prev.pendingChanges - 1),
            lastSyncTime: new Date()
          }));
        } catch (error) {
          console.error('Failed to sync change:', error);
          
          // 충돌 처리
          if (error.response?.status === 409 && onConflict) {
            const localData = change.data;
            const remoteData = error.response.data.remote;
            const resolvedData = await onConflict(localData, remoteData);
            
            // 충돌 해결된 데이터로 재시도
            change.data = resolvedData;
            change.retryCount++;
            await indexedDBManager.save('offlineChanges', change);
          } else {
            // 재시도 카운트 증가
            change.retryCount++;
            await indexedDBManager.save('offlineChanges', change);
            setSyncStatus(prev => ({ 
              ...prev, 
              errors: [...prev.errors, error as Error]
            }));
          }
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        errors: [...prev.errors, error as Error]
      }));
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isOnline, onConflict]);

  // 데이터 저장 함수
  const saveData = useCallback(async () => {
    if (!data || isSavingRef.current) return;

    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) {
      return; // 변경사항 없음
    }

    isSavingRef.current = true;

    try {
      if (isOnline) {
        // 온라인: 서버에 직접 저장
        const savedData = await saveFunction(data);
        lastSavedDataRef.current = JSON.stringify(savedData);
        
        // IndexedDB에도 캐싱
        if (enableOffline) {
          await indexedDBManager.save(storeName, savedData);
        }

        onSave?.();
        
        // 세션 데이터 저장
        if (user) {
          await indexedDBManager.saveSession({
            userId: user.id,
            projectId: (data as any).projectId,
            sceneId: (data as any).sceneId,
            formData: {},
            scrollPositions: { [window.location.pathname]: window.scrollY }
          });
        }
      } else if (enableOffline) {
        // 오프라인: IndexedDB에 저장하고 변경사항 큐에 추가
        await indexedDBManager.save(storeName, data);
        await indexedDBManager.addOfflineChange({
          type: 'update',
          entity: storeName as any,
          entityId: data.id,
          data
        });
        
        setSyncStatus(prev => ({ 
          ...prev, 
          pendingChanges: prev.pendingChanges + 1 
        }));
        
        lastSavedDataRef.current = dataString;
        onSave?.();
        
        toast({
          title: '오프라인 저장',
          description: '변경사항이 로컬에 저장되었습니다. 온라인 시 동기화됩니다.',
        });
      }
    } catch (error) {
      console.error('Save failed:', error);
      onError?.(error as Error);
      
      toast({
        title: '저장 실패',
        description: '데이터 저장 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, isOnline, enableOffline, saveFunction, storeName, onSave, onError, user, toast]);

  // 디바운스된 저장
  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveData();
    }, debounce);
  }, [saveData, debounce]);

  // 주기적 자동 저장
  useEffect(() => {
    if (!data) return;

    // 초기 타이머 설정
    saveTimerRef.current = setInterval(() => {
      saveData();
    }, interval);

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [data, interval, saveData]);

  // 데이터 변경 감지 및 디바운스 저장
  useEffect(() => {
    if (!data) return;
    
    const dataString = JSON.stringify(data);
    if (dataString !== lastSavedDataRef.current) {
      debouncedSave();
    }
  }, [data, debouncedSave]);

  // 페이지 언로드 시 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dataString = JSON.stringify(data);
      if (dataString !== lastSavedDataRef.current && data) {
        // 동기적으로 IndexedDB에 저장 시도
        const beacon = new Blob([dataString], { type: 'application/json' });
        navigator.sendBeacon(`/api/${storeName}/${data.id}`, beacon);
        
        e.preventDefault();
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, storeName]);

  // 세션 복구
  const recoverSession = useCallback(async () => {
    if (!user) return null;

    try {
      const session = await indexedDBManager.getLatestSession(user.id);
      if (session) {
        // 스크롤 위치 복원
        if (session.scrollPositions[window.location.pathname]) {
          window.scrollTo(0, session.scrollPositions[window.location.pathname]);
        }
        
        return session;
      }
    } catch (error) {
      console.error('Session recovery failed:', error);
    }
    
    return null;
  }, [user]);

  // 수동 저장 트리거
  const triggerSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveData();
  }, [saveData]);

  // 오프라인 데이터 로드
  const loadOfflineData = useCallback(async (id: string): Promise<T | null> => {
    try {
      const data = await indexedDBManager.get<T>(storeName, id);
      return data;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }, [storeName]);

  // cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isOnline,
    syncStatus,
    triggerSave,
    recoverSession,
    loadOfflineData,
    syncOfflineChanges
  };
}
