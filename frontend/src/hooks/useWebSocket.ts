import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketOptions {
  url: string;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

interface WebSocketHook {
  sendMessage: (message: string | object) => void;
  lastMessage: MessageEvent | null;
  readyState: number;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (options: WebSocketOptions): WebSocketHook => {
  const {
    url,
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnect = true,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
  } = options;

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      ws.current = new WebSocket(url);

      ws.current.onopen = (event) => {
        console.log('WebSocket connected');
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        onOpen?.(event);
      };

      ws.current.onmessage = (event) => {
        setLastMessage(event);
        onMessage?.(event);
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        onError?.(event);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected');
        setReadyState(WebSocket.CLOSED);
        onClose?.(event);

        // Reconnect logic
        if (reconnect && reconnectCount.current < reconnectAttempts) {
          reconnectTimer.current = setTimeout(() => {
            reconnectCount.current++;
            console.log(`Attempting to reconnect... (${reconnectCount.current}/${reconnectAttempts})`);
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [url, onOpen, onMessage, onError, onClose, reconnect, reconnectInterval, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const messageToSend = typeof message === 'object' 
        ? JSON.stringify(message) 
        : message;
      ws.current.send(messageToSend);
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    connect,
    disconnect,
  };
};

// WebSocket ready states
export const WS_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

export default useWebSocket;
