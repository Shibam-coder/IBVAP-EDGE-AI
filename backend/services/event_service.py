"""
Event Processing Pipeline Service for IBVAP-EDGE-AI.
Orchestrates:
Video/Frame (or Mock) -> AI Detection -> Tripwire Crossings -> Threat/XAI -> Canonical Schemas -> WebSocket Broadcast
"""

import asyncio
import logging
import time
import uuid
from typing import Dict, List, Optional, Tuple

from ..ai.detection import to_detection_event
from ..ai.mock_detections import get_default_mock_tripwires
from ..ai.threat_service import ThreatAnalysisInput, to_threat_models
from ..app.schemas import (
    DetectionEvent,
    DetectionItem,
    EventEnvelope,
    FrontendWebSocketMessage,
    ProcessFrameRequest,
    ProcessFrameResponseData,
    ThreatAlert,
    ThreatEvent,
    TripwireEvent,
    get_current_utc_timestamp,
)
from ..app.websocket_manager import ws_manager
from .detection_service import detection_service
from .tripwire_service import tripwire_service

logger = logging.getLogger("backend.event_service")


class EventProcessingService:
    """Core orchestration service bridging AI inference, tripwire spatial math, and live WebSockets."""

    def __init__(self) -> None:
        self.default_camera_id = "CAM-01"
        self._initialize_default_tripwires()

    def _initialize_default_tripwires(self) -> None:
        """Register default perimeter boundaries on CAM-01."""
        tripwires = get_default_mock_tripwires(self.default_camera_id)
        for tw in tripwires:
            tripwire_service.register_tripwire(
                camera_id=tw.cameraId,
                tripwire_id=tw.id,
                name=tw.name,
                points=tw.points,
                direction=tw.direction,
                severity=tw.severity,
                is_active=tw.isActive,
            )

    async def broadcast_pipeline_events(
        self,
        detection_items: List[DetectionItem],
        canonical_detections: List[DetectionEvent],
        tripwire_events: List[TripwireEvent],
        threat_events: List[ThreatEvent],
        threat_alerts: List[ThreatAlert],
        camera_id: str = "CAM-01",
    ) -> None:
        """
        Broadcasts events to all connected WebSocket clients in both canonical envelope and frontend message format.
        """
        ts = get_current_utc_timestamp()

        # 1. Broadcast Detections
        if detection_items:
            # Canonical Envelope
            await ws_manager.broadcast_envelope(
                EventEnvelope(
                    type="detection",
                    timestamp=ts,
                    data=[d.model_dump() for d in canonical_detections]
                )
            )
            # Frontend WebSocket Contract
            await ws_manager.broadcast_envelope(
                FrontendWebSocketMessage(
                    event="DETECTION_FRAME",
                    payload={
                        "cameraId": camera_id,
                        "camera_id": camera_id,
                        "detections": [d.model_dump() for d in detection_items],
                    },
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
        for i, alert in enumerate(threat_alerts):
            thr_evt = threat_events[i] if i < len(threat_events) else None
            if thr_evt:
                await ws_manager.broadcast_envelope(
                    EventEnvelope(type="threat", timestamp=ts, data=thr_evt.model_dump())
                )
            await ws_manager.broadcast_envelope(
                FrontendWebSocketMessage(
                    event="THREAT_ALERT",
                    payload=alert.model_dump(),
                    timestamp=ts
                )
            )

    async def process_frame(
        self,
        request: ProcessFrameRequest,
        broadcast: bool = True
    ) -> ProcessFrameResponseData:
        """
        Processes an incoming video frame or simulation request through the complete pipeline:
        Detection -> Tripwire Crossings -> Threat Evaluation & XAI -> Canonical Broadcast
        """
        start_time = time.perf_counter()
        cam_id = request.camera_id or self.default_camera_id
        frame_id = request.frame_id or f"FRM-{uuid.uuid4().hex[:8].upper()}"

        # Register custom tripwires if provided in the request
        if request.tripwires:
            for tw in request.tripwires:
                tripwire_service.register_tripwire(
                    camera_id=cam_id,
                    tripwire_id=tw.id,
                    name=tw.name,
                    points=tw.points,
                    direction=tw.direction,
                    severity=tw.severity,
                    is_active=tw.isActive,
                )

        # 1. Obtain Detections (Scenario or Frame Inference)
        if request.scenario:
            detection_items = detection_service.process_scenario(
                scenario_name=request.scenario,
                step=request.step or 0,
                camera_id=cam_id,
            )
        else:
            detection_items = detection_service.process_frame(
                frame=request.frame_base64,
                camera_id=cam_id,
            )

        # 2. Normalize to Canonical DetectionEvents
        canonical_detections = [to_detection_event(d) for d in detection_items]

        # 3. Evaluate Tripwire Intersections & INBOUND/OUTBOUND direction
        tripwire_events = tripwire_service.evaluate_detections(
            camera_id=cam_id,
            detections=detection_items,
        )

        # 4. Evaluate Threat Scoring & XAI Explanations for each active detection / breach
        threat_events: List[ThreatEvent] = []
        threat_alerts: List[ThreatAlert] = []

        breach_map: Dict[str, TripwireEvent] = {
            str(b.object_id): b for b in tripwire_events if b.crossed
        }

        for det in detection_items:
            obj_id = str(det.trackId or det.id)
            breach = breach_map.get(obj_id)
            is_breached = breach is not None
            crossing_dir = breach.crossing_direction if breach else None
            speed_val = det.speedMps or (det.speedKmH / 3.6 if det.speedKmH else (det.speed or 0.0))

            analysis_input = ThreatAnalysisInput(
                objectType=det.category,
                confidence=det.confidence,
                tripwireBreached=is_breached,
                crossingDirection=crossing_dir,
                speedMps=round(speed_val, 2),
                speedKmH=det.speedKmH,
                isRestrictedZone=is_breached or det.isHostile or False,
                posture=det.posture,
                zoneName="Sector-04 Perimeter Alpha",
                tripwireName=breach.tripwire_id if breach else "Outer Perimeter Line Alpha",
                cameraId=cam_id,
                objectId=obj_id,
                isBlacklisted=det.isBlacklisted or False,
            )

            thr_evt, thr_alert = to_threat_models(analysis_input)
            threat_events.append(thr_evt)
            threat_alerts.append(thr_alert)

        # 5. Broadcast all events across active WebSockets if enabled
        if broadcast:
            await self.broadcast_pipeline_events(
                detection_items=detection_items,
                canonical_detections=canonical_detections,
                tripwire_events=tripwire_events,
                threat_events=threat_events,
                threat_alerts=threat_alerts,
                camera_id=cam_id,
            )

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        fps = round(1000.0 / max(elapsed_ms, 1.0), 1)

        return ProcessFrameResponseData(
            camera_id=cam_id,
            frame_id=frame_id,
            detections=detection_items,
            tripwire_breaches=tripwire_events,
            threat_alerts=threat_alerts,
            inference_time_ms=elapsed_ms,
            fps=fps
        )

    async def trigger_mock_sequence(
        self,
        scenario: str = "human_crossing",
        step: int = 1,
        camera_id: str = "CAM-01"
    ) -> Dict[str, Any]:
        """
        Triggers an end-to-end deterministic simulated scenario:
        Detections -> Movement -> Tripwire Crossing (INBOUND) -> Threat Calculation -> XAI Explanation -> WebSocket Broadcast
        """
        # Ensure default tripwire line at x=0.5 exists
        tripwire_service.register_tripwire(
            camera_id=camera_id,
            tripwire_id="TW-ALPHA-01",
            name="Alpha Perimeter Virtual Fence",
            points=[{"x": 0.5, "y": 1.0}, {"x": 0.5, "y": 0.0}],
            direction="INBOUND",
            severity="CRITICAL",
            is_active=True
        )

        # If step > 0, prime tracker state without broadcasting
        if step > 0:
            req_prime = ProcessFrameRequest(
                camera_id=camera_id,
                scenario=scenario,
                step=0
            )
            await self.process_frame(req_prime, broadcast=False)

        # Execute requested step with live broadcast
        req = ProcessFrameRequest(
            camera_id=camera_id,
            scenario=scenario,
            step=step
        )
        res = await self.process_frame(req, broadcast=True)

        return {
            "camera_id": camera_id,
            "scenario": scenario,
            "step": step,
            "status": "broadcast_complete",
            "detections_count": len(res.detections),
            "tripwire_breaches_count": len(res.tripwire_breaches),
            "threat_alerts_count": len(res.threat_alerts),
            "threat_score": res.threat_alerts[0].riskScore if res.threat_alerts else None,
            "xai_reasons": res.threat_alerts[0].aiExplanation.reasons if res.threat_alerts else [],
            "timestamp": get_current_utc_timestamp()
        }

    async def process_video_file(
        self,
        video_path: str,
        camera_id: str = "CAM-01",
        max_frames: int = 30,
        frame_interval: int = 5,
        broadcast: bool = True,
        delay_between_frames: float = 0.05,
    ) -> Dict[str, Any]:
        """
        Process a local or uploaded video file frame-by-frame through the full pipeline:
        Video Frame Extraction -> AI Detection -> Tripwire Crossings -> Threat Evaluation & XAI -> WebSocket Broadcast
        """
        import os
        import cv2

        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Unable to open video stream at: {video_path}")

        # Ensure default tripwire line exists on camera
        tripwire_service.register_tripwire(
            camera_id=camera_id,
            tripwire_id="TW-ALPHA-01",
            name="Alpha Perimeter Virtual Fence",
            points=[{"x": 0.5, "y": 1.0}, {"x": 0.5, "y": 0.0}],
            direction="INBOUND",
            severity="CRITICAL",
            is_active=True,
        )

        total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        fps_video = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1280)
        frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 720)

        processed_frames_data: List[ProcessFrameResponseData] = []
        frame_idx = 0
        extracted_count = 0

        try:
            while cap.isOpened() and extracted_count < max_frames:
                ret, frame_bgr = cap.read()
                if not ret or frame_bgr is None:
                    break

                if frame_idx % frame_interval == 0:
                    extracted_count += 1
                    frame_id = f"FRM-{camera_id}-{extracted_count:04d}"

                    # 1. Detection inference on extracted frame
                    detection_items = detection_service.process_frame(
                        frame=frame_bgr,
                        camera_id=camera_id,
                        frame_width=frame_w,
                        frame_height=frame_h,
                        frame_index=extracted_count,
                    )

                    # 2. Canonical DetectionEvents
                    canonical_detections = [to_detection_event(d) for d in detection_items]

                    # 3. Tripwire line crossing evaluations
                    tripwire_events = tripwire_service.evaluate_detections(
                        camera_id=camera_id,
                        detections=detection_items,
                    )

                    # 4. Threat assessment & XAI
                    threat_events: List[ThreatEvent] = []
                    threat_alerts: List[ThreatAlert] = []

                    breach_map: Dict[str, TripwireEvent] = {
                        str(b.object_id): b for b in tripwire_events if b.crossed
                    }

                    for det in detection_items:
                        obj_id = str(det.trackId or det.id)
                        breach = breach_map.get(obj_id)
                        is_breached = breach is not None
                        crossing_dir = breach.crossing_direction if breach else None
                        speed_val = det.speedMps or (det.speedKmH / 3.6 if det.speedKmH else (det.speed or 0.0))

                        analysis_input = ThreatAnalysisInput(
                            objectType=det.category,
                            confidence=det.confidence,
                            tripwireBreached=is_breached,
                            crossingDirection=crossing_dir,
                            speedMps=round(speed_val, 2),
                            speedKmH=det.speedKmH,
                            isRestrictedZone=is_breached or det.isHostile or False,
                            posture=det.posture,
                            zoneName="Sector-04 Perimeter Alpha",
                            tripwireName=breach.tripwire_id if breach else "Outer Perimeter Line Alpha",
                            cameraId=camera_id,
                            objectId=obj_id,
                            isBlacklisted=det.isBlacklisted or False,
                        )

                        thr_evt, thr_alert = to_threat_models(analysis_input)
                        threat_events.append(thr_evt)
                        threat_alerts.append(thr_alert)

                    # 5. Broadcast to active WebSockets
                    if broadcast:
                        await self.broadcast_pipeline_events(
                            detection_items=detection_items,
                            canonical_detections=canonical_detections,
                            tripwire_events=tripwire_events,
                            threat_events=threat_events,
                            threat_alerts=threat_alerts,
                            camera_id=camera_id,
                        )
                        if delay_between_frames > 0:
                            await asyncio.sleep(delay_between_frames)

                    frame_res = ProcessFrameResponseData(
                        camera_id=camera_id,
                        frame_id=frame_id,
                        detections=detection_items,
                        tripwire_breaches=tripwire_events,
                        threat_alerts=threat_alerts,
                        inference_time_ms=12.5,
                        fps=round(fps_video, 1),
                    )
                    processed_frames_data.append(frame_res)

                frame_idx += 1
        finally:
            cap.release()

        total_breaches = sum(len(f.tripwire_breaches) for f in processed_frames_data)
        total_threats = sum(len(f.threat_alerts) for f in processed_frames_data)
        latest_threat = processed_frames_data[-1].threat_alerts[0] if (processed_frames_data and processed_frames_data[-1].threat_alerts) else None

        return {
            "camera_id": camera_id,
            "video_path": video_path,
            "total_video_frames": total_video_frames,
            "frames_extracted": len(processed_frames_data),
            "total_detections": sum(len(f.detections) for f in processed_frames_data),
            "tripwire_breaches_count": total_breaches,
            "threat_alerts_count": total_threats,
            "latest_threat_score": latest_threat.riskScore if latest_threat else None,
            "xai_reasons": latest_threat.aiExplanation.reasons if latest_threat else [],
            "status": "video_processing_complete",
            "timestamp": get_current_utc_timestamp(),
        }


event_service = EventProcessingService()
