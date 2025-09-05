import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../auth/tokenManager';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.setupEventHandlers();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    });

    // User events
    this.socket.on('user:online', (data) => {
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
      this.emit('user:offline', data);
    });

    this.socket.on('user:typing', (data) => {
      this.emit('user:typing', data);
    });

    // Project events
    this.socket.on('project:update', (data) => {
      this.emit('project:update', data);
    });

    this.socket.on('project:delete', (data) => {
      this.emit('project:delete', data);
    });

    // Scene events
    this.socket.on('scene:create', (data) => {
      this.emit('scene:create', data);
    });

    this.socket.on('scene:update', (data) => {
      this.emit('scene:update', data);
    });

    this.socket.on('scene:delete', (data) => {
      this.emit('scene:delete', data);
    });

    this.socket.on('scene:reorder', (data) => {
      this.emit('scene:reorder', data);
    });

    // Comment events
    this.socket.on('comment:create', (data) => {
      this.emit('comment:create', data);
    });

    this.socket.on('comment:update', (data) => {
      this.emit('comment:update', data);
    });

    this.socket.on('comment:delete', (data) => {
      this.emit('comment:delete', data);
    });

    this.socket.on('comment:resolve', (data) => {
      this.emit('comment:resolve', data);
    });
  }

  // Room management
  joinStudio(studioId: string) {
    this.socket?.emit('studio:join', { studioId });
  }

  leaveStudio(studioId: string) {
    this.socket?.emit('studio:leave', { studioId });
  }

  joinProject(projectId: string) {
    this.socket?.emit('project:join', { projectId });
  }

  leaveProject(projectId: string) {
    this.socket?.emit('project:leave', { projectId });
  }

  // Typing indicator
  sendTypingIndicator(projectId: string, sceneId?: string, isTyping: boolean = true) {
    this.socket?.emit('user:typing', { projectId, sceneId, isTyping });
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach((callback) => {
      callback(data);
    });
  }
}

export const wsService = new WebSocketService();
