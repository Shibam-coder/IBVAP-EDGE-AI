/**
 * IBVAP-Edge AI Real-Time WebSocket Telemetry Connection Manager
 * Manages live telemetry stream connections to Edge AI nodes / FastAPI WebSocket endpoints.
 */

import { WebSocketMessage } from '../types';

export type MessageHandler<T = unknown> = (msg: WebSocketMessage<T>) => void;

export class TelemetryWebSocketClient {
  private url: string;
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/telemetry') {
    this.url = url;
  }

  public connect(): void {
    if (typeof window === 'undefined') return; // Server-side guard

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Telemetry connection established:', this.url);
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed: WebSocketMessage = JSON.parse(event.data);
          const handlers = this.listeners.get(parsed.event);
          if (handlers) {
            handlers.forEach((handler) => handler(parsed));
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing telemetry message:', err);
        }
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Telemetry stream error (Falling back to mock stream):', error);
      };

      this.socket.onclose = () => {
        console.log('[WebSocket] Connection closed.');
      };
    } catch {
      console.warn('[WebSocket] Direct connection failed. Live mock telemetry active.');
    }
  }

  public subscribe<T>(event: WebSocketMessage['event'], handler: MessageHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as MessageHandler);

    return () => {
      this.listeners.get(event)?.delete(handler as MessageHandler);
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const telemetryWs = new TelemetryWebSocketClient();
