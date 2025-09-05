// 이미지 프리로더 유틸리티
export class ImagePreloader {
  private static cache = new Map<string, boolean>();
  
  static preload(src: string | string[]): Promise<void[]> {
    const sources = Array.isArray(src) ? src : [src];
    
    return Promise.all(
      sources.map(s => {
        if (this.cache.has(s)) {
          return Promise.resolve();
        }
        
        return new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          
          img.onload = () => {
            this.cache.set(s, true);
            resolve();
          };
          
          img.onerror = () => {
            this.cache.set(s, false);
            reject(new Error(`Failed to preload image: ${s}`));
          };
          
          img.src = s;
        });
      })
    );
  }
  
  static isPreloaded(src: string): boolean {
    return this.cache.has(src) && this.cache.get(src) === true;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
}

// 이미지 최적화 URL 생성
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string {
  const { width, height, quality = 75, format = 'auto' } = options;
  
  // Next.js 이미지 최적화 API 사용
  if (src.startsWith('/') || src.startsWith('http')) {
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    
    if (format !== 'auto') {
      params.append('fm', format);
    }
    
    return `/_next/image?${params.toString()}&url=${encodeURIComponent(src)}`;
  }
  
  return src;
}

// 이미지 사이즈 추천 함수
export function getRecommendedImageSize(containerWidth: number): {
  width: number;
  height: number;
} {
  // 디바이스 픽셀 비율 고려
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const width = Math.ceil(containerWidth * dpr);
  
  // 일반적인 이미지 비율 (16:9)
  const height = Math.ceil(width * (9 / 16));
  
  // Next.js 이미지 최적화 사이즈에 맞춤
  const optimizedSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  const optimalWidth = optimizedSizes.find(s => s >= width) || width;
  
  return {
    width: optimalWidth,
    height: Math.ceil(optimalWidth * (9 / 16))
  };
}
