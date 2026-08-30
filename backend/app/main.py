"""
IBVAP-EDGE-AI: Edge AI/CV Backend Server
Lead: Pratyush (AI/CV Backend Lead)

Run command:
  uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from backend.app.api.endpoints import router as api_router
from backend.app.services.detection_service import detection_service

app = FastAPI(
    title="IBVAP-EDGE-AI Backend Service",
    description="Edge AI/CV Processing Layer for Human/Vehicle Detection, Tripwire Geometry, and Threat Analysis",
    version="1.0.0",
)

# CORS middleware for Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "IBVAP-EDGE-AI",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    """Top-level health check contract."""
    status = detection_service.get_status()
    return {
        "status": "ok",
        "service": "IBVAP-EDGE-AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "yolo_loaded": status.get("is_yolo_loaded", False),
    }


# Mount API routes under /api
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
