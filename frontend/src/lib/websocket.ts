/**
 * IBVAP-Edge AI Real-Time WebSocket Telemetry Connection Manager
 * Manages live telemetry stream connections to Edge AI nodes / FastAPI WebSocket endpoints.
 */

import { WebSocketMessage, WebSocketEventType } from '../types';

export type MessageHandler<T = unknown> = (msg: WebSocketMessage<T>) => void;
export type ConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'OFFLINE' | 'ERROR';
export type StatusHandler = (status: ConnectionStatus) => void;

export class TelemetryWebSocketClient {
  private url: string;
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private statusListeners: Set<StatusHandler> = new Set();
  private status: ConnectionStatus = 'OFFLINE';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/telemetry') {
    this.url = url;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public onStatusChange(handler: StatusHandler): () => void {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((h) => h(newStatus));
  }

  public connect(): void {
    if (typeof window === 'undefined') return; // Server-side guard
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('CONNECTING');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('OPEN');
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

      this.socket.onerror = () => {
        this.setStatus('ERROR');
      };

      this.socket.onclose = () => {
        this.setStatus('CLOSED');
        this.scheduleReconnect();
      };
    } catch {
      this.setStatus('OFFLINE');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('OFFLINE');
      return;
    }

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(10000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public subscribe<T>(event: WebSocketEventType, handler: MessageHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as MessageHandler);

    return () => {
      this.listeners.get(event)?.delete(handler as MessageHandler);
    };
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('OFFLINE');
  }
}

export const telemetryWs = new TelemetryWebSocketClient();

