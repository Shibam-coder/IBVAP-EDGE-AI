# AI Processing Layer Output Contract

**Target Module**: `backend/ai/` and `backend/app/ai/`  
**Author**: Pratyush (AI/CV Backend Lead)  
**Consumer**: Bunty (FastAPI / WebSocket Backend Lead) & Shibam (Frontend Lead)

---

## 1. Detection Contract (`DetectionResult` / `DetectionItem`)

Each detection item returned by `detect_frame` or `process_scenario` conforms to:

```json
{
  "id": "det_3a9f01c2",
  "object_id": "det_3a9f01c2",
  "object_type": "human",
  "category": "HUMAN",
  "confidence": 0.965,
  "bbox": {
    "x": 0.352,
    "y": 0.410,
    "width": 0.125,
    "height": 0.280
  },
  "centroid": {
    "x": 0.4145,
    "y": 0.550
  },
  "previous_centroid": {
    "x": 0.390,
    "y": 0.540
  },
  "speedKmH": 5.4,
  "speedMps": 1.5,
  "posture": "RUNNING",
  "camera_id": "CAM-01",
  "timestamp": "2026-08-30T06:30:00.000000+00:00"
}
```

### Supported Class Mapping
Only the following COCO classes are detected and normalized:
| Raw COCO Label | Normalized `object_type` | Normalized `category` |
| :--- | :--- | :--- |
| `person` | `human` | `HUMAN` |
| `car` | `vehicle` | `VEHICLE` |
| `truck` | `vehicle` | `VEHICLE` |
| `bus` | `vehicle` | `VEHICLE` |
| `motorcycle` / `motorbike` | `vehicle` | `VEHICLE` |

All other COCO classes (animals, objects, etc.) are filtered out by default unless explicitly configured.

---

## 2. Tripwire Breach Contract (`TripwireBreachEvent` / `TripwireResult`)

Emitted when an object centroid trajectory crosses a registered virtual tripwire:

```json
{
  "id": "evt_8b14a27d",
  "tripwireId": "TW-ALPHA",
  "tripwire_id": "TW-ALPHA",
  "cameraId": "CAM-01",
  "targetClass": "HUMAN",
  "crossingDirection": "INBOUND",
  "confidence": 0.965,
  "crossed": true,
  "objectId": "det_3a9f01c2",
  "object_id": "det_3a9f01c2",
  "timestamp": "2026-08-30T06:30:01.000000+00:00"
}
```

### Crossing Direction Determination
- `INBOUND`: Movement follows the positive normal vector of the directed tripwire line segment.
- `OUTBOUND`: Movement opposes the normal vector.
- `UNKNOWN`: Parallel motion or stationary centroid.

---

## 3. Mathematical Centroid Calculation

The centroid $(c_x, c_y)$ is derived deterministically from the normalized bounding box:

$$c_x = x + \frac{\text{width}}{2}$$
$$c_y = y + \frac{\text{height}}{2}$$

Coordinates are normalized within $[0.0, 1.0]$.
