'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { wsService } from '@/utils/websocket/websocketService';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  joinStudio: (studioId: string) => void;
  leaveStudio: (studioId: string) => void;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  sendTypingIndicator: (projectId: string, sceneId?: string, isTyping?: boolean) => void;
  onlineUsers: Set<string>;
  typingUsers: Map<string, { sceneId?: string; timestamp: number }>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, { sceneId?: string; timestamp: number }>>(new Map());

  useEffect(() => {
    if (isAuthenticated) {
      wsService.connect();
    } else {
      wsService.disconnect();
    }

    // Connection status handlers
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    // User status handlers
    const handleUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleUserTyping = ({ 
      userId, 
      sceneId, 
      isTyping 
    }: { 
      userId: string; 
      sceneId?: string; 
      isTyping: boolean 
    }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        
        if (isTyping) {
          newMap.set(userId, { sceneId, timestamp: Date.now() });
        } else {
          newMap.delete(userId);
        }
        
        return newMap;
      });
    };

    // Register event listeners
    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('user:online', handleUserOnline);
    wsService.on('user:offline', handleUserOffline);
    wsService.on('user:typing', handleUserTyping);

    // Cleanup
    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('user:online', handleUserOnline);
      wsService.off('user:offline', handleUserOffline);
      wsService.off('user:typing', handleUserTyping);
    };
  }, [isAuthenticated]);

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const newMap = new Map();
        const now = Date.now();
        
        prev.forEach((value, key) => {
          // Remove typing indicators older than 3 seconds
          if (now - value.timestamp < 3000) {
            newMap.set(key, value);
          }
        });
        
        return newMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    joinStudio: wsService.joinStudio.bind(wsService),
    leaveStudio: wsService.leaveStudio.bind(wsService),
    joinProject: wsService.joinProject.bind(wsService),
    leaveProject: wsService.leaveProject.bind(wsService),
    sendTypingIndicator: wsService.sendTypingIndicator.bind(wsService),
    onlineUsers,
    typingUsers,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
