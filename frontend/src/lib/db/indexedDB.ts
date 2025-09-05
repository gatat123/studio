// IndexedDB 설정 및 관리
import { Project, Scene, Comment } from '@/types';

const DB_NAME = 'StudioOfflineDB';
const DB_VERSION = 1;

export interface OfflineChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'scene' | 'comment' | 'file';
  entityId: string;
  data: any;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
}

export interface SessionData {
  id: string;
  userId: string;
  projectId?: string;
  sceneId?: string;
  lastActivity: Date;
  formData: Record<string, any>;
  scrollPositions: Record<string, number>;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('studioId', 'studioId', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Scenes store
        if (!db.objectStoreNames.contains('scenes')) {
          const sceneStore = db.createObjectStore('scenes', { keyPath: 'id' });
          sceneStore.createIndex('projectId', 'projectId', { unique: false });
          sceneStore.createIndex('order', 'order', { unique: false });
        }

        // Comments store
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentStore.createIndex('sceneId', 'sceneId', { unique: false });
          commentStore.createIndex('userId', 'userId', { unique: false });
        }

        // Files store
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('sceneId', 'sceneId', { unique: false });
        }

        // Offline changes queue
        if (!db.objectStoreNames.contains('offlineChanges')) {
          const changesStore = db.createObjectStore('offlineChanges', { keyPath: 'id' });
          changesStore.createIndex('synced', 'synced', { unique: false });
          changesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Session data store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('userId', 'userId', { unique: false });
          sessionStore.createIndex('lastActivity', 'lastActivity', { unique: false });
        }
      };
    });
  }

  // Generic CRUD operations
  async save<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Offline changes queue management
  async addOfflineChange(change: Omit<OfflineChange, 'id' | 'timestamp' | 'synced' | 'retryCount'>): Promise<void> {
    const offlineChange: OfflineChange = {
      ...change,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      synced: false,
      retryCount: 0
    };

    await this.save('offlineChanges', offlineChange);
  }

  async getUnsyncedChanges(): Promise<OfflineChange[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineChanges'], 'readonly');
      const store = transaction.objectStore('offlineChanges');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markChangeSynced(changeId: string): Promise<void> {
    const change = await this.get<OfflineChange>('offlineChanges', changeId);
    if (change) {
      change.synced = true;
      await this.save('offlineChanges', change);
    }
  }

  // Session management
  async saveSession(session: Omit<SessionData, 'id' | 'lastActivity'>): Promise<void> {
    const sessionData: SessionData = {
      ...session,
      id: `session-${session.userId}`,
      lastActivity: new Date()
    };

    await this.save('sessions', sessionData);
  }

  async getLatestSession(userId: string): Promise<SessionData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const sessions = request.result || [];
        if (sessions.length === 0) {
          resolve(null);
          return;
        }

        // Get the most recent session
        const latest = sessions.reduce((prev, curr) => 
          new Date(curr.lastActivity) > new Date(prev.lastActivity) ? curr : prev
        );

        resolve(latest);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Batch operations for syncing
  async batchSave<T>(storeName: string, items: T[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach(item => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Search and filter operations
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Clean up old data
  async cleanOldData(days: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Clean old sessions
    const sessions = await this.getAll<SessionData>('sessions');
    const oldSessions = sessions.filter(s => new Date(s.lastActivity) < cutoffDate);
    
    for (const session of oldSessions) {
      await this.delete('sessions', session.id);
    }

    // Clean synced offline changes older than 7 days
    const changes = await this.getAll<OfflineChange>('offlineChanges');
    const oldChanges = changes.filter(c => 
      c.synced && new Date(c.timestamp) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    for (const change of oldChanges) {
      await this.delete('offlineChanges', change.id);
    }
  }
}

export const indexedDBManager = new IndexedDBManager();
