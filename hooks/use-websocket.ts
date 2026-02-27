'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePriceStore } from '@/stores/price-store';
import {
  TWELVE_DATA_WS_URL,
  GOLD_SYMBOL,
  SILVER_SYMBOL,
  WS_RECONNECT_DELAY,
  WS_MAX_RECONNECT_ATTEMPTS,
  WS_HEARTBEAT_INTERVAL,
} from '@/lib/constants';
import type { WebSocketMessage, WebSocketSubscription } from '@/lib/types';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateGold = usePriceStore((s) => s.updateGold);
  const updateSilver = usePriceStore((s) => s.updateSilver);
  const setConnected = usePriceStore((s) => s.setConnected);

  const cleanup = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
    if (!apiKey) {
      console.warn('Missing NEXT_PUBLIC_TWELVE_DATA_API_KEY — WebSocket disabled');
      return;
    }

    cleanup();

    const ws = new WebSocket(`${TWELVE_DATA_WS_URL}?apikey=${apiKey}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setConnected(true);

      // Subscribe to gold and silver
      const subscription: WebSocketSubscription = {
        action: 'subscribe',
        params: {
          symbols: `${GOLD_SYMBOL},${SILVER_SYMBOL}`,
        },
      };
      ws.send(JSON.stringify(subscription));

      // Start heartbeat
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'heartbeat' }));
        }
      }, WS_HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data);

        if (msg.event === 'price' && msg.symbol && msg.price != null) {
          const update = {
            price: msg.price,
            timestamp: msg.timestamp ? msg.timestamp * 1000 : Date.now(),
          };

          if (msg.symbol === GOLD_SYMBOL) {
            updateGold(update);
          } else if (msg.symbol === SILVER_SYMBOL) {
            updateSilver(update);
          }
        }
      } catch {
        // Ignore parse errors for non-JSON messages (heartbeat acks, etc.)
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // Auto-reconnect with exponential backoff
      if (reconnectAttemptsRef.current < WS_MAX_RECONNECT_ATTEMPTS) {
        const delay = WS_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror, triggering reconnect
    };
  }, [cleanup, updateGold, updateSilver, setConnected]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return {
    connected: usePriceStore((s) => s.connected),
  };
}
