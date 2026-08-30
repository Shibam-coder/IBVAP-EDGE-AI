"""
Event Processing Pipeline Service for IBVAP-EDGE-AI.
Orchestrates:
Video/Frame -> AI Detection -> Tripwire Crossings -> Threat/XAI -> WebSocket Broadcast
"""

import asyncio
import logging
import time
import uuid
from typing import Dict, List, Optional
from ..ai.mock_detections import (
    generate_mock_detection_sequence,
    get_default_mock_tripwires,
)
from ..ai.tripwire import evaluate_tripwire_crossing
from ..app.schemas import (
    DetectionItem,
    EventEnvelope,
    FrontendWebSocketMessage,
    ProcessFrameRequest,
    ProcessFrameResponseData,
    ThreatAlert,
    TripwireEvent,
    get_current_utc_timestamp,
)
from ..app.websocket_manager import ws_manager

logger = logging.getLogger("backend.event_service")


class EventProcessingService:
    """Core orchestration service bridging AI inference, tripwire spatial math, and live WebSockets."""

    def __init__(self) -> None:
        # In-memory track history for temporal velocity and tripwire line crossing: track_id -> [prev_centroid]
        self._track_history: Dict[str, dict] = {}

    async def broadcast_pipeline_events(
        self,
        detections: List[DetectionItem],
        tripwire_events: List[TripwireEvent],
        threat_alerts: List[ThreatAlert]
    ) -> None:
        """
        Broadcasts events to all connected WebSocket clients in both canonical envelope and frontend message format.
        """
        ts = get_current_utc_timestamp()

        # 1. Broadcast Detections
        if detections:
            # Canonical envelope
            await ws_manager.broadcast_envelope(
                EventEnvelope(type="detection", timestamp=ts, data=[d.model_dump() for d in detections])
            )
            # Frontend contract message
            await ws_manager.broadcast_envelope(
                FrontendWebSocketMessage(
                    event="DETECTION_FRAME",
                    payload={"detections": [d.model_dump() for d in detections]},
                    timestamp=ts
                )
            )

        # 2. Broadcast Tripwire Breaches
        for tw_event in tripwire_events:
            await ws_manager.broadcast_envelope(
                EventEnvelope(type="tripwire", timestamp=ts, data=tw_event.model_dump())
            )
            await ws_manager.broadcast_envelope(
                FrontendWebSocketMessage(
                    event="TRIPWIRE_EVENT",
                    payload=tw_event.model_dump(),
                    timestamp=ts
                )
            )

        # 3. Broadcast Threat Alerts
        for alert in threat_alerts:
            await ws_manager.broadcast_envelope(
                EventEnvelope(type="threat", timestamp=ts, data=alert.model_dump())
            )
            await ws_manager.broadcast_envelope(
                FrontendWebSocketMessage(
                    event="THREAT_ALERT",
                    payload=alert.model_dump(),
                    timestamp=ts
                )
            )

    async def process_frame(self, request: ProcessFrameRequest) -> ProcessFrameResponseData:
        """
        Processes an incoming video frame or detection payload through the complete pipeline.
        """
        start_time = time.perf_counter()
        frame_id = request.frame_id or f"FRM-{uuid.uuid4().hex[:8].upper()}"
        cam_id = request.camera_id or "CAM-01"

        # Mock / Pluggable AI Detection Generation
        detections, tripwire_breaches, threat_alerts = generate_mock_detection_sequence()

        # Check tripwires if provided in request
        tripwires = request.tripwires or get_default_mock_tripwires(cam_id)
        for det in detections:
            if det.centroid:
                # Retrieve previous centroid if tracked
                prev_centroid = self._track_history.get(det.id, {}).get("centroid")
                for tw in tripwires:
                    tw_event = evaluate_tripwire_crossing(
                        object_id=det.trackId or det.id,
                        p_prev=prev_centroid,
                        p_curr=det.centroid,
                        tripwire=tw,
                        category=det.category
                    )
                    if tw_event:
                        tripwire_breaches.append(tw_event)

                # Update history
                self._track_history[det.id] = {
                    "centroid": det.centroid,
                    "timestamp": time.time()
                }

        # Broadcast live events across all connected WebSocket clients
        await self.broadcast_pipeline_events(detections, tripwire_breaches, threat_alerts)

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        fps = round(1000.0 / max(elapsed_ms, 1.0), 1)

        return ProcessFrameResponseData(
            camera_id=cam_id,
            frame_id=frame_id,
            detections=detections,
            tripwire_breaches=tripwire_breaches,
            threat_alerts=threat_alerts,
            inference_time_ms=elapsed_ms,
            fps=fps
        )

    async def trigger_mock_sequence(self, camera_id: str = "CAM-01") -> Dict[str, any]:
        """
        Triggers an end-to-end simulated tactical scenario for WebSocket testing:
        Human Detected -> Tripwire Crossed -> Threat Alert Generated
        """
        detections, breaches, threats = generate_mock_detection_sequence()
        await self.broadcast_pipeline_events(detections, breaches, threats)

        return {
            "camera_id": camera_id,
            "status": "broadcast_complete",
            "detections_count": len(detections),
            "tripwire_breaches_count": len(breaches),
            "threat_alerts_count": len(threats),
            "timestamp": get_current_utc_timestamp()
        }


event_service = EventProcessingService()
