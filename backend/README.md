# IBVAP-EDGE-AI — Backend API & AI Integration Pipeline

**Problem Statement ID:** 26187  
**Backend & Integration Lead:** Bunty  
**AI/CV Lead:** Pratyush  
**Target Scope (Internal Hackathon):**
1. Human & Vehicle Detection (YOLOv8 + Fallback Mock Adapter)
2. Spatial Virtual Tripwires & 2D Line Intersection
3. Explainable AI (XAI) Threat Explanation
4. Deterministic Threat Score Calculator (0–100)

---

## 1. Unified Pipeline Architecture

The backend establishes a unified event pipeline connecting CV detection, spatial line-crossing geometry, deterministic threat assessment, and real-time WebSocket distribution:

```
                  [ Video Feed / Mock Scenario ]
                                │
                                ▼
         [ AI Detection Layer (YOLODetector / Mock) ]
                                │
                                ▼
              [ Detection Normalization & Centroids ]
                                │
                                ▼
          [ Spatial Virtual Tripwire Line Intersect ]
                                │
                                ▼
              [ INBOUND / OUTBOUND Classification ]
                                │
                                ▼
            [ Threat Scoring (0-100) & XAI Engine ]
                                │
                                ▼
            [ Canonical Event Models & Schemas ]
                                │
                                ▼
          [ FastAPI Broadcast Hub / WebSocket ]
                    │               │
                    ▼               ▼
          ws://.../ws/telemetry   ws://.../ws/detections
                    │               │
                    └───────┬───────┘
                            ▼
                [ Next.js Tactical UI ]
```

---

## 2. Environment Setup (Windows)

```powershell
# Navigate to workspace root
cd "c:\IBVAP EDGE AI"

# Create virtual environment
python -m venv backend\.venv

# Activate virtual environment
.\backend\.venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r backend\requirements.txt
```

---

## 3. Running FastAPI Server

```powershell
# Start local development server
& ".\backend\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

- REST Base: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`
- AI Status: `http://localhost:8000/api/ai/status`
- WebSocket Telemetry: `ws://localhost:8000/ws/telemetry`
- WebSocket Detections: `ws://localhost:8000/ws/detections`

---

## 4. REST Endpoints Reference

### Health & Diagnostic
- **`GET /health`**: Returns system status and YOLO model load state.
  ```json
  {
    "status": "ok",
    "service": "IBVAP-EDGE-AI",
    "mode": "local",
    "yolo_loaded": false
  }
  ```
- **`GET /api/ai/status`**: Detailed CV detector diagnostics (model name, confidence threshold, status message).

### Canonical Event Pipeline
- **`POST /api/v1/process-frame`**: Ingest video frame or simulation request through full AI → Tripwire → Threat → WebSocket broadcast pipeline.
- **`POST /api/v1/mock/trigger`**: Trigger multi-step simulated intrusion sequence (`human_crossing`, `vehicle_approach`, `default`).
- **`GET /api/v1/detections/latest`**: Latest normalized detection items for UI initial render.
- **`GET /api/v1/threats`**: Active threat alerts with XAI breakdown.
- **`GET /api/v1/telemetry`**: Node telemetry metrics and FPS.

### Modular AI Direct Endpoints
- **`POST /api/detection/process`**: Direct detection execution.
- **`POST /api/tripwire/evaluate`**: Direct line crossing evaluation.
- **`POST /api/threat/calculate`**: Direct threat calculation with XAI factors.

---

## 5. WebSocket Contracts

Connected clients receive both canonical envelopes and frontend-native message contracts:

### Canonical Envelope:
```json
{
  "type": "detection" | "tripwire" | "threat",
  "timestamp": "2026-08-30T12:00:00Z",
  "data": { ... }
}
```

### Frontend Contract:
```json
{
  "event": "DETECTION_FRAME" | "TRIPWIRE_EVENT" | "THREAT_ALERT" | "HEARTBEAT",
  "payload": { ... },
  "timestamp": "2026-08-30T12:00:00Z"
}
```

---

## 6. Automated Testing

Run the full pytest suite:

```powershell
& ".\backend\.venv\Scripts\python.exe" -m pytest backend/tests -v
```

36 tests covering:
- Human & Vehicle detection to canonical `DetectionEvent`
- Line intersection geometry and `INBOUND`/`OUTBOUND` classification
- Deterministic 0–100 threat scoring formulation and XAI rationale output
- End-to-end event pipeline orchestration
- WebSocket live broadcasts
- CORS preflight and allowed origins
- System health and diagnostic APIs
