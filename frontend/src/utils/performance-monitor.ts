// 성능 측정 유틸리티
export class PerformanceMonitor {
  private static marks = new Map<string, number>();
  private static measures = new Map<string, number[]>();
  
  // 성능 마크 시작
  static startMark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  // 성능 측정 종료 및 기록
  static endMark(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) return null;
    
    const duration = performance.now() - startTime;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);
    
    this.marks.delete(name);
    return duration;
  }
  
  // 평균 실행 시간 계산
  static getAverageTime(name: string): number {
    const times = this.measures.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  // 모든 측정값 가져오기
  static getMetrics() {
    const metrics: Record<string, any> = {};
    
    this.measures.forEach((times, name) => {
      metrics[name] = {
        count: times.length,
        average: this.getAverageTime(name),
        min: Math.min(...times),
        max: Math.max(...times),
        total: times.reduce((a, b) => a + b, 0),
      };
    });
    
    return metrics;
  }
  
  // 성능 리포트 생성
  static generateReport(): string {
    const metrics = this.getMetrics();
    const report: string[] = ['=== Performance Report ==='];
    
    Object.entries(metrics).forEach(([name, data]) => {
      report.push(`
${name}:
  - Count: ${data.count}
  - Average: ${data.average.toFixed(2)}ms
  - Min: ${data.min.toFixed(2)}ms
  - Max: ${data.max.toFixed(2)}ms
  - Total: ${data.total.toFixed(2)}ms
      `);
    });
    
    return report.join('\n');
  }
  
  // 리셋
  static reset(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Web Vitals 측정
export function measureWebVitals(callback: (metric: any) => void) {
  if (typeof window === 'undefined') return;
  
  // First Contentful Paint (FCP)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        callback({
          name: 'FCP',
          value: entry.startTime,
          rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
        });
      }
    }
  }).observe({ entryTypes: ['paint'] });
  
  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback({
      name: 'LCP',
      value: lastEntry.renderTime || lastEntry.loadTime,
      rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
    });
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    const firstInput = list.getEntries()[0];
    if (firstInput) {
      const delay = firstInput.processingStart - firstInput.startTime;
      callback({
        name: 'FID',
        value: delay,
        rating: delay < 100 ? 'good' : delay < 300 ? 'needs-improvement' : 'poor'
      });
    }
  }).observe({ entryTypes: ['first-input'] });
  
  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  let clsEntries: any[] = [];
  
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = clsEntries[0];
        const lastSessionEntry = clsEntries[clsEntries.length - 1];
        
        if (firstSessionEntry && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
          clsValue += entry.value;
          clsEntries.push(entry);
        } else {
          clsValue = entry.value;
          clsEntries = [entry];
        }
        
        callback({
          name: 'CLS',
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
        });
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });
}

// React 컴포넌트 렌더링 시간 측정 Hook
import { useEffect, useRef } from 'react';

export function useRenderTime(componentName: string) {
  const renderStart = useRef<number>(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    PerformanceMonitor.startMark(`${componentName}-render`);
    PerformanceMonitor.endMark(`${componentName}-render`);
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  });
}