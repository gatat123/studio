import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useRef, useCallback, memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight?: number | ((index: number) => number);
  height?: number;
  width?: string | number;
  renderItem: (item: T, index: number) => ReactNode;
  hasMore?: boolean;
  loadMore?: () => Promise<void> | void;
  threshold?: number;
  className?: string;
  overscan?: number;
  placeholder?: ReactNode;
}

export default function VirtualScroll<T>({
  items,
  itemHeight = 100,
  height = 600,
  width = '100%',
  renderItem,
  hasMore = false,
  loadMore,
  threshold = 15,
  className,
  overscan = 3,
  placeholder
}: VirtualScrollProps<T>) {
  const listRef = useRef<List>(null);
  const itemCount = hasMore ? items.length + 1 : items.length;
  
  const getItemHeight = useCallback((index: number) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight;
  }, [itemHeight]);
  
  const isItemLoaded = useCallback((index: number) => {
    return !hasMore || index < items.length;
  }, [hasMore, items.length]);
  
  const loadMoreItems = useCallback(async () => {
    if (loadMore) {
      await loadMore();
    }
  }, [loadMore]);
  
  const Row = memo(({ index, style }: ListChildComponentProps) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="flex items-center justify-center p-4">
          {placeholder || (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          )}
        </div>
      );
    }
    
    return (
      <div style={style} className="px-4">
        {renderItem(items[index], index)}
      </div>
    );
  });
  
  Row.displayName = 'VirtualScrollRow';
  
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        목록이 비어있습니다.
      </div>
    );
  }
  
  if (loadMore && hasMore) {
    return (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        threshold={threshold}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={(list) => {
              ref(list);
              if (listRef.current !== list) {
                listRef.current = list as any;
              }
            }}
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={getItemHeight}
            onItemsRendered={onItemsRendered}
            overscanCount={overscan}
            className={cn('scrollbar-thin', className)}
          >
            {Row}
          </List>
        )}
      </InfiniteLoader>
    );
  }
  
  return (
    <List
      ref={listRef}
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={getItemHeight}
      overscanCount={overscan}
      className={cn('scrollbar-thin', className)}
    >
      {Row}
    </List>
  );
}