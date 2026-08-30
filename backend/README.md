# IBVAP-EDGE-AI — Backend API & Integration Layer

**Problem Statement ID:** 26187  
**Lead:** Bunty (Backend / API Integration Lead)  
**Target Scope (Internal Hackathon):**
1. Human & Vehicle Detection support
2. Line Intersection / Spatial Tripwires
3. XAI Threat Explanation
4. Threat Score Calculator

---

## 1. Architecture Overview

The backend acts as the bridge connecting video streams, AI inference engines (human/vehicle detection, kinematic tracking, spatial tripwire analysis, XAI threat calculation), and the tactical Next.js frontend UI via REST and WebSockets.

```
       [ Video Feed / Camera Ingestion ]
                      │
                      ▼
     [ AI CV Detection Engine (YOLO Stub) ]
                      │
                      ▼
      [ Normalized DetectionItem & Centroids ]
                      │
                      ▼
    [ Spatial Tripwire Intersection Service ]
                      │
                      ▼
     [ XAI Situational Threat Scoring Engine ]
                      │
                      ▼
       [ FastAPI Broadcast & WebSocket Hub ]
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
    ws://.../ws/telemetry    ws://.../ws/detections
            │                   │
            └─────────┬─────────┘
                      ▼
           [ Next.js Tactical UI ]
```

---

## 2. Prerequisites & Environment Setup

### Requirements
- Python 3.10+ (Tested with Python 3.14 on Windows)
- pip package manager

### Virtual Environment Setup (Windows)

```powershell
# Navigate to workspace
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

## 3. Running the FastAPI Server

### Local Development Server

```powershell
# From the workspace root:
& ".\backend\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

- API Base URL: `http://localhost:8000`
- Swagger Interactive Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`
- WebSocket Telemetry: `ws://localhost:8000/ws/telemetry`
- WebSocket Detections: `ws://localhost:8000/ws/detections`

---

## 4. Configuration Environment Variables

Configured via environment variables or `.env` file:

| Variable | Default | Description |
|---|---|---|
| `BACKEND_HOST` | `0.0.0.0` | Host interface to bind server |
| `BACKEND_PORT` | `8000` | Port for FastAPI service |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed Next.js CORS origin |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated CORS origins |
| `SERVICE_NAME` | `IBVAP-EDGE-AI` | Service name in health checks |
| `MODE` | `local` | Execution mode (`local` / `edge`) |

---

## 5. REST Endpoints Reference

### `GET /health`
Returns system status.
```json
{
  "status": "ok",
  "service": "IBVAP-EDGE-AI",
  "mode": "local"
}
```

### `POST /api/v1/process-frame`
Processes a frame or video detection payload through the inference, tripwire, and XAI pipeline.
```json
{
  "camera_id": "CAM-01",
  "tripwires": [
    {
      "id": "TW-01",
      "cameraId": "CAM-01",
      "name": "Perimeter Line Alpha",
      "points": [{"x": 0.1, "y": 0.5}, {"x": 0.9, "y": 0.5}],
      "direction": "INBOUND",
      "isActive": true,
      "severity": "CRITICAL"
    }
  ]
}
```

### `POST /api/v1/mock/trigger`
Simulates an end-to-end event sequence (`detection` → `tripwire breach` → `threat alert`) and broadcasts across all active WebSocket subscribers.

### `GET /api/v1/threats`
Returns active situational threat alerts with XAI breakdown.

### `GET /api/v1/telemetry`
Returns edge node resource usage, inference FPS, and status.

---

## 6. WebSocket Endpoints & Contracts

### 1. `ws://localhost:8000/ws/telemetry`
Primary real-time event stream. Clients receive canonical envelopes and frontend message contracts:

#### Canonical Envelope (Step 5):
```json
{
  "type": "detection" | "tripwire" | "threat",
  "timestamp": "2026-08-30T12:00:00Z",
  "data": { ... }
}
```

#### Frontend Native Message:
```json
{
  "event": "DETECTION_FRAME" | "TRIPWIRE_EVENT" | "THREAT_ALERT" | "HEARTBEAT",
  "payload": { ... },
  "timestamp": "2026-08-30T12:00:00Z"
}
```

### 2. `ws://localhost:8000/ws/detections`
Dedicated high-frequency stream for bounding boxes and centroids.

---

## 7. Running Automated Tests

Run the full pytest suite:

```powershell
& ".\backend\.venv\Scripts\python.exe" -m pytest backend/tests -v
```

Test coverage includes:
- System `/health` and root endpoints
- Canonical Pydantic schema validation & serialization
- Frame processing REST endpoints & invalid payload handling
- Real-time WebSocket connection handshakes, ping/pong, and broadcasts
- CORS preflight and origin verification
- Geometric line intersection and kinematic math
