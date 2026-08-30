# IBVAP-EDGE-AI Backend Service

**Role**: AI / Computer Vision Processing Layer & API Engine  
**Lead**: Pratyush (AI/CV Backend Lead)  
**Hackathon Scope**:
1. Human and Vehicle Object Detection & Coordinate Normalization
2. Spatial Line Intersection & Virtual Tripwire Breach Detection
3. Threat Scoring & Explainable AI (XAI) Causal Breakdown
4. Deterministic Mock/Inference Adapters for Camera-Free Testing

---

## 🚀 Quick Start (Windows)

### 1. Initialize & Activate Virtual Environment
```powershell
# In repository root (c:\Users\dell\IBVAP-EDGE-AI)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Run FastAPI Backend Server
```powershell
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: `http://localhost:8000/docs`  
Health check endpoint: `http://localhost:8000/health`

---

## 🧪 Running Unit & Integration Tests

Run the complete test suite with verbose output:
```powershell
.\.venv\Scripts\python.exe -m unittest discover -s backend/app/tests -v
```
Or with `pytest`:
```powershell
.\.venv\Scripts\pytest.exe backend/app/tests -v
```

---

## 📡 API Endpoints

### 1. `GET /health`
Verifies backend operational status.
```json
{
  "status": "ok",
  "service": "IBVAP-EDGE-AI",
  "timestamp": "2026-08-30T06:30:00.000Z",
  "yolo_loaded": false
}
```

### 2. `GET /api/ai/status`
Returns the status of the YOLOv8 detector and hardware capabilities.

### 3. `POST /api/detection/process`
Processes an incoming frame or deterministic test scenario (`human_crossing`, `vehicle_approach`, `default`).
**Request Body**:
```json
{
  "camera_id": "CAM-01",
  "scenario": "human_crossing",
  "step": 1
}
```
**Response**:
```json
{
  "success": true,
  "camera_id": "CAM-01",
  "timestamp": "2026-08-30T06:30:00.000Z",
  "count": 1,
  "detections": [
    {
      "id": "HUMAN-TRK-101",
      "object_id": "HUMAN-TRK-101",
      "object_type": "human",
      "category": "HUMAN",
      "confidence": 0.96,
      "bbox": { "x": 0.48, "y": 0.40, "width": 0.08, "height": 0.20 },
      "centroid": { "x": 0.52, "y": 0.50 },
      "speedKmH": 6.5,
      "posture": "RUNNING"
    }
  ]
}
```

### 4. `POST /api/tripwire/evaluate`
Calculates mathematical line intersection and crossing direction (`INBOUND` / `OUTBOUND`).
**Request Body**:
```json
{
  "camera_id": "CAM-01",
  "tripwire_id": "TW-ALPHA",
  "start_point": { "x": 0.5, "y": 0.0 },
  "end_point": { "x": 0.5, "y": 1.0 },
  "previous_centroid": { "x": 0.4, "y": 0.5 },
  "current_centroid": { "x": 0.6, "y": 0.5 },
  "direction": "BIDIRECTIONAL",
  "object_id": "TRK-001"
}
```
**Response**:
```json
{
  "success": true,
  "result": {
    "crossed": true,
    "crossing_direction": "INBOUND",
    "tripwireId": "TW-ALPHA",
    "objectId": "TRK-001"
  }
}
```

### 5. `POST /api/threat/calculate`
Calculates deterministic 0-100 risk score and XAI explanation factors.

---

## 📂 Architecture Overview

```
backend/
├── app/
│   ├── main.py                  # FastAPI entrypoint & CORS middleware
│   ├── api/
│   │   ├── endpoints.py         # REST routing (/health, /detection, /tripwire, /threat)
│   ├── ai/
│   │   ├── detection.py         # YOLODetector, MockDetectionAdapter, Centroid, Normalization
│   │   ├── tripwire.py          # CCW line intersection, crossing direction, TripwireManager
│   ├── models/
│   │   ├── schemas.py           # Shared data classes & Pydantic schemas
│   ├── services/
│   │   ├── detection_service.py # Unified inference service
│   │   ├── tripwire_service.py  # Spatial perimeter manager service
│   │   ├── threat_service.py    # Deterministic threat scoring & XAI engine
│   └── tests/
│       ├── test_detection.py    # Centroid & classification tests
│       ├── test_tripwire.py     # 6+ Geometry & directional breach tests
│       ├── test_threat.py       # Threat score & XAI factor tests
│       └── test_api.py          # FastAPI endpoint integration tests
├── ai/                          # Compatibility proxies
├── requirements.txt             # Project dependencies
└── README.md                    # Documentation
```
