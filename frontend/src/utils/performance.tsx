import { useCallback, useMemo, useRef, useEffect, DependencyList } from 'react';
import { memo, ComponentType, PropsWithChildren } from 'react';

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 스로틀 훅
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdated.current;

    if (elapsed >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - elapsed);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// 메모이제이션된 콜백을 위한 훅
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useCallback(callback, deps);
}

// 깊은 비교를 사용한 메모
export function useDeepCompareMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<DependencyList>();
  const signalRef = useRef<number>(0);

  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  return useMemo(factory, [signalRef.current]);
}

// 깊은 비교 함수
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      if (typeof a[i] === 'object' && typeof b[i] === 'object') {
        if (!isEqual(a[i], b[i])) return false;
      } else {
        return false;
      }
    }
  }
  return true;
}

// 렌더링 추적 HOC
export function withRenderTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    if (process.env.NODE_ENV === 'development') {
      const changes: string[] = [];
      
      Object.keys(prevProps).forEach(key => {
        if (prevProps[key as keyof P] !== nextProps[key as keyof P]) {
          changes.push(key);
        }
      });
      
      if (changes.length > 0) {
        console.log(`[${componentName}] Re-rendering due to changes in:`, changes);
      }
    }
    
    return false; // Always allow re-render in dev, but log changes
  });

  MemoizedComponent.displayName = `WithRenderTracking(${componentName})`;
  return MemoizedComponent;
}

// 조건부 메모이제이션 HOC
export function withConditionalMemo<P extends object>(
  Component: ComponentType<P>,
  shouldMemoize: (props: P) => boolean
) {
  return (props: P) => {
    const MemoComponent = useMemo(
      () => (shouldMemoize(props) ? memo(Component) : Component),
      [shouldMemoize(props)]
    );
    
    return <MemoComponent {...props} />;
  };
}

// useState import 추가
import { useState } from 'react';

export { memo };
