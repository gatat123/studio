import { useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { toast } from 'sonner';

interface AutoSaveOptions {
  interval?: number; // 자동 저장 간격 (ms)
  debounce?: number; // 디바운스 시간 (ms)
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useAutoSave({
  interval = 30000, // 30초
  debounce = 2000, // 2초
  onSave,
  onError,
  enabled = true,
}: AutoSaveOptions) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<Date>();
  const pendingDataRef = useRef<any>();
  const isSavingRef = useRef(false);

  const performSave = useCallback(async (data: any) => {
    if (isSavingRef.current || !enabled) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSaveRef.current = new Date();
      pendingDataRef.current = null;
      
      // 저장 성공 표시 (선택적)
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (onError) {
        onError(error as Error);
      } else {
        toast.error('자동 저장 실패');
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onError, enabled]);

  const scheduleSave = useCallback((data: any) => {
    if (!enabled) return;

    pendingDataRef.current = data;

    // 기존 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 새 타이머 설정
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        performSave(pendingDataRef.current);
      }
    }, debounce);
  }, [debounce, performSave, enabled]);

  // 즉시 저장
  const saveNow = useCallback(async (data: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave(data);
  }, [performSave]);

  // 주기적 자동 저장
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      if (pendingDataRef.current && !isSavingRef.current) {
        performSave(pendingDataRef.current);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [interval, performSave, enabled]);

  // 페이지 언로드 시 저장
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingDataRef.current) {
        // 동기적으로 저장 시도 (브라우저 제한으로 인해 실패할 수 있음)
        navigator.sendBeacon('/api/autosave', JSON.stringify(pendingDataRef.current));
        
        // 경고 메시지 표시
        e.preventDefault();
        e.returnValue = '저장되지 않은 변경 사항이 있습니다. 페이지를 떠나시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    scheduleSave,
    saveNow,
    lastSave: lastSaveRef.current,
    isSaving: isSavingRef.current,
    hasPendingChanges: !!pendingDataRef.current,
  };
}
