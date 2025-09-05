import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { PerformanceMonitor, measureWebVitals } from '@/utils/performance-monitor';
import { ImagePreloader } from '@/utils/image-optimization';
import { clearCache, getCacheStats } from '@/utils/api-cache';

// 성능 최적화 훅
export function usePerformanceOptimization() {
  // Web Vitals 측정
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    measureWebVitals((metric) => {
      console.log('Web Vitals:', metric);
      
      // 성능 지표를 서버로 전송 (선택사항)
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
        }).catch(console.error);
      }
    });
  }, []);
  
  // 이미지 프리로드
  const preloadImages = useCallback((urls: string[]) => {
    return ImagePreloader.preload(urls);
  }, []);
  
  // 캐시 관리
  const cacheManager = useMemo(() => ({
    clear: () => clearCache(),
    clearPattern: (pattern: string) => clearCache(pattern),
    getStats: () => getCacheStats(),
  }), []);
  
  // 성능 측정
  const measure = useCallback((name: string, fn: () => any) => {
    PerformanceMonitor.startMark(name);
    const result = fn();
    const time = PerformanceMonitor.endMark(name);
    
    if (process.env.NODE_ENV === 'development' && time && time > 100) {
      console.warn(`[Performance] ${name} took ${time.toFixed(2)}ms`);
    }
    
    return result;
  }, []);
  
  // 성능 리포트
  const getReport = useCallback(() => {
    return PerformanceMonitor.generateReport();
  }, []);
  
  return {
    preloadImages,
    cacheManager,
    measure,
    getReport,
  };
}

// 레이지 로딩 훅
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, deps);
  
  useEffect(() => {
    load();
  }, [load]);
  
  const reload = useCallback(() => {
    load();
  }, [load]);
  
  return { data, loading, error, reload };
}

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
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
export function useThrottle<T>(value: T, delay: number) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return throttledValue;
}

// IntersectionObserver를 사용한 레이지 로딩
export function useInViewport(ref: React.RefObject<HTMLElement>, options?: IntersectionObserverInit) {
  const [isInViewport, setIsInViewport] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsInViewport(entry.isIntersecting);
    }, options);
    
    observer.observe(ref.current);
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
  
  return isInViewport;
}

// 뷰포트 크기 훅
export function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// 미디어 쿼리 훅
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }
    
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);
  
  return matches;
}
