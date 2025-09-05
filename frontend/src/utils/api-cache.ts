import { LRUCache } from 'lru-cache';

// LRU 캐시 인스턴스
const apiCache = new LRUCache<string, any>({
  max: 100, // 최대 100개 항목
  ttl: 1000 * 60 * 5, // 5분 TTL
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

// 캐시 키 생성 함수
export function getCacheKey(url: string, params?: any): string {
  const sortedParams = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
  return `${url}:${sortedParams}`;
}

// 캐싱된 API 호출 함수
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & { 
    params?: any;
    cacheTime?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<T> {
  const { params, cacheTime = 300000, forceRefresh = false, ...fetchOptions } = options;
  const cacheKey = getCacheKey(url, params);
  
  // 캐시 확인
  if (!forceRefresh && apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey) as T;
  }
  
  // URL에 params 추가
  let finalUrl = url;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    finalUrl = `${url}?${queryString}`;
  }
  
  try {
    const response = await fetch(finalUrl, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 캐시 저장
    apiCache.set(cacheKey, data, { ttl: cacheTime });
    
    return data as T;
  } catch (error) {
    // 에러 시 이전 캐시 데이터 반환 (stale-while-revalidate)
    if (apiCache.has(cacheKey)) {
      console.warn('Using stale cache due to fetch error:', error);
      return apiCache.get(cacheKey) as T;
    }
    throw error;
  }
}

// 캐시 클리어
export function clearCache(pattern?: string): void {
  if (pattern) {
    const keys = [...apiCache.keys()];
    keys.forEach(key => {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    });
  } else {
    apiCache.clear();
  }
}

// 캐시 상태 확인
export function getCacheStats() {
  return {
    size: apiCache.size,
    maxSize: apiCache.max,
    calculatedSize: apiCache.calculatedSize,
  };
}

// React Query 통합을 위한 래퍼
export function createCachedQueryFn<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  cacheTime = 300000
) {
  return async (): Promise<T> => {
    if (apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey) as T;
    }
    
    const data = await fetchFn();
    apiCache.set(cacheKey, data, { ttl: cacheTime });
    return data;
  };
}