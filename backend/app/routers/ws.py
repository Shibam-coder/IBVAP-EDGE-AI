"""
WebSocket Endpoints for Real-Time Telemetry and Detection Event Streaming.
Endpoints:
- ws://localhost:8000/ws/telemetry (Frontend telemetry stream)
- ws://localhost:8000/ws/detections (Detection event stream)
"""

import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..schemas import FrontendWebSocketMessage, get_current_utc_timestamp
from ..websocket_manager import ws_manager

logger = logging.getLogger("backend.ws")
router = APIRouter(tags=["WebSockets"])


async def handle_websocket_connection(websocket: WebSocket, stream_name: str) -> None:
    """Generic WebSocket connection handler for event streaming and heartbeat ping/pong."""
    await ws_manager.connect(websocket)
    ts = get_current_utc_timestamp()

    # Send initial connection acknowledgment handshake
    try:
        await ws_manager.send_personal_message(
            FrontendWebSocketMessage(
                event="HEARTBEAT",
                payload={"status": "connected", "stream": stream_name, "service": "IBVAP-EDGE-AI"},
                timestamp=ts
            ).model_dump(),
            websocket
        )
    except Exception as exc:
        logger.warning(f"Error during WebSocket handshake on {stream_name}: {exc}")
        ws_manager.disconnect(websocket)
        return

    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming client messages (e.g. ping/pong, client telemetry queries)
            try:
                msg = json.loads(data)
                if isinstance(msg, dict) and msg.get("type") == "ping":
                    await ws_manager.send_personal_message(
                        {"type": "pong", "timestamp": get_current_utc_timestamp()},
                        websocket
                    )
            except json.JSONDecodeError:
                # Treat as raw keepalive text
                if data.strip().lower() == "ping":
                    await ws_manager.send_personal_message("pong", websocket)

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info(f"WebSocket client on {stream_name} cleanly disconnected.")
    except Exception as exc:
        ws_manager.disconnect(websocket)
        logger.error(f"WebSocket error on {stream_name}: {exc}")


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket) -> None:
    """
    Primary Telemetry & Alert WebSocket Endpoint.
    Broadcasts DETECTION_FRAME, TRIPWIRE_EVENT, THREAT_ALERT, and TELEMETRY_UPDATE.
    """
    await handle_websocket_connection(websocket, stream_name="telemetry")


@router.websocket("/ws/detections")
async def websocket_detections_endpoint(websocket: WebSocket) -> None:
    """
    Dedicated Real-Time Detection Events Stream.
    Broadcasts normalized detection items in frontend-compatible schema.
    """
    await handle_websocket_connection(websocket, stream_name="detections")
