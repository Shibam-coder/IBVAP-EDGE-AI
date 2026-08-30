"""
Thread-safe WebSocket Connection Manager for real-time telemetry and detection broadcasting.
"""

import json
import logging
from typing import Any, Dict, List, Set, Union
from fastapi import WebSocket, WebSocketDisconnect
from .schemas import EventEnvelope, FrontendWebSocketMessage

logger = logging.getLogger("backend.websocket_manager")


class ConnectionManager:
    """Manages active WebSocket connections across telemetry and detection streams."""

    def __init__(self) -> None:
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        """Accept incoming WebSocket connection and register client."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        """Unregister disconnected client."""
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: Union[Dict[str, Any], str], websocket: WebSocket) -> None:
        """Send message to a specific client."""
        if isinstance(message, str):
            await websocket.send_text(message)
        else:
            await websocket.send_text(json.dumps(message))

    async def broadcast_json(self, data: Union[Dict[str, Any], list, str]) -> None:
        """Broadcast payload to all connected WebSocket clients."""
        if not self.active_connections:
            return

        text = data if isinstance(data, str) else json.dumps(data)
        disconnected: List[WebSocket] = []

        for connection in list(self.active_connections):
            try:
                await connection.send_text(text)
            except (WebSocketDisconnect, RuntimeError, Exception) as exc:
                logger.warning(f"Failed to send to client ({exc}), marking for cleanup")
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_envelope(self, envelope: Union[EventEnvelope, FrontendWebSocketMessage, Dict[str, Any]]) -> None:
        """
        Broadcast structured envelope. If Pydantic model, serialized to dict first.
        """
        if isinstance(envelope, (EventEnvelope, FrontendWebSocketMessage)):
            payload = envelope.model_dump()
        else:
            payload = envelope
        await self.broadcast_json(payload)

    @property
    def client_count(self) -> int:
        """Current number of active subscribers."""
        return len(self.active_connections)


# Global singleton instance
ws_manager = ConnectionManager()
