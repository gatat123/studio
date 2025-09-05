import Dexie, { Table } from 'dexie';

export interface OfflineData {
  id: string;
  type: 'project' | 'scene' | 'comment';
  data: any;
  timestamp: Date;
  synced: boolean;
}

export interface OfflineQueue {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: any;
  timestamp: Date;
  retries: number;
}

class StudioDatabase extends Dexie {
  offlineData!: Table<OfflineData>;
  offlineQueue!: Table<OfflineQueue>;

  constructor() {
    super('StudioDB');
    this.version(1).stores({
      offlineData: 'id, type, timestamp, synced',
      offlineQueue: 'id, timestamp, retries',
    });
  }
}

export const db = new StudioDatabase();

// 오프라인 데이터 저장
export async function saveOfflineData(data: Omit<OfflineData, 'synced'>) {
  return await db.offlineData.put({
    ...data,
    synced: false,
  });
}

// 오프라인 큐에 추가
export async function addToOfflineQueue(data: Omit<OfflineQueue, 'id' | 'timestamp' | 'retries'>) {
  return await db.offlineQueue.add({
    ...data,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    retries: 0,
  });
}

// 동기화되지 않은 데이터 가져오기
export async function getUnsyncedData() {
  return await db.offlineData.where('synced').equals(false).toArray();
}

// 오프라인 큐 가져오기
export async function getOfflineQueue() {
  return await db.offlineQueue.toArray();
}

// 동기화 완료 표시
export async function markAsSynced(id: string) {
  return await db.offlineData.update(id, { synced: true });
}

// 큐에서 제거
export async function removeFromQueue(id: string) {
  return await db.offlineQueue.delete(id);
}

// 재시도 횟수 증가
export async function incrementRetries(id: string) {
  const item = await db.offlineQueue.get(id);
  if (item) {
    return await db.offlineQueue.update(id, { retries: item.retries + 1 });
  }
}