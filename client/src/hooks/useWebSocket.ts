import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface WebSocketOptions {
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

interface WebSocketState {
  isConnected: boolean;
  lastMessage: any;
  error: Error | null;
}

/**
 * Hook for WebSocket connection with automatic reconnection
 * Supports real-time notifications and updates
 */
export function useWebSocket(
  url: string,
  options: WebSocketOptions = {}
) {
  const {
    reconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setState((prev) => ({ ...prev, isConnected: true, error: null }));
        reconnectCountRef.current = 0;

        // Start heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
        }
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState((prev) => ({ ...prev, lastMessage: data }));
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setState((prev) => ({
          ...prev,
          error: new Error('WebSocket error'),
        }));
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setState((prev) => ({ ...prev, isConnected: false }));

        // Clear heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        // Attempt reconnection
        if (
          reconnect &&
          reconnectCountRef.current < reconnectAttempts
        ) {
          reconnectCountRef.current++;
          console.log(
            `[WebSocket] Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`
          );
          setTimeout(connect, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Connection failed'),
      }));
    }
  }, [url, reconnect, reconnectAttempts, reconnectInterval, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.error('[WebSocket] Cannot send - not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    ...state,
    send,
    disconnect,
    reconnect: connect,
  };
}

/**
 * Hook for handling real-time notifications via WebSocket
 */
export function useNotifications(wsUrl?: string) {
  const url = wsUrl || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

  const { isConnected, lastMessage } = useWebSocket(url);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      const { title, message, variant = 'info' } = lastMessage;

      // Show toast notification
      if (variant === 'success') {
        toast.success(title, { description: message });
      } else if (variant === 'error') {
        toast.error(title, { description: message });
      } else if (variant === 'warning') {
        toast.warning(title, { description: message });
      } else {
        toast.info(title, { description: message });
      }
    }
  }, [lastMessage]);

  return {
    isConnected,
    lastNotification: lastMessage,
  };
}
